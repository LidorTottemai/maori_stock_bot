import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from fastapi import FastAPI

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def setup_scheduler(app: FastAPI) -> AsyncIOScheduler:
    settings = get_settings()
    scheduler = AsyncIOScheduler()

    async def _daily_scan_job() -> None:
        from app.services.scanner import run_daily_scan

        logger.info("Scheduled daily scan triggered")
        await run_daily_scan(
            http_client=app.state.http_client,
            settings=settings,
        )

    scheduler.add_job(
        _daily_scan_job,
        trigger=CronTrigger(hour=settings.daily_scan_hour, minute=settings.daily_scan_minute),
        id="daily_scan",
        replace_existing=True,
    )

    async def _daily_rebuild_job() -> None:
        from app.services.rebuilder import process_rebuild_queue

        logger.info("Scheduled daily rebuild triggered")
        await process_rebuild_queue(
            http_client=app.state.http_client,
            settings=settings,
        )

    scheduler.add_job(
        _daily_rebuild_job,
        trigger=CronTrigger(hour=settings.rebuild_scan_hour, minute=settings.rebuild_scan_minute),
        id="daily_rebuild",
        replace_existing=True,
    )

    return scheduler
