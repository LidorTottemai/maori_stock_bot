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
    http_client: httpx.AsyncClient, settings: Settings
) -> tuple[str, str]:
    """Pick a city+category not scanned in the last 30 days that has results on Maps."""
    from datetime import timedelta
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
        if (city, category) in recent_set:
            logger.debug("Skipping recently scanned: %s / %s", city, category)
            continue
        businesses = await maps.search_businesses(
            category, city, settings, http_client, max_results=3
        )
        if any(b.website for b in businesses):
            logger.info("Found working combo at offset %d: %s / %s", offset, city, category)
            return city, category
        logger.info("No websites in %s / %s — trying next", city, category)
    # Fallback: first combo not recently scanned, even without websites
    for offset in range(len(CITIES) * len(ALL_CATEGORIES)):
        city = CITIES[(idx + offset) % len(CITIES)]
        category = ALL_CATEGORIES[(idx + offset) % len(ALL_CATEGORIES)]
        if (city, category) not in recent_set:
            return city, category
    return pick_todays_rotation()


def is_already_scanned(place_id: str, session: Session) -> bool:
    return session.get(Lead, place_id) is not None


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
    """Called by the APScheduler cron job. Auto-retries combinations until results found."""
    city, category = await find_working_rotation(http_client, settings)
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
        job.category, job.city, settings, http_client, max_results=20
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

        lead = _save_lead(
            session, biz, job,
            score=result.score,
            findings=result.findings,
            has_booking_system=result.has_booking_system,
            wordpress_version=result.wordpress_version,
        )

        if result.reachable and not result.has_booking_system and result.score >= settings.min_booking_score:
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

    # Always send top businesses with websites as individual cards with buttons
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
        text = (
            f"<b>{lead.name}</b>\n"
            f"ניקוד: {lead.score}/100 | {has_booking}\n"
            f"🌐 {lead.website}\n"
            f"📞 {lead.phone or '—'}\n"
            + (f"{findings}" if findings else "")
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
