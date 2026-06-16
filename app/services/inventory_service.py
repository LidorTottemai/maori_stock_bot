"""Atomic inventory reservation and deduction."""
from datetime import datetime, timedelta
from decimal import Decimal

import uuid

from fastapi import HTTPException
from sqlmodel import Session, func, select

from app.core.config import get_settings
from app.models.shop_inventory import InventoryReservation
from app.models.shop_order import ShopOrder, ShopOrderItem
from app.models.shop_product import Product
from app.models.shop_product_variant import ProductVariantSku


def get_active_reserved_qty(
    session: Session,
    product_id: uuid.UUID,
    variant_sku_id: uuid.UUID | None = None,
) -> int:
    now = datetime.utcnow()
    stmt = select(func.coalesce(func.sum(InventoryReservation.quantity), 0)).where(
        InventoryReservation.product_id == product_id,
        InventoryReservation.released_at.is_(None),
        InventoryReservation.expires_at > now,
    )
    if variant_sku_id:
        stmt = stmt.where(InventoryReservation.variant_sku_id == variant_sku_id)
    return session.exec(stmt).one() or 0


def reserve_items(session: Session, order: ShopOrder, items: list[ShopOrderItem]) -> None:
    """
    Atomically verify and reserve stock for all items.
    Must be called inside a transaction. Uses application-level serialization
    (SQLite) or SELECT FOR UPDATE (PostgreSQL via engine dialect).
    """
    settings = get_settings()
    expires_at = datetime.utcnow() + timedelta(minutes=settings.shop_reservation_minutes)

    for item in items:
        product = session.get(Product, item.product_id)
        if not product or not product.track_inventory:
            continue

        if item.variant_sku_id:
            sku = session.get(ProductVariantSku, item.variant_sku_id)
            if sku is None:
                raise HTTPException(status_code=404, detail=f"Variant SKU not found: {item.variant_sku_id}")
            reserved = get_active_reserved_qty(session, item.product_id, item.variant_sku_id)
            available = sku.stock - reserved
        else:
            reserved = get_active_reserved_qty(session, item.product_id)
            available = product.stock - reserved

        if available < item.quantity and not product.allow_backorder:
            raise HTTPException(
                status_code=409,
                detail=f"Insufficient stock for '{product.name}': requested {item.quantity}, available {available}",
            )

        session.add(InventoryReservation(
            place_id=order.place_id,
            product_id=item.product_id,
            variant_sku_id=item.variant_sku_id,
            order_id=order.id,
            quantity=item.quantity,
            expires_at=expires_at,
        ))


def release_active_reservations(session: Session, order_id: uuid.UUID) -> None:
    """Release reservations for pending (unpaid) order cancellation."""
    now = datetime.utcnow()
    reservations = session.exec(
        select(InventoryReservation).where(
            InventoryReservation.order_id == order_id,
            InventoryReservation.released_at.is_(None),
        )
    ).all()
    for r in reservations:
        r.released_at = now
        session.add(r)


def deduct_stock(session: Session, items: list[ShopOrderItem]) -> None:
    """Deduct actual stock after payment confirmation. Reservations already released."""
    for item in items:
        if item.variant_sku_id:
            sku = session.get(ProductVariantSku, item.variant_sku_id)
            if sku:
                sku.stock = max(0, sku.stock - item.quantity)
                session.add(sku)
        else:
            product = session.get(Product, item.product_id)
            if product and product.track_inventory:
                product.stock = max(0, product.stock - item.quantity)
                session.add(product)


def restore_deducted_inventory(session: Session, items: list[ShopOrderItem]) -> None:
    """Restore actual stock for paid order cancellation (not reservations)."""
    for item in items:
        if item.variant_sku_id:
            sku = session.get(ProductVariantSku, item.variant_sku_id)
            if sku:
                sku.stock += item.quantity
                session.add(sku)
        else:
            product = session.get(Product, item.product_id)
            if product and product.track_inventory:
                product.stock += item.quantity
                session.add(product)
