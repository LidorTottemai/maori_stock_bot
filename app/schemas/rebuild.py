from datetime import datetime

from pydantic import BaseModel

from app.models.rebuild_job import RebuildStatus


class RebuildJobRead(BaseModel):
    id: str
    lead_place_id: str
    status: RebuildStatus
    current_phase: str | None
    queued_at: datetime
    started_at: datetime | None
    finished_at: datetime | None
    pages_found: int
    files_generated: int
    repo_url: str | None
    repo_name: str | None
    error: str | None

    model_config = {"from_attributes": True}


class RebuildQueuePage(BaseModel):
    items: list[RebuildJobRead]
    total: int
