"""Product catalog — public (read) and admin (write)."""
import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlmodel import Session, select

from app.api.deps import get_admin_place_id, get_public_place_id, require_roles
from app.core.database import get_session
from app.models.shop_product import Product
from app.models.shop_product_variant import (
    ProductVariantGroup,
    ProductVariantOption,
    ProductVariantSku,
    ProductVariantSkuOption,
)
from app.services.inventory_service import get_active_reserved_qty

router = APIRouter(prefix="/products", tags=["shop-products"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class ProductCreate(BaseModel):
    slug: str
    name: str
    description: str | None = None
    price: Decimal
    compare_price: Decimal | None = None
    cost: Decimal | None = None
    currency: str = "ILS"
    sku: str | None = None
    barcode: str | None = None
    category_id: uuid.UUID | None = None
    product_type: str = "physical"
    requires_shipping: bool = True
    image_urls: list[str] = []
    tags: list[str] = []
    track_inventory: bool = True
    stock: int = 0
    allow_backorder: bool = False
    weight_grams: int | None = None
    sort_order: int = 0


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: Decimal | None = None
    compare_price: Decimal | None = None
    cost: Decimal | None = None
    sku: str | None = None
    barcode: str | None = None
    category_id: uuid.UUID | None = None
    requires_shipping: bool | None = None
    image_urls: list[str] | None = None
    tags: list[str] | None = None
    is_active: bool | None = None
    sort_order: int | None = None


class StockUpdate(BaseModel):
    stock: int


# ---------------------------------------------------------------------------
# Public endpoints
# ---------------------------------------------------------------------------

@router.get("/")
def list_products(
    category_id: uuid.UUID | None = Query(default=None),
    tag: str | None = Query(default=None),
    search: str | None = Query(default=None),
    in_stock: bool | None = Query(default=None),
    place_id: str = Depends(get_public_place_id),
    session: Session = Depends(get_session),
) -> list[dict]:
    stmt = select(Product).where(
        Product.place_id == place_id,
        Product.is_active == True,
        Product.deleted_at.is_(None),
    )
    if category_id:
        stmt = stmt.where(Product.category_id == category_id)
    if search:
        stmt = stmt.where(Product.name.contains(search))
    if in_stock is True:
        stmt = stmt.where(Product.stock > 0)
    stmt = stmt.order_by(Product.sort_order, Product.created_at.desc())
    products = session.exec(stmt).all()

    result = []
    for p in products:
        reserved = get_active_reserved_qty(session, p.id) if p.track_inventory else 0
        d = p.model_dump()
        d["available_stock"] = max(0, p.stock - reserved)
        result.append(d)
    return result


@router.get("/{slug}")
def get_product(
    slug: str,
    place_id: str = Depends(get_public_place_id),
    session: Session = Depends(get_session),
) -> dict:
    product = session.exec(
        select(Product).where(
            Product.place_id == place_id,
            Product.slug == slug,
            Product.is_active == True,
            Product.deleted_at.is_(None),
        )
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    reserved = get_active_reserved_qty(session, product.id) if product.track_inventory else 0
    groups = session.exec(
        select(ProductVariantGroup)
        .where(ProductVariantGroup.product_id == product.id)
        .order_by(ProductVariantGroup.sort_order)
    ).all()

    groups_out = []
    for g in groups:
        options = session.exec(
            select(ProductVariantOption)
            .where(ProductVariantOption.group_id == g.id)
            .order_by(ProductVariantOption.sort_order)
        ).all()
        groups_out.append({**g.model_dump(), "options": [o.model_dump() for o in options]})

    return {
        **product.model_dump(),
        "available_stock": max(0, product.stock - reserved),
        "variant_groups": groups_out,
    }


# ---------------------------------------------------------------------------
# Admin endpoints
# ---------------------------------------------------------------------------

@router.post("/", dependencies=[Depends(require_roles("owner", "admin", "manager"))])
def create_product(
    body: ProductCreate,
    place_id: str = Depends(get_admin_place_id),
    session: Session = Depends(get_session),
) -> dict:
    existing = session.exec(
        select(Product).where(Product.place_id == place_id, Product.slug == body.slug)
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Slug '{body.slug}' already exists")

    product = Product(place_id=place_id, **body.model_dump())
    session.add(product)
    session.commit()
    session.refresh(product)
    return product.model_dump()


@router.put("/{product_id}", dependencies=[Depends(require_roles("owner", "admin", "manager"))])
def update_product(
    product_id: uuid.UUID,
    body: ProductUpdate,
    place_id: str = Depends(get_admin_place_id),
    session: Session = Depends(get_session),
) -> dict:
    product = session.exec(
        select(Product).where(Product.id == product_id, Product.place_id == place_id)
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(product, field, value)
    product.updated_at = datetime.utcnow()
    session.add(product)
    session.commit()
    session.refresh(product)
    return product.model_dump()


@router.patch("/{product_id}/stock", dependencies=[Depends(require_roles("owner", "admin", "manager"))])
def update_stock(
    product_id: uuid.UUID,
    body: StockUpdate,
    place_id: str = Depends(get_admin_place_id),
    session: Session = Depends(get_session),
) -> dict:
    product = session.exec(
        select(Product).where(Product.id == product_id, Product.place_id == place_id)
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.stock = body.stock
    product.updated_at = datetime.utcnow()
    session.add(product)
    session.commit()
    return {"id": str(product.id), "stock": product.stock}


@router.delete("/{product_id}", dependencies=[Depends(require_roles("owner", "admin", "manager"))])
def delete_product(
    product_id: uuid.UUID,
    place_id: str = Depends(get_admin_place_id),
    session: Session = Depends(get_session),
) -> dict:
    product = session.exec(
        select(Product).where(Product.id == product_id, Product.place_id == place_id)
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.deleted_at = datetime.utcnow()
    product.is_active = False
    product.updated_at = datetime.utcnow()
    session.add(product)
    session.commit()
    return {"deleted": True}
