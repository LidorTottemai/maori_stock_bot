"""Shared fixtures for shop tests."""
import uuid

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select

# Import ALL models before anything else to populate SQLModel.metadata
import app.models.dashboard_user  # noqa: F401
import app.models.lead  # noqa: F401
import app.models.outreach_contact  # noqa: F401
import app.models.rebuild_job  # noqa: F401
import app.models.scan_job  # noqa: F401
import app.models.site  # noqa: F401
import app.models.shop_product_category  # noqa: F401
import app.models.shop_product  # noqa: F401
import app.models.shop_product_variant  # noqa: F401
import app.models.shop_inventory  # noqa: F401
import app.models.shop_order  # noqa: F401
import app.models.shop_payment  # noqa: F401
import app.models.shop_coupon  # noqa: F401
import app.models.shop_customer  # noqa: F401
import app.models.shop_staff  # noqa: F401
import app.models.shop_digital  # noqa: F401

from app.main import app
from app.core.database import get_session
from app.models.site import Site
from app.models.shop_staff import StaffUser
from app.api.deps import create_staff_token

PLACE_ID = "ChIJtest123"
HOSTNAME = "test-shop.local"

# StaticPool ensures all connections share the same in-memory SQLite DB
from sqlalchemy.pool import StaticPool
_test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
SQLModel.metadata.create_all(_test_engine)

# Seed site
with Session(_test_engine) as _s:
    if not _s.exec(select(Site).where(Site.place_id == PLACE_ID)).first():
        _s.add(Site(place_id=PLACE_ID, hostname=HOSTNAME))
        _s.commit()


def _override_get_session():
    with Session(_test_engine) as s:
        yield s


async def _override_public_place_id():
    return PLACE_ID


@pytest.fixture(name="session")
def session_fixture():
    with Session(_test_engine) as s:
        yield s


@pytest.fixture(name="client", autouse=False)
def client_fixture():
    from app.api.deps import get_public_place_id
    app.dependency_overrides[get_session] = _override_get_session
    app.dependency_overrides[get_public_place_id] = _override_public_place_id
    with TestClient(app, headers={"host": HOSTNAME}) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture(name="owner_token")
def owner_token_fixture():
    import bcrypt

    hashed = bcrypt.hashpw(b"password123", bcrypt.gensalt()).decode()
    with Session(_test_engine) as s:
        staff = s.exec(
            select(StaffUser).where(
                StaffUser.place_id == PLACE_ID,
                StaffUser.role == "owner",
            )
        ).first()
        if not staff:
            staff = StaffUser(
                place_id=PLACE_ID,
                name="Test Owner",
                email="owner@test.com",
                normalized_email="owner@test.com",
                hashed_password=hashed,
                role="owner",
            )
            s.add(staff)
            s.commit()
            s.refresh(staff)
        return create_staff_token(staff)
