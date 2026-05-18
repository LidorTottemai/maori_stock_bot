from typing import Annotated

import httpx
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from sqlmodel import Session, select

from app.core.config import ALL_CATEGORIES, CITIES, Settings, get_settings
from app.core.database import get_session
from app.models.scan_job import ScanJob, ScanStatus
from app.schemas.scan import RotationRead, ScanJobRead, ScanRequest
from app.services.scanner import pick_todays_rotation, run_scan_job

router = APIRouter(prefix="/scanner", tags=["scanner"])


def _get_http_client(request: Request) -> httpx.AsyncClient:
    return request.app.state.http_client


@router.post("/scan", response_model=ScanJobRead, status_code=202, summary="Trigger a scan")
async def trigger_scan(
    body: ScanRequest,
    background_tasks: BackgroundTasks,
    request: Request,
    session: Annotated[Session, Depends(get_session)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> ScanJobRead:
    city, category = body.city, body.category

    if bool(city) != bool(category):
        raise HTTPException(status_code=422, detail="Provide both city and category, or neither")

    if not city:
        city, category = pick_todays_rotation()

    if city not in CITIES:
        raise HTTPException(status_code=422, detail=f"Unknown city: {city}")
    if category not in ALL_CATEGORIES:
        raise HTTPException(status_code=422, detail=f"Unknown category: {category}")

    job = ScanJob(city=city, category=category, dry_run=body.dry_run)
    session.add(job)
    session.commit()
    session.refresh(job)

    http_client = _get_http_client(request)
    background_tasks.add_task(run_scan_job, job.id, http_client, settings)

    return ScanJobRead.model_validate(job)


@router.get("/scan/{scan_id}", response_model=ScanJobRead, summary="Get scan job status")
def get_scan_job(scan_id: str, session: Annotated[Session, Depends(get_session)]) -> ScanJobRead:
    job = session.get(ScanJob, scan_id)
    if not job:
        raise HTTPException(status_code=404, detail="Scan job not found")
    return ScanJobRead.model_validate(job)


@router.get("/scans", response_model=list[ScanJobRead], summary="List recent scan jobs")
def list_scan_jobs(
    session: Annotated[Session, Depends(get_session)],
    limit: int = 20,
) -> list[ScanJobRead]:
    jobs = session.exec(
        select(ScanJob).order_by(ScanJob.started_at.desc()).limit(limit)
    ).all()
    return [ScanJobRead.model_validate(j) for j in jobs]


@router.get("/rotation", response_model=RotationRead, summary="Today's rotation")
def get_rotation() -> RotationRead:
    city, category = pick_todays_rotation()
    return RotationRead(
        city=city,
        category=category,
        all_cities=CITIES,
        all_categories=ALL_CATEGORIES,
    )
