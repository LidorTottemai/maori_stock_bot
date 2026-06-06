from datetime import datetime
from statistics import mean

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlmodel import Session, select

from app.core.database import get_session
from app.models.lead import Lead
from app.models.outreach_contact import OutreachContact, OutreachStage
from app.models.rebuild_job import RebuildJob, RebuildStatus

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

_ACTIVE = [
    RebuildStatus.scraping,
    RebuildStatus.researching,
    RebuildStatus.generating,
    RebuildStatus.pushing,
]


def _avg_build_minutes(session: Session) -> float:
    done = session.exec(
        select(RebuildJob)
        .where(RebuildJob.status == RebuildStatus.done)
        .where(RebuildJob.started_at.is_not(None))
        .where(RebuildJob.finished_at.is_not(None))
        .order_by(RebuildJob.finished_at.desc())
        .limit(10)
    ).all()
    if not done:
        return 20.0
    durations = [
        (j.finished_at - j.started_at).total_seconds() / 60
        for j in done
        if j.finished_at and j.started_at
    ]
    return mean(durations) if durations else 20.0


class StatsResponse(BaseModel):
    total_built: int
    total_queued: int
    in_progress: int
    total_leads: int
    total_outreach: int
    avg_build_minutes: float
    next_eta_minutes: float | None


class SiteItem(BaseModel):
    job_id: str
    lead_place_id: str
    lead_name: str
    category: str
    city: str
    vercel_url: str | None
    repo_url: str | None
    finished_at: datetime | None
    marketing_approved: bool


class SitesPage(BaseModel):
    items: list[SiteItem]
    total: int
    page: int
    size: int


class QueueItem(BaseModel):
    job_id: str
    lead_name: str
    lead_website: str
    status: RebuildStatus
    current_phase: str | None
    queued_at: datetime
    started_at: datetime | None
    queue_position: int
    eta_minutes: float


class OutreachItem(BaseModel):
    contact_id: str
    lead_name: str
    lead_email: str
    stage: OutreachStage
    last_sent_at: datetime | None
    days_since_last: int | None
    opted_out: bool
    city: str
    category: str


@router.get("/stats", response_model=StatsResponse)
def get_stats(session: Session = Depends(get_session)) -> StatsResponse:
    total_built = len(session.exec(
        select(RebuildJob).where(RebuildJob.status == RebuildStatus.done)
    ).all())
    total_queued = len(session.exec(
        select(RebuildJob).where(RebuildJob.status == RebuildStatus.queued)
    ).all())
    active_jobs = session.exec(
        select(RebuildJob).where(RebuildJob.status.in_(_ACTIVE))
    ).all()
    in_progress = len(active_jobs)
    total_leads = len(session.exec(select(Lead)).all())
    total_outreach = len(session.exec(
        select(OutreachContact).where(OutreachContact.opted_out == False)  # noqa: E712
    ).all())

    avg_min = _avg_build_minutes(session)

    # ETA for next queued job = remaining time on active + one avg cycle
    next_eta: float | None = None
    if active_jobs:
        active = active_jobs[0]
        elapsed = (datetime.utcnow() - active.started_at).total_seconds() / 60 if active.started_at else 0
        remaining = max(avg_min - elapsed, 0)
        next_eta = remaining
    elif total_queued:
        next_eta = avg_min

    return StatsResponse(
        total_built=total_built,
        total_queued=total_queued,
        in_progress=in_progress,
        total_leads=total_leads,
        total_outreach=total_outreach,
        avg_build_minutes=round(avg_min, 1),
        next_eta_minutes=round(next_eta, 1) if next_eta is not None else None,
    )


@router.get("/sites", response_model=SitesPage)
def get_sites(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    session: Session = Depends(get_session),
) -> SitesPage:
    jobs = session.exec(
        select(RebuildJob)
        .where(RebuildJob.status == RebuildStatus.done)
        .order_by(RebuildJob.finished_at.desc())
    ).all()
    total = len(jobs)
    paged = jobs[(page - 1) * size: page * size]

    items: list[SiteItem] = []
    for job in paged:
        lead = session.get(Lead, job.lead_place_id)
        if not lead:
            continue
        items.append(SiteItem(
            job_id=job.id,
            lead_place_id=job.lead_place_id,
            lead_name=lead.name,
            category=lead.category,
            city=lead.city,
            vercel_url=job.vercel_url,
            repo_url=job.repo_url,
            finished_at=job.finished_at,
            marketing_approved=lead.marketing_approved,
        ))

    return SitesPage(items=items, total=total, page=page, size=size)


@router.get("/queue", response_model=list[QueueItem])
def get_queue(session: Session = Depends(get_session)) -> list[QueueItem]:
    active_jobs = session.exec(
        select(RebuildJob)
        .where(RebuildJob.status.in_(_ACTIVE))
        .order_by(RebuildJob.started_at.asc())
    ).all()
    queued_jobs = session.exec(
        select(RebuildJob)
        .where(RebuildJob.status == RebuildStatus.queued)
        .order_by(RebuildJob.priority.desc(), RebuildJob.queued_at.asc())
    ).all()

    avg_min = _avg_build_minutes(session)

    # Remaining time on first active job
    remaining_active = 0.0
    if active_jobs:
        a = active_jobs[0]
        if a.started_at:
            elapsed = (datetime.utcnow() - a.started_at).total_seconds() / 60
            remaining_active = max(avg_min - elapsed, 0)

    result: list[QueueItem] = []
    position = 0

    for job in active_jobs:
        lead = session.get(Lead, job.lead_place_id)
        result.append(QueueItem(
            job_id=job.id,
            lead_name=lead.name if lead else job.lead_place_id,
            lead_website=lead.website if lead else "",
            status=job.status,
            current_phase=job.current_phase,
            queued_at=job.queued_at,
            started_at=job.started_at,
            queue_position=0,
            eta_minutes=round(remaining_active, 1),
        ))

    for i, job in enumerate(queued_jobs):
        lead = session.get(Lead, job.lead_place_id)
        position += 1
        eta = remaining_active + (i + 1) * avg_min
        result.append(QueueItem(
            job_id=job.id,
            lead_name=lead.name if lead else job.lead_place_id,
            lead_website=lead.website if lead else "",
            status=job.status,
            current_phase=job.current_phase,
            queued_at=job.queued_at,
            started_at=job.started_at,
            queue_position=position,
            eta_minutes=round(eta, 1),
        ))

    return result


@router.get("/outreach", response_model=list[OutreachItem])
def get_outreach(session: Session = Depends(get_session)) -> list[OutreachItem]:
    contacts = session.exec(
        select(OutreachContact)
        .where(OutreachContact.stage != OutreachStage.recycled)
        .order_by(OutreachContact.created_at.desc())
        .limit(50)
    ).all()

    result: list[OutreachItem] = []
    now = datetime.utcnow()

    for contact in contacts:
        lead = session.get(Lead, contact.lead_place_id)
        if not lead:
            continue
        last_sent = max(
            filter(None, [
                contact.initial_sent_at,
                contact.reminder_sent_at,
                contact.discount_sent_at,
                contact.final_sent_at,
            ]),
            default=None,
        )
        days_since = int((now - last_sent).days) if last_sent else None
        result.append(OutreachItem(
            contact_id=contact.id,
            lead_name=lead.name,
            lead_email=lead.email or "",
            stage=contact.stage,
            last_sent_at=last_sent,
            days_since_last=days_since,
            opted_out=contact.opted_out,
            city=lead.city,
            category=lead.category,
        ))

    return result
