import uuid
from datetime import datetime

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, SQLModel


class ProductCategory(SQLModel, table=True):
    __tablename__ = "product_category"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    place_id: str = Field(index=True)
    parent_id: uuid.UUID | None = Field(default=None, index=True)
    name: str
    slug: str
    image_url: str | None = None
    sort_order: int = 0
    is_active: bool = True
    deleted_at: datetime | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    __table_args__ = (UniqueConstraint("place_id", "slug", name="uq_product_category_slug"),)
