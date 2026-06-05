from datetime import datetime

from sqlmodel import Field, SQLModel


class DashboardUser(SQLModel, table=True):
    __tablename__ = "dashboard_user"

    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
