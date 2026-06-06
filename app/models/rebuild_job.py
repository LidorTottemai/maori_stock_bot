import uuid
from datetime import datetime
from enum import Enum

from sqlmodel import Field, SQLModel


class RebuildStatus(str, Enum):
    queued = "queued"
    scraping = "scraping"
    researching = "researching"
    generating = "generating"
    pushing = "pushing"
    done = "done"
    failed = "failed"


class RebuildJob(SQLModel, table=True):
    __tablename__ = "rebuild_job"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    lead_place_id: str = Field(foreign_key="lead.place_id", index=True)
    status: RebuildStatus = RebuildStatus.queued
    current_phase: str | None = None
    queued_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: datetime | None = None
    finished_at: datetime | None = None
    pages_found: int = 0
    files_generated: int = 0
    repo_url: str | None = None
    repo_name: str | None = None
    vercel_url: str | None = None
    fix_prompt: str | None = None
    priority: int = Field(default=0)
    error: str | None = None
