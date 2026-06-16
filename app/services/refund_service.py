"""
Refund saga: DB commit before external API call.
No external network call inside DB transaction.
"""
import uuid
from datetime import datetime

from sqlmodel import Session, select

from app.models.shop_order import ShopOrder, ShopOrderItem
from app.models.shop_coupon import CouponRedemption
from app.models.shop_payment import PaymentAttempt, RefundAttempt
from app.models.shop_staff import StaffAuditLog
from app.services.inventory_service import restore_deducted_inventory
from app.services.tranzila_service import TranzilaUncertainError, refund as tranzila_refund
from app.shop.state_machine import CANCELLABLE_FULFILLMENT_STATUSES

import asyncio


class RefundError(Exception):
    pass


def get_latest_paid_attempt(
    session: Session,
    order_id: uuid.UUID,
    provider: str = "tranzila",
) -> PaymentAttempt | None:
    return session.exec(
        select(PaymentAttempt)
        .where(
            PaymentAttempt.order_id == order_id,
            PaymentAttempt.provider == provider,
            PaymentAttempt.status == "paid",
        )
        .order_by(PaymentAttempt.confirmed_at.desc())
    ).first()


async def cancel_and_refund(
    *,
    order_id: uuid.UUID,
    reason: str,
    staff_id: uuid.UUID,
    place_id: str,
    session: Session,
) -> RefundAttempt:
    """
    Saga steps:
    1. Validate + create RefundAttempt(pending) → commit
    2. Call Tranzila refund (outside transaction)
    3. Update DB based on result
    """
    # --- Step 1: Validate + persist pending refund ---
    order = session.exec(
        select(ShopOrder).where(ShopOrder.id == order_id, ShopOrder.place_id == place_id)
    ).first()
    if not order:
        raise RefundError("Order not found")
    if order.payment_status != "paid":
        raise RefundError("Cannot refund unpaid order")
    if order.fulfillment_status not in CANCELLABLE_FULFILLMENT_STATUSES:
        raise RefundError(f"Cannot cancel after fulfillment_status={order.fulfillment_status}")

    paid_attempt = get_latest_paid_attempt(session, order_id, provider="tranzila")
    if not paid_attempt or not paid_attempt.provider_transaction_id:
        raise RefundError("Paid Tranzila transaction not found")

    refund_attempt = RefundAttempt(
        place_id=place_id,
        order_id=order_id,
        payment_attempt_id=paid_attempt.id,
        amount=order.total,
        status="pending",
        idempotency_key=str(uuid.uuid4()),
    )
    session.add(refund_attempt)
    session.commit()  # Persist before external call
    session.refresh(refund_attempt)

    # --- Step 2: External Tranzila API call (no open transaction) ---
    provider_refund_id: str | None = None
    refund_status: str
    failure_reason: str | None = None

    try:
        provider_refund_id = await tranzila_refund(
            terminal=paid_attempt.terminal or "",
            transaction_id=paid_attempt.provider_transaction_id,
            amount=order.total,
        )
        refund_status = "succeeded"
    except TranzilaUncertainError as exc:
        refund_status = "verification_required"
        failure_reason = str(exc)
    except Exception as exc:
        refund_status = "failed"
        failure_reason = str(exc)

    # --- Step 3: Update DB based on result ---
    refund_attempt.status = refund_status
    refund_attempt.completed_at = datetime.utcnow()
    refund_attempt.provider_refund_id = provider_refund_id
    refund_attempt.failure_reason = failure_reason
    session.add(refund_attempt)

    if refund_status == "succeeded":
        items = session.exec(
            select(ShopOrderItem).where(ShopOrderItem.order_id == order_id)
        ).all()
        restore_deducted_inventory(session, items)

        # Reverse coupon redemptions
        redemptions = session.exec(
            select(CouponRedemption).where(
                CouponRedemption.order_id == order_id,
                CouponRedemption.status == "consumed",
            )
        ).all()
        for r in redemptions:
            r.status = "reversed"
            session.add(r)

        order.payment_status = "refunded"
        order.order_status = "cancelled"
        order.cancelled_at = datetime.utcnow()
        order.cancellation_reason = reason
        session.add(order)

        audit = StaffAuditLog(
            place_id=place_id,
            staff_id=staff_id,
            action="refund_issued",
            target_id=str(order_id),
            extra_data={
                "refund_amount": str(order.total),
                "provider_refund_id": provider_refund_id,
                "reason": reason,
            },
        )
        session.add(audit)

    session.commit()
    session.refresh(refund_attempt)
    return refund_attempt
