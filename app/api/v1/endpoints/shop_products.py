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
from app.services.variant_service import bulk_generate_skus, get_sku_with_options

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


class VariantGroupCreate(BaseModel):
    name: str
    sort_order: int = 0
    selection_type: str = "single_required"
    affects_stock: bool = True
    affects_price: bool = True


class VariantGroupUpdate(BaseModel):
    name: str | None = None
    sort_order: int | None = None
    selection_type: str | None = None
    affects_stock: bool | None = None
    affects_price: bool | None = None


class VariantOptionCreate(BaseModel):
    label: str
    is_default: bool = False
    sort_order: int = 0
    price_delta: Decimal = Decimal("0")
    sku_suffix: str | None = None


class VariantOptionUpdate(BaseModel):
    label: str | None = None
    is_default: bool | None = None
    sort_order: int | None = None
    price_delta: Decimal | None = None
    sku_suffix: str | None = None


class VariantSkuPatch(BaseModel):
    stock: int | None = None
    price_override: Decimal | None = None
    sku: str | None = None


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

    skus_raw = get_sku_with_options(session, product.id)
    skus_out = []
    for s in skus_raw:
        sku_reserved = get_active_reserved_qty(
            session, product.id, uuid.UUID(str(s["id"]))
        ) if product.track_inventory else 0
        skus_out.append({**s, "available_stock": max(0, s["stock"] - sku_reserved)})

    return {
        **product.model_dump(),
        "available_stock": max(0, product.stock - reserved),
        "variant_groups": groups_out,
        "variant_skus": skus_out,
    }


# ---------------------------------------------------------------------------
# Admin endpoints
# ---------------------------------------------------------------------------

@router.get("/admin/", dependencies=[Depends(require_roles("owner", "admin", "manager", "cashier", "viewer"))])
def list_products_admin(
    search: str | None = Query(default=None),
    is_active: bool | None = Query(default=None),
    in_stock: bool | None = Query(default=None),
    limit: int = Query(default=100, le=500),
    offset: int = Query(default=0),
    place_id: str = Depends(get_admin_place_id),
    session: Session = Depends(get_session),
) -> list[dict]:
    """Admin product list — uses JWT place_id, includes soft-deleted products."""
    stmt = select(Product).where(Product.place_id == place_id)
    if search:
        stmt = stmt.where(Product.name.contains(search))
    if is_active is not None:
        stmt = stmt.where(Product.is_active == is_active)
    if in_stock is True:
        stmt = stmt.where(Product.stock > 0)
    stmt = stmt.order_by(Product.sort_order, Product.created_at.desc()).offset(offset).limit(limit)

    result = []
    for p in session.exec(stmt).all():
        reserved = get_active_reserved_qty(session, p.id) if p.track_inventory else 0
        d = p.model_dump()
        d["available_stock"] = max(0, p.stock - reserved)
        result.append(d)
    return result


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


# ---------------------------------------------------------------------------
# Variant group admin endpoints
# ---------------------------------------------------------------------------

