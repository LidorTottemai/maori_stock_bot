"""Product CRUD and tenant isolation tests."""
import uuid
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.models.shop_product import Product
from tests.shop.conftest import PLACE_ID


def _auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def test_create_product(client: TestClient, owner_token: str):
    resp = client.post(
        "/api/v1/products/",
        json={
            "slug": "test-product",
            "name": "Test Product",
            "price": "99.99",
            "product_type": "physical",
        },
        headers=_auth_header(owner_token),
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["slug"] == "test-product"
    assert data["place_id"] == PLACE_ID


def test_list_products_public(client: TestClient):
    resp = client.get("/api/v1/products/")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_get_product_by_slug(client: TestClient, owner_token: str):
    client.post(
        "/api/v1/products/",
        json={"slug": "slug-test", "name": "Slug Product", "price": "10.00"},
        headers=_auth_header(owner_token),
    )
    resp = client.get("/api/v1/products/slug-test")
    assert resp.status_code == 200
    assert resp.json()["slug"] == "slug-test"


def test_soft_delete_product(client: TestClient, owner_token: str):
    from sqlmodel import Session
    from tests.shop.conftest import _test_engine

    resp = client.post(
        "/api/v1/products/",
        json={"slug": "to-delete", "name": "Delete Me", "price": "5.00"},
        headers=_auth_header(owner_token),
    )
    product_id = resp.json()["id"]

    del_resp = client.delete(f"/api/v1/products/{product_id}", headers=_auth_header(owner_token))
    assert del_resp.status_code == 200

    # Product should not appear in public listing
    resp = client.get("/api/v1/products/")
    slugs = [p["slug"] for p in resp.json()]
    assert "to-delete" not in slugs

    # But product still exists in DB (soft delete)
    with Session(_test_engine) as s:
        product = s.exec(
            select(Product).where(Product.id == uuid.UUID(product_id))
        ).first()
    assert product is not None
    assert product.deleted_at is not None


def test_cashier_cannot_create_product(client: TestClient):
    """RBAC: cashier role cannot write products."""
    import bcrypt
    from sqlmodel import Session
    from tests.shop.conftest import _test_engine
    from app.models.shop_staff import StaffUser
    from app.api.deps import create_staff_token

    hashed = bcrypt.hashpw(b"pass", bcrypt.gensalt()).decode()
    with Session(_test_engine) as s:
        cashier = StaffUser(
            place_id=PLACE_ID,
            name="Cashier",
            email="cashier@test.com",
            normalized_email="cashier@test.com",
            hashed_password=hashed,
            role="cashier",
        )
        s.add(cashier)
        s.commit()
        s.refresh(cashier)
        token = create_staff_token(cashier)

    resp = client.post(
        "/api/v1/products/",
        json={"slug": "cashier-product", "name": "X", "price": "1.00"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403


def test_duplicate_slug_rejected(client: TestClient, owner_token: str):
    client.post(
        "/api/v1/products/",
        json={"slug": "dup-slug", "name": "First", "price": "1.00"},
        headers=_auth_header(owner_token),
    )
    resp = client.post(
        "/api/v1/products/",
        json={"slug": "dup-slug", "name": "Second", "price": "1.00"},
        headers=_auth_header(owner_token),
    )
    assert resp.status_code == 409
