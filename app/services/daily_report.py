import logging
from datetime import date

import httpx
from sqlmodel import Session, select

from app.core.config import Settings
from app.core.database import get_engine
from app.models.lead import Lead
from app.models.outreach_contact import OutreachContact, OutreachStage
from app.models.rebuild_job import RebuildJob, RebuildStatus

logger = logging.getLogger(__name__)


async def _send_message(
    text: str,
    settings: Settings,
    client: httpx.AsyncClient,
    chat_id: str | None = None,
    reply_markup: dict | None = None,
    parse_mode: str = "HTML",
) -> dict | None:
    if not settings.telegram_bot_token:
        return None
    target_chat = chat_id or settings.telegram_chat_id
    if not target_chat:
        return None

    payload: dict = {
        "chat_id": target_chat,
        "text": text,
        "parse_mode": parse_mode,
    }
    if reply_markup:
        payload["reply_markup"] = reply_markup

    try:
        resp = await client.post(
            f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage",
            json=payload,
            timeout=15,
        )
        resp.raise_for_status()
        return resp.json()
    except Exception as exc:
        logger.error("Telegram sendMessage failed: %s", exc)
        return None


async def send_daily_report(http_client: httpx.AsyncClient, settings: Settings) -> None:
    if not settings.telegram_bot_token or not settings.telegram_chat_id:
        logger.warning("Telegram not configured — skipping daily report")
        return

    with Session(get_engine()) as session:
        rows = session.exec(
            select(RebuildJob, Lead)
            .join(Lead, RebuildJob.lead_place_id == Lead.place_id)
            .where(RebuildJob.status == RebuildStatus.done)
            .order_by(RebuildJob.finished_at.desc())
            .limit(20)
        ).all()

        pending_count = session.exec(
            select(RebuildJob).where(RebuildJob.status == RebuildStatus.queued)
        ).all()

        active_count = session.exec(
            select(RebuildJob).where(RebuildJob.status.in_([
                RebuildStatus.scraping, RebuildStatus.researching,
                RebuildStatus.generating, RebuildStatus.pushing,
            ]))
        ).all()

    if not rows:
        await _send_message(
            f"📊 <b>דוח בנייה יומי — {date.today().strftime('%d.%m.%Y')}</b>\n\nאין אתרים בנויים עדיין.",
            settings=settings,
            client=http_client,
        )
        return

    # Summary header
    approved_count = sum(1 for _, lead in rows if lead.marketing_approved)
    header = (
        f"📊 <b>דוח בנייה יומי — {date.today().strftime('%d.%m.%Y')}</b>\n"
        f"🏗️ {len(rows)} בנויים | ✅ {approved_count} מאושרים | "
        f"⏳ {len(pending_count)} בתור | 🔄 {len(active_count)} בתהליך"
    )
    await _send_message(header, settings=settings, client=http_client)

    # One card per business with inline keyboard
    for job, lead in rows[:10]:
        site_url = job.vercel_url or job.repo_url or ""
        # Telegram rejects non-ASCII URLs in inline keyboard buttons
        valid_url = site_url if site_url and site_url.isascii() else ""
        approved_badge = "✅ " if lead.marketing_approved else ""
        text = (
            f"{approved_badge}<b>{lead.name}</b>\n"
            f"ניקוד: {lead.score} | {lead.category}\n"
            + (f"🌐 {valid_url}" if valid_url else "⚠️ URL לא תקין — נדרש rebuild")
        )

        buttons = []
        if valid_url:
            buttons.append({"text": "🌐 צפה באתר", "url": valid_url})
        buttons.append({"text": "✏️ תיקונים", "callback_data": f"fix:{job.id}:{lead.place_id}"})
        if not lead.marketing_approved:
            buttons.append({"text": "✅ אשר לשיווק", "callback_data": f"approve:{lead.place_id}"})

        await _send_message(
            text,
            settings=settings,
            client=http_client,
            reply_markup={"inline_keyboard": [buttons]},
        )

    logger.info("Daily report sent: %d business cards", min(len(rows), 10))

    # ── Outreach section ────────────────────────────────────────────────────
    _STAGE_LABEL = {
        OutreachStage.initial:  "יום 0",
        OutreachStage.reminder: "יום 7",
        OutreachStage.discount: "יום 20",
        OutreachStage.final:    "יום 30 ⏰",
    }

    with Session(get_engine()) as session:
        active_contacts = session.exec(
            select(OutreachContact, Lead)
            .join(Lead, OutreachContact.lead_place_id == Lead.place_id)
            .where(OutreachContact.stage.in_([
                OutreachStage.initial, OutreachStage.reminder,
                OutreachStage.discount, OutreachStage.final,
            ]))
            .where(OutreachContact.opted_out == False)  # noqa: E712
            .limit(8)
        ).all()

    if active_contacts:
        await _send_message(
            f"📧 <b>קמפיין outreach פעיל — {len(active_contacts)} עסקים</b>",
            settings=settings,
            client=http_client,
        )
        for contact, lead in active_contacts:
            label = _STAGE_LABEL.get(contact.stage, contact.stage)
            text = f"📧 <b>{lead.name}</b> | {label} | {lead.category}"
            await _send_message(
                text,
                settings=settings,
                client=http_client,
                reply_markup={"inline_keyboard": [[
                    {"text": "🗑 הסר מרשימה", "callback_data": f"optout:{lead.place_id}"}
                ]]},
            )
