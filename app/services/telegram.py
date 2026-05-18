import logging
from datetime import date

import httpx

from app.core.config import Settings
from app.models.lead import Lead

logger = logging.getLogger(__name__)


def _format_report(
    leads: list[Lead],
    city: str,
    category: str,
    total_scanned: int,
) -> str:
    today = date.today().strftime("%d/%m/%Y")
    numbers = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"]

    lines = [
        f"🔍 <b>סריקה יומית — {today}</b>",
        f"📍 אזור: {city} | קטגוריה: {category}",
        "━━━━━━━━━━━━━━━━━━━",
    ]

    for i, lead in enumerate(leads):
        num = numbers[i] if i < len(numbers) else f"{i + 1}."
        lines.append(f"\n{num} <b>{lead.name}</b>")
        if lead.phone:
            lines.append(f"   📞 {lead.phone}")
        if lead.website:
            lines.append(f"   🌐 {lead.website}")
        if lead.address:
            lines.append(f"   📌 {lead.address}")
        lines.append(f"   📊 ציון: {lead.score}/100")
        for finding in lead.findings[:3]:
            lines.append(f"   {finding}")

    lines += [
        "\n━━━━━━━━━━━━━━━━━━━",
        f'סה"כ נסרקו: {total_scanned} עסקים | דווחו: {len(leads)}',
    ]
    return "\n".join(lines)


async def send_report(
    leads: list[Lead],
    city: str,
    category: str,
    total_scanned: int,
    settings: Settings,
    client: httpx.AsyncClient,
) -> bool:
    if not settings.telegram_bot_token or not settings.telegram_chat_id:
        logger.warning("Telegram not configured — skipping notification")
        return False

    text = _format_report(leads, city, category, total_scanned)
    url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"

    try:
        resp = await client.post(
            url,
            json={"chat_id": settings.telegram_chat_id, "text": text, "parse_mode": "HTML"},
        )
        resp.raise_for_status()
        return resp.json().get("ok", False)
    except (httpx.RequestError, httpx.HTTPStatusError) as exc:
        logger.error("Telegram send failed: %s", exc)
        return False
