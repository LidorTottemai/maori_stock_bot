"""Tranzila payment gateway integration."""
from dataclasses import dataclass
from decimal import Decimal

import httpx

from app.core.config import get_settings


class TranzilaError(Exception):
    pass


class TranzilaUncertainError(TranzilaError):
    """Network or ambiguous error — refund status unknown, needs manual verification."""
    pass


@dataclass
class VerifiedPayment:
    """Produced only after full validation by this service. Cannot be created externally."""
    provider: str
    terminal: str
    provider_transaction_id: str
    order_reference: str   # str(order.id)
    amount: Decimal
    currency: str


def build_payment_url(
    order_id: str,
    amount: Decimal,
    currency: str,
    description: str,
    success_url: str,
    failure_url: str,
) -> str:
    settings = get_settings()
    base = "https://secure5.tranzila.com/cgi-bin/tranzila71u.cgi"
    params = {
        "supplier": settings.tranzila_terminal,
        "sum": str(amount),
        "currency": "1" if currency == "ILS" else "2",
        "cred_type": "1",
        "tranmode": "A",
        "noShowBackLink": "1",
        "success_url": success_url,
        "fail_url": failure_url,
        "TranzilaPW": settings.tranzila_success_pass,
        "order_id": order_id,
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return f"{base}?{query}"


def parse_webhook(form_data: dict) -> VerifiedPayment:
    """
    Parse and validate Tranzila webhook POST data.
    Raises TranzilaError if response_code != "000".
    """
    settings = get_settings()
    terminal = form_data.get("supplier", settings.tranzila_terminal)
    response_code = form_data.get("Response", "")
    transaction_id = form_data.get("TranzilaTK", "")
    order_reference = form_data.get("order_id", "")
    amount_str = form_data.get("sum", "0")
    currency_code = form_data.get("currency", "1")

    if response_code != "000":
        raise TranzilaError(f"Payment failed: response_code={response_code}")
    if not transaction_id:
        raise TranzilaError("Missing TranzilaTK in webhook")
    if not order_reference:
        raise TranzilaError("Missing order_id in webhook")

    currency = "ILS" if currency_code == "1" else "USD"
    return VerifiedPayment(
        provider="tranzila",
        terminal=terminal,
        provider_transaction_id=transaction_id,
        order_reference=order_reference,
        amount=Decimal(amount_str),
        currency=currency,
    )


async def refund(terminal: str, transaction_id: str, amount: Decimal) -> str:
    """
    Perform a refund via Tranzila API.
    Returns provider_refund_id on success.
    Raises TranzilaUncertainError on network/timeout issues.
    """
    settings = get_settings()
    payload = {
        "supplier": terminal,
        "TranzilaTK": transaction_id,
        "sum": str(amount),
        "tranmode": "C",  # Credit (refund)
        "TranzilaPW": settings.tranzila_success_pass,
    }
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                "https://secure5.tranzila.com/cgi-bin/tranzila71u.cgi",
                data=payload,
            )
        resp.raise_for_status()
        result = dict(pair.split("=", 1) for pair in resp.text.split("&") if "=" in pair)
        response_code = result.get("Response", "")
        if response_code != "000":
            raise TranzilaError(f"Refund failed: response_code={response_code}")
        return result.get("TranzilaTK", transaction_id)
    except (httpx.TimeoutException, httpx.NetworkError) as exc:
        raise TranzilaUncertainError(f"Network error during refund: {exc}") from exc
