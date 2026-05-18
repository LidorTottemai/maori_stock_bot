"""
Sends formatted lead reports to a Telegram chat.
"""

import argparse
import requests
from datetime import date
from config import TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

TELEGRAM_API = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"


def send_message(text: str, chat_id: str = TELEGRAM_CHAT_ID) -> bool:
    if not TELEGRAM_BOT_TOKEN or not chat_id:
        print("[telegram] Missing token or chat_id, skipping send.")
        return False

    resp = requests.post(
        f"{TELEGRAM_API}/sendMessage",
        json={"chat_id": chat_id, "text": text, "parse_mode": "HTML"},
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json().get("ok", False)


def format_report(leads: list[dict], city: str, category: str, total_scanned: int) -> str:
    today = date.today().strftime("%d/%m/%Y")
    lines = [
        f"🔍 <b>סריקה יומית — {today}</b>",
        f"📍 אזור: {city} | קטגוריה: {category}",
        f"━━━━━━━━━━━━━━━━━━━",
    ]

    numbers = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"]

    for i, lead in enumerate(leads):
        num = numbers[i] if i < len(numbers) else f"{i+1}."
        lines.append(f"\n{num} <b>{lead['name']}</b>")
        if lead.get("phone"):
            lines.append(f"   📞 {lead['phone']}")
        if lead.get("website"):
            lines.append(f"   🌐 {lead['website']}")
        if lead.get("address"):
            lines.append(f"   📌 {lead['address']}")
        lines.append(f"   📊 ציון: {lead['score']}/100")
        for finding in lead.get("findings", [])[:3]:
            lines.append(f"   {finding}")

    lines.append(f"\n━━━━━━━━━━━━━━━━━━━")
    lines.append(f"סה\"כ נסרקו: {total_scanned} עסקים | דווחו: {len(leads)}")
    return "\n".join(lines)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--test", action="store_true", help="Send a test message")
    args = parser.parse_args()

    if args.test:
        test_leads = [
            {
                "name": "סטודיו יוגה לדוגמה",
                "phone": "054-1234567",
                "website": "yoga-example.co.il",
                "address": "רחוב הדוגמה 1, תל אביב",
                "score": 75,
                "findings": ["❌ להזמנה חייגו/התקשרו (+40)", "❌ אין HTTPS (+15)", "⚠️ WordPress 4.9 — ישן מאוד (+30)"],
            }
        ]
        msg = format_report(test_leads, "תל אביב", "סטודיו יוגה", 12)
        print("--- Message preview ---")
        print(msg)
        print("-----------------------")
        ok = send_message(msg)
        print(f"Sent: {ok}")
