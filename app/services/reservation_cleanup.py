"""APScheduler job to release expired inventory reservations."""
import logging
from datetime import datetime

from sqlalchemy import text, update

from app.core.database import get_engine
from app.models.shop_inventory import InventoryReservation

logger = logging.getLogger(__name__)

_ADVISORY_LOCK_ID = 1_234_567_890


def release_expired_reservations() -> None:
    """
    Release expired reservations.
    Uses pg_try_advisory_lock on PostgreSQL to prevent duplicate runs across workers.
    On SQLite (dev), the lock step is skipped.
    """
    engine = get_engine()
    is_postgres = "postgresql" in str(engine.url)

    with engine.connect() as conn:
        if is_postgres:
            acquired = conn.execute(
                text("SELECT pg_try_advisory_xact_lock(:lock_id)"),
                {"lock_id": _ADVISORY_LOCK_ID},
            ).scalar()
            if not acquired:
                return  # Another worker is already running cleanup

        now = datetime.utcnow()
        result = conn.execute(
            text(
                "UPDATE inventory_reservation "
                "SET released_at = :now "
                "WHERE released_at IS NULL AND expires_at < :now"
            ),
            {"now": now},
        )
        conn.commit()
        if result.rowcount:
            logger.info("Released %d expired inventory reservations", result.rowcount)
