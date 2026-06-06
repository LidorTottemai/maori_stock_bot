from datetime import datetime

from pydantic import BaseModel

from app.models.scan_job import ScanStatus


class ScanRequest(BaseModel):
    city: str | None = None
    category: str | None = None
    dry_run: bool = False


class ScanJobRead(BaseModel):
    id: str
    city: str
    category: str
    status: ScanStatus
    dry_run: bool
    started_at: datetime
    finished_at: datetime | None
    businesses_found: int
    businesses_scanned: int
    leads_found: int
    error: str | None

    model_config = {"from_attributes": True}


class RotationRead(BaseModel):
    city: str
    category: str
    all_cities: list[str]
    all_categories: list[str]
