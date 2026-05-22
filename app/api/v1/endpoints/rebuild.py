import uuid
from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlmodel import Session, select

from app.core.config import Settings, get_settings
from app.core.database import get_session
from app.models.lead import Lead
from app.models.rebuild_job import RebuildJob, RebuildStatus
from app.schemas.rebuild import RebuildJobRead, RebuildQueuePage

router = APIRouter(prefix="/rebuild", tags=["rebuild"])

_ACTIVE_STATUSES = [
    RebuildStatus.queued,
    RebuildStatus.scraping,
    RebuildStatus.researching,
    RebuildStatus.generating,
    RebuildStatus.pushing,
]


@router.post("/queue/{place_id}", response_model=RebuildJobRead, status_code=201)
async def queue_rebuild(
    place_id: str,
    session: Session = Depends(get_session),
):
    """Add a lead to the rebuild queue."""
    lead = session.get(Lead, place_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    if not lead.website:
        raise HTTPException(status_code=422, detail="Lead has no website URL — cannot rebuild")

    existing = session.exec(
        select(RebuildJob)
        .where(RebuildJob.lead_place_id == place_id)
        .where(RebuildJob.status.in_(_ACTIVE_STATUSES))
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="A rebuild job is already active for this lead")

    job = RebuildJob(
        id=str(uuid.uuid4()),
        lead_place_id=place_id,
        queued_at=datetime.utcnow(),
    )
    session.add(job)
    session.commit()
    session.refresh(job)
    return RebuildJobRead.model_validate(job)


@router.get("/queue", response_model=RebuildQueuePage)
async def list_rebuild_queue(
    status: RebuildStatus | None = None,
    session: Session = Depends(get_session),
):
    """List rebuild jobs, optionally filtered by status."""
    query = select(RebuildJob).order_by(RebuildJob.queued_at.desc())
    if status:
        query = query.where(RebuildJob.status == status)
    jobs = session.exec(query).all()
    return RebuildQueuePage(
        items=[RebuildJobRead.model_validate(j) for j in jobs],
        total=len(jobs),
    )


@router.get("/{job_id}", response_model=RebuildJobRead)
async def get_rebuild_job(job_id: str, session: Session = Depends(get_session)):
    """Get a specific rebuild job by ID."""
    job = session.get(RebuildJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Rebuild job not found")
    return RebuildJobRead.model_validate(job)


@router.delete("/{job_id}", status_code=204)
async def delete_rebuild_job(job_id: str, session: Session = Depends(get_session)):
    """Delete a rebuild job (only if queued or done/failed)."""
    job = session.get(RebuildJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Rebuild job not found")
    if job.status in (RebuildStatus.scraping, RebuildStatus.researching,
                      RebuildStatus.generating, RebuildStatus.pushing):
        raise HTTPException(status_code=409, detail="Cannot delete a job that is currently running")
    session.delete(job)
    session.commit()


@router.post("/run-now", status_code=202)
async def run_rebuild_now(
    background_tasks: BackgroundTasks,
    settings: Settings = Depends(get_settings),
):
    """Trigger the rebuild queue processor immediately (for debugging)."""
    from app.main import app as _app
    from app.services.rebuilder import process_rebuild_queue

    background_tasks.add_task(process_rebuild_queue, _app.state.http_client, settings)
    return {"detail": "Rebuild queue processor started"}


@router.post("/send-report", status_code=202)
async def send_report_now(
    background_tasks: BackgroundTasks,
    settings: Settings = Depends(get_settings),
):
    """Send the daily Telegram report immediately (for debugging)."""
    from app.main import app as _app
    from app.services.daily_report import send_daily_report

    background_tasks.add_task(send_daily_report, _app.state.http_client, settings)
    return {"detail": "Daily report sending..."}
