import uuid
from datetime import datetime

from sqlalchemy import JSON, Column, UniqueConstraint
from sqlmodel import Field, SQLModel


class StaffUser(SQLModel, table=True):
    __tablename__ = "staff_user"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    place_id: str = Field(index=True)
    name: str
    email: str
    normalized_email: str
    hashed_password: str
    role: str  # owner | admin | manager | cashier | viewer
    is_active: bool = True
    failed_login_attempts: int = 0
    locked_until: datetime | None = None
    last_login: datetime | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("place_id", "normalized_email", name="uq_staff_email"),
    )


class StaffInvitation(SQLModel, table=True):
    __tablename__ = "staff_invitation"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    place_id: str = Field(index=True)
    email: str
    role: str
    token_hash: str = Field(index=True)  # SHA-256 of secret token
    expires_at: datetime
    used_at: datetime | None = None
    invited_by_staff_id: uuid.UUID


class StaffAuditLog(SQLModel, table=True):
    __tablename__ = "staff_audit_log"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    place_id: str = Field(index=True)
    staff_id: uuid.UUID
    action: str  # role_changed | user_disabled | order_status_changed | refund_issued
    target_id: str | None = None
    extra_data: dict = Field(default_factory=dict, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
