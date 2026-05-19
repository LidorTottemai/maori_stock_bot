import uuid
from datetime import datetime
from enum import Enum

from sqlmodel import Field, SQLModel


class OutreachStage(str, Enum):
    pending = "pending"
    initial = "initial"
    reminder = "reminder"
    discount = "discount"
    final = "final"


class OutreachContact(SQLModel, table=True):
    __tablename__ = "outreach_contact"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    lead_place_id: str = Field(foreign_key="lead.place_id", index=True)
    rebuild_job_id: str = Field(foreign_key="rebuild_job.id")
    site_password: str
    stage: OutreachStage = OutreachStage.pending
    created_at: datetime = Field(default_factory=datetime.utcnow)
    initial_sent_at: datetime | None = None
    reminder_sent_at: datetime | None = None
    discount_sent_at: datetime | None = None
    final_sent_at: datetime | None = None
