"""Fire-and-forget Telegram notifications for shop events."""
import logging

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)


async def _send_telegram(text: str) -> None:
    settings = get_settings()
    if not settings.telegram_bot_token or not settings.telegram_chat_id:
        return
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(
                f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage",
                json={
                    "chat_id": settings.telegram_chat_id,
                    "text": text,
                    "parse_mode": "HTML",
                },
            )
    except Exception as exc:
        logger.warning("Shop Telegram notification failed: %s", exc)


async def notify_new_order(order_number: str, customer_name: str, customer_phone: str,
                            payment_mode: str, order_type: str, total: str,
                            item_lines: list[str]) -> None:
    ORDER_TYPE_LABELS = {"delivery": "משלוח", "pickup": "איסוף", "digital": "דיגיטלי"}
    PAYMENT_LABELS = {"tranzila": "כרטיס אשראי", "whatsapp": "WhatsApp", "cash": "מזומן/העברה"}
    lines = [
        f"🛒 <b>הזמנה חדשה #{order_number}</b>",
        f"👤 {customer_name} · {customer_phone}",
        f"💳 {PAYMENT_LABELS.get(payment_mode, payment_mode)} · {ORDER_TYPE_LABELS.get(order_type, order_type)}",
        f"💰 ₪{total}",
    ]
    if item_lines:
        lines.append("📦 " + " | ".join(item_lines[:5]))
    await _send_telegram("\n".join(lines))


async def notify_order_cancelled(order_number: str, reason: str, total: str) -> None:
    text = (
        f"❌ <b>הזמנה בוטלה #{order_number}</b>\n"
        f"💰 ₪{total}\n"
        f"סיבה: {reason}"
    )
    await _send_telegram(text)
