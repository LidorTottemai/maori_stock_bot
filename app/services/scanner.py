"""
Scan orchestration service.
Ties together Maps → Analyzer → DB persistence → Telegram notification.
"""

import json
import logging
from datetime import date, datetime

import httpx
from sqlmodel import Session, select

from app.core.config import ALL_CATEGORIES, CITIES, Settings
from app.core.database import get_engine
from app.models.lead import Lead
from app.models.scan_job import ScanJob, ScanStatus
from app.services import analyzer, maps, telegram

logger = logging.getLogger(__name__)


def pick_todays_rotation() -> tuple[str, str]:
    """Deterministic city + category for today based on date ordinal."""
    idx = date.today().toordinal()
    return CITIES[idx % len(CITIES)], ALL_CATEGORIES[idx % len(ALL_CATEGORIES)]


async def find_working_rotation(
    http_client: httpx.AsyncClient,
    settings: Settings,
    exclude: list[tuple[str, str]] | None = None,
) -> tuple[str, str]:
    """Pick a city+category not scanned in the last 30 days that has results on Maps."""
    from datetime import timedelta
    exclude = exclude or []
    cutoff = datetime.utcnow() - timedelta(days=30)

    with Session(get_engine()) as session:
        recent = session.exec(
            select(ScanJob.city, ScanJob.category)
            .where(ScanJob.started_at >= cutoff)
        ).all()
    recent_set = {(c, cat) for c, cat in recent}

    idx = date.today().toordinal()
    for offset in range(len(CITIES) * len(ALL_CATEGORIES)):
        city = CITIES[(idx + offset) % len(CITIES)]
        category = ALL_CATEGORIES[(idx + offset) % len(ALL_CATEGORIES)]
        if (city, category) in recent_set or (city, category) in exclude:
            logger.debug("Skipping: %s / %s", city, category)
            continue
        businesses = await maps.search_businesses(
            category, city, settings, http_client, max_results=3
        )
        if any(b.website for b in businesses):
            logger.info("Found working combo at offset %d: %s / %s", offset, city, category)
            return city, category
        logger.info("No websites in %s / %s — trying next", city, category)

    # Fallback: first combo not recently scanned and not excluded
    for offset in range(len(CITIES) * len(ALL_CATEGORIES)):
        city = CITIES[(idx + offset) % len(CITIES)]
        category = ALL_CATEGORIES[(idx + offset) % len(ALL_CATEGORIES)]
        if (city, category) not in recent_set and (city, category) not in exclude:
            return city, category
    return pick_todays_rotation()


def is_already_scanned(place_id: str, session: Session) -> bool:
    return session.get(Lead, place_id) is not None


def _maps_score_adjustment(rating: float | None, reviews: int | None) -> tuple[int, list[str]]:
    """Bonus/penalty based on Google Maps social proof."""
    if rating is None or reviews is None:
        return 0, []
    if reviews < 5:
        return -15, [f"⚠️ מעט ביקורות ({reviews}) — עסק לא פעיל (-15)"]
    if reviews >= 20 and rating >= 4.0:
        return 20, [f"⭐ {rating}/5 | {reviews} ביקורות — עסק פעיל (+20)"]
    if reviews >= 10:
        return 10, [f"⭐ {rating}/5 | {reviews} ביקורות (+10)"]
    return 0, []


async def run_scan_job(
    job_id: str,
    http_client: httpx.AsyncClient,
    settings: Settings,
) -> None:
    """Background task: executes the full scan pipeline for a ScanJob row."""
    with Session(get_engine()) as session:
        job = session.get(ScanJob, job_id)
        if not job:
            logger.error("ScanJob %s not found", job_id)
            return

        job.status = ScanStatus.running
        session.add(job)
        session.commit()

        try:
            await _execute(job, session, http_client, settings)
        except Exception as exc:
            logger.exception("Scan job %s failed: %s", job_id, exc)
            job.status = ScanStatus.failed
            job.error = str(exc)
            job.finished_at = datetime.utcnow()
            session.add(job)
            session.commit()


async def run_daily_scan(http_client: httpx.AsyncClient, settings: Settings) -> None:
    """Called by the APScheduler cron job. Runs daily_combos city+category pairs."""
    picked: list[tuple[str, str]] = []
    for _ in range(settings.daily_combos):
        city, category = await find_working_rotation(http_client, settings, exclude=picked)
        picked.append((city, category))
        logger.info("Daily scan combo: %s / %s", city, category)

    for city, category in picked:
        with Session(get_engine()) as session:
            job = ScanJob(city=city, category=category, dry_run=False)
            session.add(job)
            session.commit()
            session.refresh(job)

        await run_scan_job(job.id, http_client, settings)


