from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import get_settings

_engine = None


def get_engine():
    global _engine
    if _engine is None:
        settings = get_settings()
        _engine = create_engine(
            settings.db_url,
            connect_args={"check_same_thread": False},
        )
    return _engine


def create_db_and_tables() -> None:
    # Import models so SQLModel registers their metadata before create_all
    import app.models.lead  # noqa: F401
    import app.models.outreach_contact  # noqa: F401
    import app.models.rebuild_job  # noqa: F401
    import app.models.scan_job  # noqa: F401

    SQLModel.metadata.create_all(get_engine())


def get_session() -> Generator[Session, None, None]:
    with Session(get_engine()) as session:
        yield session
