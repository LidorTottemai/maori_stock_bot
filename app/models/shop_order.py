import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import JSON, Column, Index, Numeric, UniqueConstraint
from sqlmodel import Field, SQLModel


class ShopOrder(SQLModel, table=True):
    __tablename__ = "shop_order"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    place_id: str = Field(index=True)
    order_number: str  # ORD-YYYYMMDD-NNNN
    customer_id: uuid.UUID | None = None
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: dict | None = Field(default=None, sa_column=Column(JSON))  # None for pickup/digital
    order_type: str  # delivery | pickup | digital
    shipping_method_id: uuid.UUID | None = None

    # Server-computed amounts (never from browser)
    subtotal: Decimal = Field(sa_column=Column(Numeric(10, 2), nullable=False))
    discount: Decimal = Field(default=Decimal("0"), sa_column=Column(Numeric(10, 2)))
    shipping_fee: Decimal = Field(default=Decimal("0"), sa_column=Column(Numeric(10, 2)))
    tax_amount: Decimal = Field(default=Decimal("0"), sa_column=Column(Numeric(10, 2)))
    total: Decimal = Field(sa_column=Column(Numeric(10, 2), nullable=False))
    prices_include_tax: bool = True
    tax_rate: Decimal | None = Field(default=None, sa_column=Column(Numeric(5, 4)))
    coupon_code: str | None = None
    currency: str = "ILS"

    # 3 independent status fields
    order_status: str = "open"               # open | completed | cancelled
    payment_status: str = "pending"          # pending | paid | failed | partially_refunded | refunded
    fulfillment_status: str = "unfulfilled"  # unfulfilled | processing | ready | shipped | fulfilled

    payment_mode: str  # tranzila | whatsapp | cash
    paid_at: datetime | None = None

    # Idempotency for checkout (browser retry / double-submit)
    checkout_idempotency_key: str

    # Public tracking (no auth required)
    public_tracking_token: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        index=True,
        unique=True,
    )
    tracking_number: str | None = None
    notes: str | None = None
    metadata_json: dict = Field(default_factory=dict, sa_column=Column(JSON))

    cancelled_at: datetime | None = None
    cancellation_reason: str | None = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    __table_args__ = (
        Index(
            "uq_shop_order_checkout_idempotency",
            "place_id", "checkout_idempotency_key",
            unique=True,
        ),
    )


class ShopOrderItem(SQLModel, table=True):
    __tablename__ = "shop_order_item"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    order_id: uuid.UUID = Field(index=True)
    product_id: uuid.UUID
    product_name: str          # snapshot
    product_sku: str | None = None   # snapshot
    product_type: str = "physical"   # snapshot for digital grant creation
    unit_price: Decimal = Field(sa_column=Column(Numeric(10, 2), nullable=False))  # snapshot
    variant_sku_id: uuid.UUID | None = None
    variant_sku_snapshot: dict = Field(default_factory=dict, sa_column=Column(JSON))
    addon_selections: dict = Field(default_factory=dict, sa_column=Column(JSON))
    quantity: int
    discount_amount: Decimal = Field(default=Decimal("0"), sa_column=Column(Numeric(10, 2)))
    tax_amount: Decimal = Field(default=Decimal("0"), sa_column=Column(Numeric(10, 2)))
    item_total: Decimal = Field(sa_column=Column(Numeric(10, 2), nullable=False))
