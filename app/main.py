import logging
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.database import create_db_and_tables
from app.core.scheduler import setup_scheduler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    create_db_and_tables()
    logger.info("Database ready")

    async with httpx.AsyncClient(
        timeout=httpx.Timeout(15.0),
        follow_redirects=True,
    ) as client:
        app.state.http_client = client

        scheduler = setup_scheduler(app)
        scheduler.start()
        logger.info(
            "Scheduler started — daily scan at %02d:%02d",
            settings.daily_scan_hour,
            settings.daily_scan_minute,
        )

        yield

        scheduler.shutdown(wait=False)
        logger.info("Shutdown complete")


app = FastAPI(
    title="Business Lead Scanner",
    description=(
        "Scans local Israeli businesses via Google Places and detects manual booking patterns "
        "(phone/email/WhatsApp) to surface high-quality leads for web & booking-system sales."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(api_router, prefix="/api/v1")
