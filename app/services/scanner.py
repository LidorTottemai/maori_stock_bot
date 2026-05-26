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
    """Try up to 15 combinations until one returns results from Google Maps."""
    idx = date.today().toordinal()
    for offset in range(15):
        city = CITIES[(idx + offset) % len(CITIES)]
        category = ALL_CATEGORIES[(idx + offset) % len(ALL_CATEGORIES)]
        businesses = await maps.search_businesses(
            category, city, settings, http_client, max_results=3
        )
        if businesses:
            logger.info("Found results at offset %d: %s / %s", offset, city, category)
            return city, category
        logger.info("No results for %s / %s — trying next", city, category)
    # Fallback to today's rotation even if empty
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

    if not job.dry_run:
        if qualifying_leads:
            await telegram.send_report(
                qualifying_leads, job.city, job.category, scanned_count, settings, http_client
            )
        else:
            await telegram.notify(
                f"🔍 סריקה הושלמה — {job.city} / {job.category}\n"
                f"נסרקו {scanned_count} עסקים, לא נמצאו לידים מעל הסף ({settings.min_booking_score}).",
                settings, http_client,
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
