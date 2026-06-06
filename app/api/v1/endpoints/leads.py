from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, func, select

from app.core.database import get_session
from app.models.lead import Lead
from app.schemas.lead import LeadRead, LeadsPage

router = APIRouter(prefix="/leads", tags=["leads"])


@router.get("", response_model=LeadsPage, summary="List leads")
def list_leads(
    city: str | None = Query(None, description="Filter by city"),
    category: str | None = Query(None, description="Filter by category"),
    min_score: int = Query(0, ge=0, description="Minimum booking score"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    session: Session = Depends(get_session),
) -> LeadsPage:
    query = select(Lead).where(Lead.score >= min_score, Lead.has_booking_system == False)  # noqa: E712
    if city:
        query = query.where(Lead.city == city)
    if category:
        query = query.where(Lead.category == category)

    total = session.exec(select(func.count()).select_from(query.subquery())).one()
    items = session.exec(
        query.order_by(Lead.score.desc()).offset((page - 1) * size).limit(size)
    ).all()

    return LeadsPage(
        items=[LeadRead.model_validate(lead) for lead in items],
        total=total,
        page=page,
        size=size,
    )


@router.get("/{place_id}", response_model=LeadRead, summary="Get a single lead")
def get_lead(place_id: str, session: Session = Depends(get_session)) -> LeadRead:
    lead = session.get(Lead, place_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return LeadRead.model_validate(lead)


@router.post("/{place_id}/approve", response_model=LeadRead, summary="Approve lead for marketing")
def approve_lead(place_id: str, session: Session = Depends(get_session)) -> LeadRead:
    lead = session.get(Lead, place_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead.marketing_approved = True
    lead.marketing_approved_at = datetime.utcnow()
    session.add(lead)
    session.commit()
    session.refresh(lead)
    return LeadRead.model_validate(lead)


@router.delete("/{place_id}", status_code=204, summary="Delete a lead (allow re-scan)")
def delete_lead(place_id: str, session: Session = Depends(get_session)) -> None:
    lead = session.get(Lead, place_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    session.delete(lead)
    session.commit()
