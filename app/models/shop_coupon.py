import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import JSON, Column, Numeric, UniqueConstraint
from sqlmodel import Field, SQLModel


class Coupon(SQLModel, table=True):
    __tablename__ = "coupon"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    place_id: str = Field(index=True)
    code: str
    discount_type: str  # percent | fixed
    discount_value: Decimal = Field(sa_column=Column(Numeric(10, 2), nullable=False))
    min_order: Decimal = Field(default=Decimal("0"), sa_column=Column(Numeric(10, 2)))
    max_discount: Decimal | None = Field(default=None, sa_column=Column(Numeric(10, 2)))
    starts_at: datetime | None = None
    expires_at: datetime | None = None
    max_uses: int | None = None
    per_customer_limit: int | None = None
    applies_to_all_products: bool = True
    applicable_product_ids: list = Field(default_factory=list, sa_column=Column(JSON))
    applicable_category_ids: list = Field(default_factory=list, sa_column=Column(JSON))
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    __table_args__ = (UniqueConstraint("place_id", "code", name="uq_coupon_code"),)


class CouponRedemption(SQLModel, table=True):
    """Replaces uses_count counter — single source of truth for coupon usage."""

    __tablename__ = "coupon_redemption"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    place_id: str = Field(index=True)
    coupon_id: uuid.UUID = Field(index=True)
    order_id: uuid.UUID = Field(index=True)
    customer_id: uuid.UUID | None = None
    customer_identifier: str | None = None  # email or phone for per_customer_limit
    discount_amount: Decimal = Field(sa_column=Column(Numeric(10, 2), nullable=False))
    status: str = "reserved"  # reserved | consumed | reversed
    created_at: datetime = Field(default_factory=datetime.utcnow)
