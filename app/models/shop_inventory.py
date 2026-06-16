import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, Index
from sqlmodel import Field, SQLModel


class InventoryReservation(SQLModel, table=True):
    __tablename__ = "inventory_reservation"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    place_id: str = Field(index=True)
    product_id: uuid.UUID = Field(index=True)
    variant_sku_id: uuid.UUID | None = None
    order_id: uuid.UUID = Field(index=True)
    quantity: int
    reserved_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    released_at: datetime | None = None

    __table_args__ = (
        CheckConstraint("quantity > 0", name="chk_reservation_quantity_positive"),
        Index("ix_reservation_active_expiry", "expires_at", "released_at"),
    )