async def _execute(
    job: ScanJob,
    session: Session,
    http_client: httpx.AsyncClient,
    settings: Settings,
) -> None:
    businesses = await maps.search_businesses(
        job.category, job.city, settings, http_client, max_results=60
    )
    job.businesses_found = len(businesses)
    session.add(job)
    session.commit()

    qualifying_leads: list[Lead] = []
    scanned_count = 0

    for biz in businesses:
        if is_already_scanned(biz.place_id, session):
            logger.debug("Skipping already-scanned: %s", biz.name)
            continue

        if not biz.website:
            _save_lead(session, biz, job, score=0, findings=[], has_booking_system=False)
            continue

        logger.info("Analyzing: %s — %s", biz.name, biz.website)
        scanned_count += 1
        result = await analyzer.analyze(biz.website, http_client)

        adj, adj_notes = _maps_score_adjustment(biz.rating, biz.reviews)
        total_score = result.score + adj
        combined_findings = result.findings + adj_notes

        lead = _save_lead(
            session, biz, job,
            score=total_score,
            findings=combined_findings,
            has_booking_system=result.has_booking_system,
            wordpress_version=result.wordpress_version,
        )

        if result.reachable and not result.has_booking_system and total_score >= settings.min_booking_score:
            qualifying_leads.append(lead)

    qualifying_leads.sort(key=lambda x: x.score, reverse=True)
    qualifying_leads = qualifying_leads[: settings.daily_limit]

    job.businesses_scanned = scanned_count
    job.leads_found = len(qualifying_leads)
    job.status = ScanStatus.done
    job.finished_at = datetime.utcnow()
    session.add(job)
    session.commit()

    if job.dry_run:
        return

    with Session(get_engine()) as s:
        all_with_website = s.exec(
            select(Lead)
            .where(Lead.scan_job_id == job.id)
            .where(Lead.website != "")
            .where(Lead.website.is_not(None))
            .order_by(Lead.score.desc())
            .limit(10)
        ).all()

    if not all_with_website:
        await telegram.notify(
            f"🔍 סריקה הושלמה — {job.city} / {job.category}\n"
            f"נסרקו {scanned_count} עסקים, אף אחד לא נמצא עם אתר.",
            settings, http_client,
        )
        return

    await telegram.notify(
        f"🔍 <b>סריקה הושלמה — {job.city} / {job.category}</b>\n"
        f"נסרקו {scanned_count} עסקים | {len(all_with_website)} עם אתר",
        settings, http_client,
    )
    for lead in all_with_website:
        has_booking = "✅ יש הזמנות" if lead.has_booking_system else "❌ אין הזמנות"
        findings = "\n".join(lead.findings[:2]) if lead.findings else ""
        stars = f"⭐ {lead.rating}/5 ({lead.reviews} ביקורות)" if lead.rating else ""
        text = (
            f"<b>{lead.name}</b>\n"
            f"ניקוד: {lead.score} | {has_booking}\n"
            + (f"{stars}\n" if stars else "")
            + f"🌐 {lead.website}\n"
            f"📞 {lead.phone or '—'}\n"
            + (findings if findings else "")
        )
        await telegram.send_card(
            text=text,
            keyboard=[[{"text": "🏗 בנה אתר", "callback_data": f"queue:{lead.place_id}"}]],
            settings=settings,
            client=http_client,
        )


def _save_lead(
    session: Session,
    biz: maps.BusinessInfo,
    job: ScanJob,
    *,
    score: int,
    findings: list[str],
    has_booking_system: bool,
    wordpress_version: str | None = None,
) -> Lead:
    lead = Lead(
        place_id=biz.place_id,
        name=biz.name,
        address=biz.address,
        phone=biz.phone,
        website=biz.website,
        rating=biz.rating,
        reviews=biz.reviews,
        score=score,
        findings_json=json.dumps(findings, ensure_ascii=False),
        has_booking_system=has_booking_system,
        wordpress_version=wordpress_version,
        city=job.city,
        category=job.category,
        scan_job_id=job.id,
    )
    session.add(lead)
    session.commit()
    session.refresh(lead)
    return lead
