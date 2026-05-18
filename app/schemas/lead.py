import json
from datetime import datetime

from pydantic import BaseModel, model_validator


class LeadRead(BaseModel):
    place_id: str
    name: str
    address: str
    phone: str
    website: str
    rating: float | None
    reviews: int | None
    score: int
    findings: list[str]
    wordpress_version: str | None
    city: str
    category: str
    has_booking_system: bool
    scan_job_id: str | None
    scanned_at: datetime

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def _parse_findings(cls, data: object) -> object:
        # ORM objects expose findings_json; convert to findings list
        if hasattr(data, "findings_json") and not hasattr(data, "findings"):
            values = data.__dict__.copy()
            values["findings"] = json.loads(values.pop("findings_json", "[]"))
            return values
        return data


class LeadsPage(BaseModel):
    items: list[LeadRead]
    total: int
    page: int
    size: int
