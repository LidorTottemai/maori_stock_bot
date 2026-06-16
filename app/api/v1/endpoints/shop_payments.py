"""Tranzila payment handlers — webhook (source of truth) and success redirect (UX only)."""
import uuid

from fastapi import APIRouter, Depends, Form, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlmodel import Session

from app.core.config import get_settings
from app.core.database import get_session
from app.services.payment_service import confirm_payment, PaymentAmountMismatch, InvalidOrderReference
from app.services.tranzila_service import TranzilaError, parse_webhook

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/tranzila/webhook")
async def tranzila_webhook(request: Request, session: Session = Depends(get_session)) -> dict:
    """
    Source of truth for payment confirmation.
    Called by Tranzila after successful card charge.
    Must be idempotent — Tranzila may retry.
    """
    form = await request.form()
    form_data = dict(form)

    try:
        verified = parse_webhook(form_data)
    except TranzilaError as exc:
        # Payment failed — log but return 200 so Tranzila doesn't retry indefinitely
        return {"status": "ignored", "reason": str(exc)}

    try:
        confirm_payment(verified=verified, session=session)
    except (PaymentAmountMismatch, InvalidOrderReference) as exc:
        return {"status": "error", "reason": str(exc)}

    return {"status": "ok"}


@router.get("/tranzila/success")
def tranzila_success(
    TranzilaTK: str | None = None,
    order_id: str | None = None,
) -> RedirectResponse:
    """
    UX redirect after payment. Does NOT confirm payment.
    Tranzila webhook is the source of truth.
    """
    if order_id:
        return RedirectResponse(url=f"/shop/order/pending?order_id={order_id}", status_code=302)
    return RedirectResponse(url="/shop/order/success", status_code=302)


@router.get("/tranzila/failure")
def tranzila_failure(order_id: str | None = None) -> RedirectResponse:
    if order_id:
        return RedirectResponse(url=f"/shop/order/failed?order_id={order_id}", status_code=302)
    return RedirectResponse(url="/shop/order/failed", status_code=302)
