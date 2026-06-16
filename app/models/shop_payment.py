import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import JSON, Column, Index, Numeric, UniqueConstraint, text
from sqlmodel import Field, SQLModel


class PaymentAttempt(SQLModel, table=True):
    __tablename__ = "payment_attempt"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    place_id: str = Field(index=True)
    order_id: uuid.UUID = Field(index=True)
    provider: str  # tranzila | whatsapp | cash
    terminal: str | None = None
    amount: Decimal = Field(sa_column=Column(Numeric(10, 2), nullable=False))
    currency: str = "ILS"
    status: str = "initiated"  # initiated | paid | failed | refunded
    provider_transaction_id: str | None = None
    idempotency_key: str
    raw_response: dict | None = Field(default=None, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    confirmed_at: datetime | None = None
    refunded_at: datetime | None = None
    refund_amount: Decimal | None = Field(default=None, sa_column=Column(Numeric(10, 2)))

    __table_args__ = (
        UniqueConstraint(
            "place_id", "provider", "idempotency_key",
            name="uq_payment_attempt_idempotency",
        ),
        # Partial unique index: only when transaction ID is present (PostgreSQL)
        # SQLite will fall back to a regular non-unique index
        Index(
            "ix_payment_attempt_transaction",
            "provider", "terminal", "provider_transaction_id",
        ),
    )


class RefundAttempt(SQLModel, table=True):
    __tablename__ = "refund_attempt"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    place_id: str = Field(index=True)
    order_id: uuid.UUID = Field(index=True)
    payment_attempt_id: uuid.UUID
    amount: Decimal = Field(sa_column=Column(Numeric(10, 2), nullable=False))
    # pending | processing | succeeded | failed | verification_required
    status: str = "pending"
    idempotency_key: str = Field(unique=True)
    provider_refund_id: str | None = None
    failure_reason: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: datetime | None = None
