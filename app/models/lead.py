import json
from datetime import datetime

from sqlalchemy import Column, Text
from sqlmodel import Field, SQLModel


class Lead(SQLModel, table=True):
    __tablename__ = "lead"

    place_id: str = Field(primary_key=True)
    name: str
    address: str = ""
    phone: str = ""
    website: str = ""
    rating: float | None = None
    reviews: int | None = None
    score: int = 0
    findings_json: str = Field(default="[]", sa_column=Column(Text, nullable=False, default="[]"))
    wordpress_version: str | None = None
    city: str = ""
    category: str = ""
    has_booking_system: bool = False
    scan_job_id: str | None = Field(default=None, foreign_key="scan_job.id")
    scanned_at: datetime = Field(default_factory=datetime.utcnow)
    marketing_approved: bool = Field(default=False)
    marketing_approved_at: datetime | None = None
    email: str = ""

    @property
    def findings(self) -> list[str]:
        return json.loads(self.findings_json)
