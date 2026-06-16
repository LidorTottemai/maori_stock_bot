import uuid
from datetime import datetime

from sqlmodel import Field, SQLModel


class Site(SQLModel, table=True):
    __tablename__ = "site"

    place_id: str = Field(primary_key=True)
    hostname: str = Field(unique=True, index=True)
    vercel_url: str = ""
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
