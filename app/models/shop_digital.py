import uuid
from datetime import datetime

from sqlmodel import Field, SQLModel


class DigitalDownloadGrant(SQLModel, table=True):
    __tablename__ = "digital_download_grant"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    order_item_id: uuid.UUID = Field(index=True)
    token_hash: str = Field(index=True)  # SHA-256 of random token
    expires_at: datetime
    max_downloads: int = 5
    downloads_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
