import uuid
from datetime import datetime

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session

from app.core.config import Settings, get_settings
from app.core.database import get_session
from app.models.lead import Lead
from app.models.rebuild_job import RebuildJob

router = APIRouter(prefix="/telegram", tags=["telegram"])

# In-memory: chat_id → (job_id, place_id) while waiting for user's fix prompt
_pending_fix: dict[int, tuple[str, str]] = {}


async def _answer_callback(callback_id: str, text: str, settings: Settings, client: httpx.AsyncClient) -> None:
    try:
        await client.post(
            f"https://api.telegram.org/bot{settings.telegram_bot_token}/answerCallbackQuery",
            json={"callback_query_id": callback_id, "text": text},
            timeout=10,
        )
    except Exception:
        pass


async def _send(chat_id: int, text: str, settings: Settings, client: httpx.AsyncClient, reply_markup: dict | None = None) -> None:
    payload: dict = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
    }
    if reply_markup:
        payload["reply_markup"] = reply_markup
    try:
        await client.post(
            f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage",
            json=payload,
            timeout=10,
        )
    except Exception:
        pass


@router.post("/webhook")
async def telegram_webhook(
    request: Request,
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
):
    # Verify secret token if configured
    if settings.telegram_webhook_secret:
        token = request.headers.get("X-Telegram-Bot-Api-Secret-Token", "")
        if token != settings.telegram_webhook_secret:
            raise HTTPException(status_code=403, detail="Invalid webhook secret")

    data = await request.json()

    # ── Inline button callback ──────────────────────────────────────────────
    if "callback_query" in data:
        query = data["callback_query"]
        chat_id: int = query["message"]["chat"]["id"]
        callback_id: str = query["id"]
        parts = query.get("data", "").split(":")
        action = parts[0] if parts else ""

        from app.main import app as _app
        client: httpx.AsyncClient = _app.state.http_client

        if action == "fix" and len(parts) == 3:
            _, job_id, place_id = parts
            _pending_fix[chat_id] = (job_id, place_id)
            lead = session.get(Lead, place_id)
            name = lead.name if lead else place_id
            await _answer_callback(callback_id, "✏️ כתוב את התיקונים", settings, client)
            await _send(
                chat_id,
                f"✏️ <b>תיקונים עבור {name}</b>\n\nכתוב מה לשנות באתר:",
                settings,
                client,
                reply_markup={"force_reply": True, "selective": True},
            )

        elif action == "approve" and len(parts) == 2:
            place_id = parts[1]
            lead = session.get(Lead, place_id)
            if lead:
                lead.marketing_approved = True
                lead.marketing_approved_at = datetime.utcnow()
                session.add(lead)
                session.commit()
                await _answer_callback(callback_id, f"✅ {lead.name} אושר לשיווק!", settings, client)
            else:
                await _answer_callback(callback_id, "שגיאה: עסק לא נמצא", settings, client)

    # ── Text message (fix prompt reply) ────────────────────────────────────
    elif "message" in data and "text" in data["message"]:
        msg = data["message"]
        chat_id = msg["chat"]["id"]
        fix_text: str = msg["text"].strip()

        if chat_id in _pending_fix:
            job_id, place_id = _pending_fix.pop(chat_id)
            lead = session.get(Lead, place_id)

            from app.main import app as _app
            client = _app.state.http_client

            if lead and lead.website:
                new_job = RebuildJob(
                    id=str(uuid.uuid4()),
                    lead_place_id=place_id,
                    fix_prompt=fix_text,
                    priority=10,
                    queued_at=datetime.utcnow(),
                )
                session.add(new_job)
                session.commit()
                await _send(
                    chat_id,
                    f"✅ <b>תיקון נוסף לתור בעדיפות גבוהה!</b>\n"
                    f"עסק: {lead.name}\n"
                    f"פרומפט: {fix_text[:100]}",
                    settings,
                    client,
                )
            else:
                await _send(chat_id, "❌ לא ניתן להוסיף תיקון — עסק ללא אתר.", settings, client)

    return {"ok": True}
