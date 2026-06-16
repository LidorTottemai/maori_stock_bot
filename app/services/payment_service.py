"""Idempotent payment confirmation — called only from webhook handler."""
import uuid
from datetime import datetime
from decimal import Decimal

from fastapi import HTTPException
from sqlmodel import Session, select

from app.models.shop_order import ShopOrder, ShopOrderItem
from app.models.shop_payment import PaymentAttempt
from app.models.shop_coupon import CouponRedemption
from app.models.shop_digital import DigitalDownloadGrant
from app.services.inventory_service import deduct_stock, release_active_reservations
from app.services.tranzila_service import VerifiedPayment

import hashlib
import secrets


class PaymentAmountMismatch(Exception):
    pass


class PaymentCurrencyMismatch(Exception):
    pass


class InvalidOrderReference(Exception):
    pass


def _get_paid_attempt(
    session: Session,
    provider: str,
    terminal: str | None,
    transaction_id: str,
) -> PaymentAttempt | None:
    stmt = select(PaymentAttempt).where(
        PaymentAttempt.provider == provider,
        PaymentAttempt.provider_transaction_id == transaction_id,
    )
    if terminal:
        stmt = stmt.where(PaymentAttempt.terminal == terminal)
    return session.exec(stmt).first()


def _create_digital_grants(session: Session, items: list[ShopOrderItem]) -> None:
    from app.core.config import get_settings
    settings = get_settings()
    for item in items:
        if item.product_type != "digital":
            continue
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        grant = DigitalDownloadGrant(
            order_item_id=item.id,
            token_hash=token_hash,
            expires_at=datetime.utcnow().replace(
                year=datetime.utcnow().year + 1
            ),  # 1 year
        )
        session.add(grant)


def confirm_payment(
    *,
    verified: VerifiedPayment,
    session: Session,
) -> None:
    """
    Idempotent — safe to call multiple times (e.g., webhook retry).
    Must NOT be called from success redirect (UX only).
    """
    # Check for existing confirmed attempt
    existing = _get_paid_attempt(
        session,
        provider=verified.provider,
        terminal=verified.terminal,
        transaction_id=verified.provider_transaction_id,
    )
    if existing and existing.status == "paid":
        return  # Already processed — idempotent

    # Parse order reference
    try:
        order_id = uuid.UUID(verified.order_reference)
    except ValueError:
        raise InvalidOrderReference(f"Bad order_reference: {verified.order_reference}")

    order = session.exec(select(ShopOrder).where(ShopOrder.id == order_id)).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.payment_status == "paid":
        return  # Already paid — idempotent

    # Validate payment matches order
    if verified.amount != order.total:
        raise PaymentAmountMismatch(
            f"Amount mismatch: got {verified.amount}, expected {order.total}"
        )
    if verified.currency != order.currency:
        raise PaymentCurrencyMismatch(
            f"Currency mismatch: got {verified.currency}, expected {order.currency}"
        )

    items = session.exec(
        select(ShopOrderItem).where(ShopOrderItem.order_id == order.id)
    ).all()

    # Deduct stock and release reservations
    deduct_stock(session, items)
    release_active_reservations(session, order.id)

    # Mark coupon redemptions as consumed
    redemptions = session.exec(
        select(CouponRedemption).where(
            CouponRedemption.order_id == order.id,
            CouponRedemption.status == "reserved",
        )
    ).all()
    for r in redemptions:
        r.status = "consumed"
        session.add(r)

    # Create digital download grants for digital items
    digital_items = [i for i in items if i.product_type == "digital"]
    if digital_items:
        _create_digital_grants(session, digital_items)

    # Update order
    order.payment_status = "paid"
    order.paid_at = datetime.utcnow()
    session.add(order)

    # Upsert payment attempt
    if existing:
        existing.status = "paid"
        existing.confirmed_at = datetime.utcnow()
        existing.provider_transaction_id = verified.provider_transaction_id
        existing.raw_response = {}
        session.add(existing)
    else:
        attempt = PaymentAttempt(
            place_id=order.place_id,
            order_id=order.id,
            provider=verified.provider,
            terminal=verified.terminal,
            amount=verified.amount,
            currency=verified.currency,
            status="paid",
            provider_transaction_id=verified.provider_transaction_id,
            idempotency_key=str(uuid.uuid4()),
            confirmed_at=datetime.utcnow(),
        )
        session.add(attempt)

    session.commit()
