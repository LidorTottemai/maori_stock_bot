import uuid
from datetime import datetime

from sqlalchemy import JSON, Column, Index
from sqlmodel import Field, SQLModel


class Customer(SQLModel, table=True):
    __tablename__ = "customer"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    place_id: str = Field(index=True)
    name: str
    email: str | None = None
    normalized_email: str | None = None  # lowercase stripped
    phone: str | None = None
    normalized_phone: str | None = None  # digits only
    address_default: dict | None = Field(default=None, sa_column=Column(JSON))
    marketing_consent: bool = False
    notes: str | None = None
    tags: list = Field(default_factory=list, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    __table_args__ = (
        # Partial unique index: only when normalized_email is set
        Index(
            "uq_customer_normalized_email",
            "place_id", "normalized_email",
            unique=True,
        ),
    )
