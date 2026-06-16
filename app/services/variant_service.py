"""Variant SKU generation — combination_key hashing and bulk SKU creation."""
import hashlib
import itertools
import uuid
from decimal import Decimal

from sqlmodel import Session, select

from app.models.shop_product import Product
from app.models.shop_product_variant import (
    ProductVariantGroup,
    ProductVariantOption,
    ProductVariantSku,
    ProductVariantSkuOption,
)


def make_combination_key(option_ids: list[uuid.UUID]) -> str:
    """Deterministic SHA-256 key for a set of option IDs (order-independent)."""
    sorted_ids = sorted(str(i) for i in option_ids)
    return hashlib.sha256(",".join(sorted_ids).encode()).hexdigest()


def _sku_string(base_sku: str | None, suffixes: list[str]) -> str | None:
    if not base_sku and not suffixes:
        return None
    parts = ([base_sku] if base_sku else []) + sorted(s for s in suffixes if s)
    return "-".join(parts) if parts else None


def bulk_generate_skus(product_id: uuid.UUID, session: Session) -> list[dict]:
    """
    Auto-generate ProductVariantSku rows for every combination of
    affects_stock=True options. Skips combinations that already exist.
    Returns list of dicts for the newly created rows.
    """
    product = session.get(Product, product_id)
    if not product:
        raise ValueError(f"Product {product_id} not found")

    groups = session.exec(
        select(ProductVariantGroup)
        .where(
            ProductVariantGroup.product_id == product_id,
            ProductVariantGroup.affects_stock == True,  # noqa: E712
        )
        .order_by(ProductVariantGroup.sort_order)
    ).all()

    if not groups:
        return []

    group_options: list[list[ProductVariantOption]] = []
    for group in groups:
        opts = session.exec(
            select(ProductVariantOption)
            .where(ProductVariantOption.group_id == group.id)
            .order_by(ProductVariantOption.sort_order)
        ).all()
        if opts:
            group_options.append(list(opts))

    if not group_options:
        return []

    created = []
    for combo in itertools.product(*group_options):
        option_ids = [o.id for o in combo]
        ckey = make_combination_key(option_ids)

        existing = session.exec(
            select(ProductVariantSku).where(
                ProductVariantSku.product_id == product_id,
                ProductVariantSku.combination_key == ckey,
            )
        ).first()
        if existing:
            continue

        suffixes = [o.sku_suffix or "" for o in combo]
        sku_row = ProductVariantSku(
            product_id=product_id,
            combination_key=ckey,
            sku=_sku_string(product.sku, suffixes),
            stock=0,
        )
        session.add(sku_row)
        session.flush()

        for opt_id in option_ids:
            session.add(ProductVariantSkuOption(sku_id=sku_row.id, option_id=opt_id))

        created.append({
            **sku_row.model_dump(),
            "option_ids": [str(i) for i in option_ids],
        })

    session.commit()
    return created


def get_sku_with_options(
    session: Session, product_id: uuid.UUID
) -> list[dict]:
    """Return all SKUs for a product with their option_ids list."""
    skus = session.exec(
        select(ProductVariantSku).where(ProductVariantSku.product_id == product_id)
    ).all()

    result = []
    for sku in skus:
        links = session.exec(
            select(ProductVariantSkuOption).where(
                ProductVariantSkuOption.sku_id == sku.id
            )
        ).all()
        result.append({
            **sku.model_dump(),
            "option_ids": [str(lnk.option_id) for lnk in links],
        })
    return result
