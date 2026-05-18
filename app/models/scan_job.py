import uuid
from datetime import datetime
from enum import Enum

from sqlmodel import Field, SQLModel


class ScanStatus(str, Enum):
    pending = "pending"
    running = "running"
    done = "done"
    failed = "failed"


class ScanJob(SQLModel, table=True):
    __tablename__ = "scan_job"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    city: str
    category: str
    status: ScanStatus = ScanStatus.pending
    dry_run: bool = False
    started_at: datetime = Field(default_factory=datetime.utcnow)
    finished_at: datetime | None = None
    businesses_found: int = 0
    businesses_scanned: int = 0
    leads_found: int = 0
    error: str | None = None
