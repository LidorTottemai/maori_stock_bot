import logging
from datetime import datetime

import httpx
from sqlmodel import Session, select

from app.core.config import Settings
from app.core.database import get_engine
from app.models.lead import Lead
from app.models.rebuild_job import RebuildJob, RebuildStatus
from app.services.competitor_researcher import CompetitorInsights, research_competitors
from app.services.github_client import create_repo_and_push
from app.services.playwright_inspector import crawl_site
from app.services.site_generator import generate_site

logger = logging.getLogger(__name__)


def _update_job(job_id: str, **kwargs) -> None:
    with Session(get_engine()) as session:
        job = session.get(RebuildJob, job_id)
        if job:
            for k, v in kwargs.items():
                setattr(job, k, v)
            session.add(job)
            session.commit()


async def run_rebuild_job(job_id: str, http_client: httpx.AsyncClient, settings: Settings) -> None:
    with Session(get_engine()) as session:
        job = session.get(RebuildJob, job_id)
        if not job:
            logger.error("RebuildJob %s not found", job_id)
            return
        lead = session.get(Lead, job.lead_place_id)
        if not lead or not lead.website:
            _update_job(job_id, status=RebuildStatus.failed, error="Lead has no website URL")
            return
        lead_website = lead.website
        lead_category = lead.category or "עסק"
        lead_name = lead.name

    _update_job(
        job_id,
        status=RebuildStatus.scraping,
        started_at=datetime.utcnow(),
        current_phase="סורק את האתר הקיים...",
    )

    try:
        site_map = await crawl_site(lead_website)
        _update_job(
            job_id,
            pages_found=site_map.total_pages,
            current_phase=f"נסרקו {site_map.total_pages} דפים. מחקר מתחרים...",
        )
    except Exception as exc:
        logger.exception("Scraping failed for job %s", job_id)
        _update_job(
            job_id,
            status=RebuildStatus.failed,
            error=f"Scraping error: {exc}",
            finished_at=datetime.utcnow(),
        )
        return

    _update_job(
        job_id,
        status=RebuildStatus.researching,
        current_phase="מנתח מתחרים מובילים בתחום...",
    )

    try:
        insights = await research_competitors(lead_category, http_client, settings)
    except Exception as exc:
        logger.warning("Competitor research failed (non-fatal): %s", exc)
        insights = CompetitorInsights(
            design_patterns=["Mobile-first", "Clear CTA", "WhatsApp button"],
            color_trends=["Modern brand palette"],
            must_have_sections=["Hero", "Services", "Booking", "Footer"],
            booking_ux="Date picker form with WhatsApp confirmation",
            summary_for_claude="No competitor data — apply best-practice defaults.",
        )

    _update_job(
        job_id,
        status=RebuildStatus.generating,
        current_phase="Claude בונה את האתר...",
    )

    try:
        files = await generate_site(site_map, insights, lead_category, settings)
        _update_job(
            job_id,
            files_generated=len(files),
            current_phase=f"נוצרו {len(files)} קבצים. מעלה ל-GitHub...",
        )
    except Exception as exc:
        logger.exception("Site generation failed for job %s", job_id)
        _update_job(
            job_id,
            status=RebuildStatus.failed,
            error=f"Generation error: {exc}",
            finished_at=datetime.utcnow(),
        )
        return

    _update_job(job_id, status=RebuildStatus.pushing, current_phase="מעלה קבצים ל-GitHub...")

    try:
        business_name = site_map.business_name or lead_name
        repo_url, repo_name = await create_repo_and_push(business_name, files, settings, http_client)
        _update_job(
            job_id,
            status=RebuildStatus.done,
            repo_url=repo_url,
            repo_name=repo_name,
            current_phase="הושלם בהצלחה!",
            finished_at=datetime.utcnow(),
        )
        logger.info("Rebuild complete for '%s' → %s", lead_name, repo_url)
    except Exception as exc:
        logger.exception("GitHub push failed for job %s", job_id)
        _update_job(
            job_id,
            status=RebuildStatus.failed,
            error=f"GitHub push error: {exc}",
            finished_at=datetime.utcnow(),
        )


async def process_rebuild_queue(http_client: httpx.AsyncClient, settings: Settings) -> None:
    with Session(get_engine()) as session:
        jobs = session.exec(
            select(RebuildJob)
            .where(RebuildJob.status == RebuildStatus.queued)
            .order_by(RebuildJob.queued_at)
            .limit(settings.rebuild_daily_limit)
        ).all()
        job_ids = [j.id for j in jobs]

    logger.info("Daily rebuild: processing %d queued jobs", len(job_ids))
    for job_id in job_ids:
        await run_rebuild_job(job_id, http_client, settings)
