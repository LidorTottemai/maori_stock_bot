from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session, text

from app.core.database import get_session

router = APIRouter(tags=["health"])


class HealthResponse(BaseModel):
    status: str
    db: str


@router.get("/health", response_model=HealthResponse, summary="Health check")
def health(session: Session = Depends(get_session)) -> HealthResponse:
    try:
        session.exec(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "error"
    return HealthResponse(status="ok", db=db_status)
