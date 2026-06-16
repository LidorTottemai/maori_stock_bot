import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import JSON, Column, Numeric, UniqueConstraint
from sqlmodel import Field, SQLModel


class Product(SQLModel, table=True):
    __tablename__ = "product"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    place_id: str = Field(index=True)
    slug: str
    name: str
    description: str | None = None
    price: Decimal = Field(sa_column=Column(Numeric(10, 2), nullable=False))
    compare_price: Decimal | None = Field(default=None, sa_column=Column(Numeric(10, 2)))
    cost: Decimal | None = Field(default=None, sa_column=Column(Numeric(10, 2)))
    currency: str = "ILS"
    sku: str | None = None
    barcode: str | None = None
    category_id: uuid.UUID | None = Field(default=None, index=True)
    product_type: str = "physical"  # physical | digital | service_voucher
    requires_shipping: bool = True
    image_urls: list = Field(default_factory=list, sa_column=Column(JSON))
    tags: list = Field(default_factory=list, sa_column=Column(JSON))
    track_inventory: bool = True
    stock: int = 0
    allow_backorder: bool = False
    weight_grams: int | None = None
    digital_asset_id: uuid.UUID | None = None
    is_active: bool = True
    deleted_at: datetime | None = None
    sort_order: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    __table_args__ = (UniqueConstraint("place_id", "slug", name="uq_product_slug"),)
