"""Order creation: idempotency, server-side total, inventory reservation."""
import uuid

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.models.shop_inventory import InventoryReservation
from app.models.shop_order import ShopOrder
from app.models.shop_product import Product
from tests.shop.conftest import PLACE_ID


def _create_product(client: TestClient, token: str, slug: str, price: str, stock: int = 10):
    resp = client.post(
        "/api/v1/products/",
        json={"slug": slug, "name": slug, "price": price, "stock": stock},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    return resp.json()["id"]


def _order_payload(product_id: str, qty: int = 1) -> dict:
    return {
        "customer_name": "Test User",
        "customer_email": "test@example.com",
        "customer_phone": "0501234567",
        "order_type": "pickup",
        "payment_mode": "tranzila",
        "items": [{"product_id": product_id, "quantity": qty}],
    }


def test_create_order_basic(client: TestClient, owner_token: str):
    product_id = _create_product(client, owner_token, "order-prod-1", "50.00")
    resp = client.post("/api/v1/shop-orders/", json=_order_payload(product_id))
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["payment_status"] == "pending"
    assert data["fulfillment_status"] == "unfulfilled"
    assert data["order_status"] == "open"
    assert data["place_id"] == PLACE_ID


def test_order_total_computed_server_side(client: TestClient, owner_token: str):
    """Cannot inject total from browser — server computes it from product prices."""
    product_id = _create_product(client, owner_token, "price-test", "100.00")
    resp = client.post("/api/v1/shop-orders/", json=_order_payload(product_id, qty=2))
    assert resp.status_code == 200
    assert resp.json()["total"] == "200.00"


def test_order_idempotency(client: TestClient, owner_token: str):
    """Same Idempotency-Key returns existing order, no duplicate."""
    from sqlmodel import Session
    from tests.shop.conftest import _test_engine

    product_id = _create_product(client, owner_token, "idempotent-prod", "30.00")
    key = str(uuid.uuid4())

    resp1 = client.post(
        "/api/v1/shop-orders/",
        json=_order_payload(product_id),
        headers={"Idempotency-Key": key},
    )
    resp2 = client.post(
        "/api/v1/shop-orders/",
        json=_order_payload(product_id),
        headers={"Idempotency-Key": key},
    )
    assert resp1.status_code == 200
    assert resp2.status_code == 200
    assert resp1.json()["id"] == resp2.json()["id"]

    # Only one order should exist
    with Session(_test_engine) as s:
        orders = s.exec(
            select(ShopOrder).where(ShopOrder.checkout_idempotency_key == key)
        ).all()
    assert len(orders) == 1


def test_reservation_created(client: TestClient, owner_token: str):
    """Creating an order should create an InventoryReservation."""
    from sqlmodel import Session
    from tests.shop.conftest import _test_engine

    product_id = _create_product(client, owner_token, "reserve-prod", "20.00", stock=5)
    resp = client.post("/api/v1/shop-orders/", json=_order_payload(product_id, qty=2))
    assert resp.status_code == 200
    order_id = resp.json()["id"]

    with Session(_test_engine) as s:
        reservations = s.exec(
            select(InventoryReservation).where(
                InventoryReservation.order_id == uuid.UUID(order_id)
            )
        ).all()
    assert len(reservations) == 1
    assert reservations[0].quantity == 2


def test_oversell_prevented(client: TestClient, owner_token: str):
    """Cannot order more than available stock."""
    product_id = _create_product(client, owner_token, "low-stock-prod", "10.00", stock=2)
    resp = client.post("/api/v1/shop-orders/", json=_order_payload(product_id, qty=5))
    assert resp.status_code == 409


def test_public_tracking(client: TestClient, owner_token: str):
    """Public tracking endpoint returns minimal DTO."""
    product_id = _create_product(client, owner_token, "track-prod", "15.00")
    order_resp = client.post("/api/v1/shop-orders/", json=_order_payload(product_id))
    token = order_resp.json()["public_tracking_token"]

    resp = client.get(f"/api/v1/shop-orders/track/{token}")
    assert resp.status_code == 200
    data = resp.json()
    assert "order_number" in data
    assert "customer_email" not in data  # PII must not be exposed
    assert "customer_phone" not in data
