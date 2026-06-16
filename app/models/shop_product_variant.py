import uuid
from decimal import Decimal

from sqlalchemy import Column, Numeric, UniqueConstraint
from sqlmodel import Field, SQLModel


class ProductVariantGroup(SQLModel, table=True):
    __tablename__ = "product_variant_group"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    product_id: uuid.UUID = Field(index=True)
    name: str
    sort_order: int = 0
    selection_type: str = "single_required"  # single_required | single_optional | multi_optional
    affects_stock: bool = True   # False = addon (packaging, engraving) — no SKU combination
    affects_price: bool = True


class ProductVariantOption(SQLModel, table=True):
    __tablename__ = "product_variant_option"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    group_id: uuid.UUID = Field(index=True)
    label: str
    is_default: bool = False
    sort_order: int = 0
    price_delta: Decimal = Field(default=Decimal("0"), sa_column=Column(Numeric(10, 2)))
    sku_suffix: str | None = None  # "M", "RED" for SKU auto-generation


class ProductVariantSku(SQLModel, table=True):
    """One row per unique combination of affects_stock=True options."""

    __tablename__ = "product_variant_sku"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    product_id: uuid.UUID = Field(index=True)
    combination_key: str  # sorted hash of option IDs
    price_override: Decimal | None = Field(default=None, sa_column=Column(Numeric(10, 2)))
    stock: int = 0
    sku: str | None = None

    __table_args__ = (
        UniqueConstraint("product_id", "combination_key", name="uq_variant_sku_combination"),
    )


class ProductVariantSkuOption(SQLModel, table=True):
    """Many-to-many: ProductVariantSku → ProductVariantOption."""

    __tablename__ = "product_variant_sku_option"

    sku_id: uuid.UUID = Field(primary_key=True)
    option_id: uuid.UUID = Field(primary_key=True)
