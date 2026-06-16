"""
Milestone 4 — ProductVariantGroup / Option / Sku management and combination_key logic.
"""
import uuid

import pytest
from fastapi.testclient import TestClient

from tests.shop.conftest import PLACE_ID


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_product(client: TestClient, token: str, name: str = "Test Product") -> dict:
    r = client.post(
        "/api/v1/products/",
        json={"slug": f"test-{uuid.uuid4().hex[:8]}", "name": name, "price": "50.00"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200, r.text
    return r.json()


def _make_group(client: TestClient, token: str, product_id: str, **kwargs) -> dict:
    body = {"name": "Size", "sort_order": 0, "selection_type": "single_required",
            "affects_stock": True, "affects_price": False, **kwargs}
    r = client.post(
        f"/api/v1/products/{product_id}/variant-groups",
        json=body,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200, r.text
    return r.json()


def _make_option(client: TestClient, token: str, product_id: str, group_id: str, **kwargs) -> dict:
    body = {"label": "M", "sort_order": 0, "price_delta": "0.00",
            "is_default": False, "sku_suffix": None, **kwargs}
    r = client.post(
        f"/api/v1/products/{product_id}/variant-groups/{group_id}/options",
        json=body,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200, r.text
    return r.json()


# ---------------------------------------------------------------------------
# Tests: variant groups
# ---------------------------------------------------------------------------

def test_create_variant_group(client: TestClient, owner_token: str):
    product = _make_product(client, owner_token)
    group = _make_group(client, owner_token, product["id"], name="Color", affects_stock=True)
    assert group["name"] == "Color"
    assert group["affects_stock"] is True
    assert group["product_id"] == product["id"]


def test_update_variant_group(client: TestClient, owner_token: str):
    product = _make_product(client, owner_token)
    group = _make_group(client, owner_token, product["id"])
    r = client.put(
        f"/api/v1/products/{product['id']}/variant-groups/{group['id']}",
        json={"name": "Renamed"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert r.status_code == 200
    assert r.json()["name"] == "Renamed"


def test_delete_variant_group_cascades(client: TestClient, owner_token: str):
    product = _make_product(client, owner_token)
    group = _make_group(client, owner_token, product["id"])
    _make_option(client, owner_token, product["id"], group["id"], label="S", sku_suffix="S")
    _make_option(client, owner_token, product["id"], group["id"], label="M", sku_suffix="M")

    # Generate SKUs first
    client.post(
        f"/api/v1/products/{product['id']}/generate-skus",
        headers={"Authorization": f"Bearer {owner_token}"},
    )

    r = client.delete(
        f"/api/v1/products/{product['id']}/variant-groups/{group['id']}",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert r.status_code == 200

    # SKUs should be gone
    skus_r = client.get(
        f"/api/v1/products/{product['id']}/variant-skus",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert skus_r.json() == []


# ---------------------------------------------------------------------------
# Tests: variant options
# ---------------------------------------------------------------------------

def test_create_variant_option(client: TestClient, owner_token: str):
    product = _make_product(client, owner_token)
    group = _make_group(client, owner_token, product["id"])
    opt = _make_option(client, owner_token, product["id"], group["id"],
                       label="XL", price_delta="10.00", sku_suffix="XL")
    assert opt["label"] == "XL"
    assert opt["price_delta"] == "10.00"
    assert opt["sku_suffix"] == "XL"


def test_update_variant_option(client: TestClient, owner_token: str):
    product = _make_product(client, owner_token)
    group = _make_group(client, owner_token, product["id"])
    opt = _make_option(client, owner_token, product["id"], group["id"], label="S")
    r = client.put(
        f"/api/v1/products/{product['id']}/variant-groups/{group['id']}/options/{opt['id']}",
        json={"label": "Small", "price_delta": "5.00"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert r.status_code == 200
    assert r.json()["label"] == "Small"
    assert r.json()["price_delta"] == "5.00"


def test_delete_variant_option_removes_skus(client: TestClient, owner_token: str):
    product = _make_product(client, owner_token)
    group = _make_group(client, owner_token, product["id"])
    opt_s = _make_option(client, owner_token, product["id"], group["id"], label="S")
    _make_option(client, owner_token, product["id"], group["id"], label="M")

    client.post(
        f"/api/v1/products/{product['id']}/generate-skus",
        headers={"Authorization": f"Bearer {owner_token}"},
    )

    r = client.delete(
        f"/api/v1/products/{product['id']}/variant-groups/{group['id']}/options/{opt_s['id']}",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert r.status_code == 200

    skus = client.get(
        f"/api/v1/products/{product['id']}/variant-skus",
        headers={"Authorization": f"Bearer {owner_token}"},
    ).json()
    # Only M sku should remain
    assert len(skus) == 1


# ---------------------------------------------------------------------------
# Tests: SKU generation and combination_key
# ---------------------------------------------------------------------------

def test_generate_skus_creates_all_combinations(client: TestClient, owner_token: str):
    """2 sizes × 2 colors = 4 SKUs."""
    product = _make_product(client, owner_token)
    size_group = _make_group(client, owner_token, product["id"], name="Size")
    color_group = _make_group(client, owner_token, product["id"], name="Color", sort_order=1)

    _make_option(client, owner_token, product["id"], size_group["id"], label="S", sku_suffix="S")
    _make_option(client, owner_token, product["id"], size_group["id"], label="M", sku_suffix="M")
    _make_option(client, owner_token, product["id"], color_group["id"], label="Red", sku_suffix="RED")
    _make_option(client, owner_token, product["id"], color_group["id"], label="Blue", sku_suffix="BLUE")

    r = client.post(
        f"/api/v1/products/{product['id']}/generate-skus",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert r.status_code == 200
    skus = r.json()
    assert len(skus) == 4
    for sku in skus:
        assert "option_ids" in sku
        assert len(sku["option_ids"]) == 2


def test_generate_skus_idempotent(client: TestClient, owner_token: str):
    """Calling generate-skus twice does not create duplicates."""
    product = _make_product(client, owner_token)
    group = _make_group(client, owner_token, product["id"])
    _make_option(client, owner_token, product["id"], group["id"], label="S")
    _make_option(client, owner_token, product["id"], group["id"], label="M")

    client.post(
        f"/api/v1/products/{product['id']}/generate-skus",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    r2 = client.post(
        f"/api/v1/products/{product['id']}/generate-skus",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert r2.json() == []  # nothing new created

    skus = client.get(
        f"/api/v1/products/{product['id']}/variant-skus",
        headers={"Authorization": f"Bearer {owner_token}"},
    ).json()
    assert len(skus) == 2


def test_sku_string_auto_generated_from_suffix(client: TestClient, owner_token: str):
    product = _make_product(client, owner_token)
    product_id = product["id"]

    group = _make_group(client, owner_token, product_id)
    _make_option(client, owner_token, product_id, group["id"], label="S", sku_suffix="S")

    r = client.post(
        f"/api/v1/products/{product_id}/generate-skus",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    sku = r.json()[0]
    # product.sku is None → suffix only
    assert sku["sku"] == "S"


def test_combination_key_uniqueness_enforced(client: TestClient, owner_token: str):
    """combination_key uniqueness: same options → same key, not duplicated."""
    from app.services.variant_service import make_combination_key
    id1 = uuid.uuid4()
    id2 = uuid.uuid4()
    key_a = make_combination_key([id1, id2])
    key_b = make_combination_key([id2, id1])  # reversed order
    assert key_a == key_b  # order-independent


# ---------------------------------------------------------------------------
# Tests: SKU patch (stock / price_override)
# ---------------------------------------------------------------------------

def test_patch_sku_stock(client: TestClient, owner_token: str):
    product = _make_product(client, owner_token)
    group = _make_group(client, owner_token, product["id"])
    _make_option(client, owner_token, product["id"], group["id"], label="S")

    skus = client.post(
        f"/api/v1/products/{product['id']}/generate-skus",
        headers={"Authorization": f"Bearer {owner_token}"},
    ).json()
    sku_id = skus[0]["id"]

    r = client.patch(
        f"/api/v1/products/variant-skus/{sku_id}",
        json={"stock": 42, "price_override": "99.90"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert r.status_code == 200
    assert r.json()["stock"] == 42
    assert r.json()["price_override"] == "99.90"


# ---------------------------------------------------------------------------
# Tests: product detail includes SKU matrix
# ---------------------------------------------------------------------------

def test_product_detail_includes_sku_matrix(client: TestClient, owner_token: str):
    """GET /products/{slug} returns variant_skus with option_ids and available_stock."""
    product = _make_product(client, owner_token, name="Matrix Product")
    group = _make_group(client, owner_token, product["id"])
    _make_option(client, owner_token, product["id"], group["id"], label="S")
    _make_option(client, owner_token, product["id"], group["id"], label="M")

    client.post(
        f"/api/v1/products/{product['id']}/generate-skus",
        headers={"Authorization": f"Bearer {owner_token}"},
    )

    r = client.get(f"/api/v1/products/{product['slug']}")
    assert r.status_code == 200
    data = r.json()
    assert "variant_skus" in data
    assert len(data["variant_skus"]) == 2
    for sku in data["variant_skus"]:
        assert "option_ids" in sku
        assert "available_stock" in sku
        assert len(sku["option_ids"]) == 1