def _assert_product_owned(session: Session, product_id: uuid.UUID, place_id: str) -> Product:
    product = session.exec(
        select(Product).where(Product.id == product_id, Product.place_id == place_id)
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post(
    "/{product_id}/variant-groups",
    dependencies=[Depends(require_roles("owner", "admin", "manager"))],
)
def create_variant_group(
    product_id: uuid.UUID,
    body: VariantGroupCreate,
    place_id: str = Depends(get_admin_place_id),
    session: Session = Depends(get_session),
) -> dict:
    _assert_product_owned(session, product_id, place_id)
    group = ProductVariantGroup(product_id=product_id, **body.model_dump())
    session.add(group)
    session.commit()
    session.refresh(group)
    return group.model_dump()


@router.put(
    "/{product_id}/variant-groups/{group_id}",
    dependencies=[Depends(require_roles("owner", "admin", "manager"))],
)
def update_variant_group(
    product_id: uuid.UUID,
    group_id: uuid.UUID,
    body: VariantGroupUpdate,
    place_id: str = Depends(get_admin_place_id),
    session: Session = Depends(get_session),
) -> dict:
    _assert_product_owned(session, product_id, place_id)
    group = session.exec(
        select(ProductVariantGroup).where(
            ProductVariantGroup.id == group_id,
            ProductVariantGroup.product_id == product_id,
        )
    ).first()
    if not group:
        raise HTTPException(status_code=404, detail="Variant group not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(group, field, value)
    session.add(group)
    session.commit()
    session.refresh(group)
    return group.model_dump()


@router.delete(
    "/{product_id}/variant-groups/{group_id}",
    dependencies=[Depends(require_roles("owner", "admin", "manager"))],
)
def delete_variant_group(
    product_id: uuid.UUID,
    group_id: uuid.UUID,
    place_id: str = Depends(get_admin_place_id),
    session: Session = Depends(get_session),
) -> dict:
    _assert_product_owned(session, product_id, place_id)
    group = session.exec(
        select(ProductVariantGroup).where(
            ProductVariantGroup.id == group_id,
            ProductVariantGroup.product_id == product_id,
        )
    ).first()
    if not group:
        raise HTTPException(status_code=404, detail="Variant group not found")

    options = session.exec(
        select(ProductVariantOption).where(ProductVariantOption.group_id == group_id)
    ).all()
    option_ids = {o.id for o in options}

    # Remove SKUs that include any option from this group
    affected_links = session.exec(
        select(ProductVariantSkuOption).where(
            ProductVariantSkuOption.option_id.in_(list(option_ids))
        )
    ).all()
    sku_ids_to_delete = {lnk.sku_id for lnk in affected_links}

    for sku_id in sku_ids_to_delete:
        for lnk in session.exec(
            select(ProductVariantSkuOption).where(ProductVariantSkuOption.sku_id == sku_id)
        ).all():
            session.delete(lnk)
        sku = session.get(ProductVariantSku, sku_id)
        if sku:
            session.delete(sku)

    for opt in options:
        session.delete(opt)
    session.delete(group)
    session.commit()
    return {"deleted": True}


# ---------------------------------------------------------------------------
# Variant option admin endpoints
# ---------------------------------------------------------------------------

@router.post(
    "/{product_id}/variant-groups/{group_id}/options",
    dependencies=[Depends(require_roles("owner", "admin", "manager"))],
)
def create_variant_option(
    product_id: uuid.UUID,
    group_id: uuid.UUID,
    body: VariantOptionCreate,
    place_id: str = Depends(get_admin_place_id),
    session: Session = Depends(get_session),
) -> dict:
    _assert_product_owned(session, product_id, place_id)
    group = session.exec(
        select(ProductVariantGroup).where(
            ProductVariantGroup.id == group_id,
            ProductVariantGroup.product_id == product_id,
        )
    ).first()
    if not group:
        raise HTTPException(status_code=404, detail="Variant group not found")
    option = ProductVariantOption(group_id=group_id, **body.model_dump())
    session.add(option)
    session.commit()
    session.refresh(option)
    return option.model_dump()


@router.put(
    "/{product_id}/variant-groups/{group_id}/options/{option_id}",
    dependencies=[Depends(require_roles("owner", "admin", "manager"))],
)
def update_variant_option(
    product_id: uuid.UUID,
    group_id: uuid.UUID,
    option_id: uuid.UUID,
    body: VariantOptionUpdate,
    place_id: str = Depends(get_admin_place_id),
    session: Session = Depends(get_session),
) -> dict:
    _assert_product_owned(session, product_id, place_id)
    option = session.exec(
        select(ProductVariantOption).where(
            ProductVariantOption.id == option_id,
            ProductVariantOption.group_id == group_id,
        )
    ).first()
    if not option:
        raise HTTPException(status_code=404, detail="Variant option not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(option, field, value)
    session.add(option)
    session.commit()
    session.refresh(option)
    return option.model_dump()


@router.delete(
    "/{product_id}/variant-groups/{group_id}/options/{option_id}",
    dependencies=[Depends(require_roles("owner", "admin", "manager"))],
)
def delete_variant_option(
    product_id: uuid.UUID,
    group_id: uuid.UUID,
    option_id: uuid.UUID,
    place_id: str = Depends(get_admin_place_id),
    session: Session = Depends(get_session),
) -> dict:
    _assert_product_owned(session, product_id, place_id)
    option = session.exec(
        select(ProductVariantOption).where(
            ProductVariantOption.id == option_id,
            ProductVariantOption.group_id == group_id,
        )
    ).first()
    if not option:
        raise HTTPException(status_code=404, detail="Variant option not found")

    # Remove SKUs that include this option
    links = session.exec(
        select(ProductVariantSkuOption).where(
            ProductVariantSkuOption.option_id == option_id
        )
    ).all()
    sku_ids = {lnk.sku_id for lnk in links}
    for sku_id in sku_ids:
        for lnk in session.exec(
            select(ProductVariantSkuOption).where(ProductVariantSkuOption.sku_id == sku_id)
        ).all():
            session.delete(lnk)
        sku = session.get(ProductVariantSku, sku_id)
        if sku:
            session.delete(sku)

    session.delete(option)
    session.commit()
    return {"deleted": True}


# ---------------------------------------------------------------------------
# Variant SKU admin endpoints
# ---------------------------------------------------------------------------

@router.post(
    "/{product_id}/generate-skus",
    dependencies=[Depends(require_roles("owner", "admin", "manager"))],
)
def generate_skus(
    product_id: uuid.UUID,
    place_id: str = Depends(get_admin_place_id),
    session: Session = Depends(get_session),
) -> list[dict]:
    _assert_product_owned(session, product_id, place_id)
    return bulk_generate_skus(product_id, session)


@router.get(
    "/{product_id}/variant-skus",
    dependencies=[Depends(require_roles("owner", "admin", "manager"))],
)
def list_variant_skus(
    product_id: uuid.UUID,
    place_id: str = Depends(get_admin_place_id),
    session: Session = Depends(get_session),
) -> list[dict]:
    product = _assert_product_owned(session, product_id, place_id)
    skus = get_sku_with_options(session, product_id)
    result = []
    for s in skus:
        sku_reserved = get_active_reserved_qty(
            session, product_id, uuid.UUID(str(s["id"]))
        ) if product.track_inventory else 0
        result.append({**s, "available_stock": max(0, s["stock"] - sku_reserved)})
    return result


@router.patch(
    "/variant-skus/{sku_id}",
    dependencies=[Depends(require_roles("owner", "admin", "manager"))],
)
def patch_variant_sku(
    sku_id: uuid.UUID,
    body: VariantSkuPatch,
    place_id: str = Depends(get_admin_place_id),
    session: Session = Depends(get_session),
) -> dict:
    sku = session.get(ProductVariantSku, sku_id)
    if not sku:
        raise HTTPException(status_code=404, detail="Variant SKU not found")
    # Verify ownership via product
    product = session.exec(
        select(Product).where(Product.id == sku.product_id, Product.place_id == place_id)
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Variant SKU not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(sku, field, value)
    session.add(sku)
    session.commit()
    session.refresh(sku)
    return sku.model_dump()
