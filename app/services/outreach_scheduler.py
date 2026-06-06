import logging
import secrets
import uuid
from datetime import datetime, timedelta

import httpx
from sqlalchemy import or_
from sqlmodel import Session, select

from app.core.config import Settings
from app.core.database import get_engine
from app.models.lead import Lead
from app.models.outreach_contact import OutreachContact, OutreachStage
from app.models.rebuild_job import RebuildJob, RebuildStatus
from app.services import outreach_mailer, vercel_client

logger = logging.getLogger(__name__)


def _days_since(dt: datetime | None) -> float:
    if dt is None:
        return 0
    return (datetime.utcnow() - dt).total_seconds() / 86400


def _find_similar_lead(session: Session, original_lead: Lead) -> Lead | None:
    already_rebuilt = select(RebuildJob.lead_place_id).where(
        RebuildJob.status != RebuildStatus.failed
    )
    already_in_outreach = select(OutreachContact.lead_place_id)
    return session.exec(
        select(Lead)
        .where(Lead.category == original_lead.category)
        .where(Lead.website != "")
        .where(Lead.website.is_not(None))
        .where(Lead.place_id != original_lead.place_id)
        .where(Lead.place_id.not_in(already_rebuilt))
        .where(Lead.place_id.not_in(already_in_outreach))
        .order_by(Lead.score.desc())
        .limit(1)
    ).first()


def _build_recycle_prompt(original_lead: Lead, original_job: RebuildJob) -> str:
    return (
        f"RECYCLED DESIGN — adapt from existing site:\n"
        f"Original business: {original_lead.name} ({original_lead.category})\n"
        f"Design reference (GitHub): {original_job.repo_url}\n\n"
        f"Replace ALL content for the new business:\n"
        f"- Business name, phone, address, services\n"
        f"- Content: scraped from their existing website (see EXISTING SITE CONTENT above)\n"
        f"PRESERVE: overall design language, color palette, component structure."
    )


async def process_outreach(http_client: httpx.AsyncClient, settings: Settings) -> None:
    if not settings.resend_api_key:
        logger.info("RESEND_API_KEY not set — skipping outreach")
        return

    now = datetime.utcnow()

    with Session(get_engine()) as session:
        # ── Newly approved leads with no OutreachContact ──────────────────
        existing_contacts = select(OutreachContact.lead_place_id)
        new_approved = session.exec(
            select(Lead, RebuildJob)
            .join(RebuildJob, RebuildJob.lead_place_id == Lead.place_id)
            .where(Lead.marketing_approved == True)  # noqa: E712
            .where(Lead.email != "")
            .where(RebuildJob.status == RebuildStatus.done)
            .where(Lead.place_id.not_in(existing_contacts))
        ).all()

        for lead, job in new_approved:
            password = secrets.token_urlsafe(6)
            contact = OutreachContact(
                lead_place_id=lead.place_id,
                rebuild_job_id=job.id,
                site_password=password,
            )
            session.add(contact)
            session.commit()
            session.refresh(contact)

            # Protect site via Vercel env var
            if settings.vercel_token and job.repo_name:
                try:
                    await vercel_client.set_env_var(
                        job.repo_name, "SITE_PASSWORD", password, settings, http_client
                    )
                    await vercel_client.trigger_redeploy(job.repo_name, settings, http_client)
                except Exception as exc:
                    logger.warning("Vercel password setup failed (non-fatal): %s", exc)

            await outreach_mailer.send_initial(lead, job, password, settings, http_client)
            contact.stage = OutreachStage.initial
            contact.initial_sent_at = now
            session.add(contact)
            session.commit()
            logger.info("Initial outreach sent for '%s'", lead.name)

        # ── Stage: initial → reminder (7 days) ───────────────────────────
        initial_contacts = session.exec(
            select(OutreachContact, Lead, RebuildJob)
            .join(Lead, OutreachContact.lead_place_id == Lead.place_id)
            .join(RebuildJob, OutreachContact.rebuild_job_id == RebuildJob.id)
            .where(OutreachContact.stage == OutreachStage.initial)
        ).all()

        for contact, lead, job in initial_contacts:
            if _days_since(contact.initial_sent_at) >= 7:
                await outreach_mailer.send_reminder(
                    lead, job, contact.site_password, settings, http_client
                )
                contact.stage = OutreachStage.reminder
                contact.reminder_sent_at = now
                session.add(contact)
                session.commit()
                logger.info("Reminder sent for '%s'", lead.name)

        # ── Stage: reminder → discount (day 20 = 13 more days) ───────────
        reminder_contacts = session.exec(
            select(OutreachContact, Lead, RebuildJob)
            .join(Lead, OutreachContact.lead_place_id == Lead.place_id)
            .join(RebuildJob, OutreachContact.rebuild_job_id == RebuildJob.id)
            .where(OutreachContact.stage == OutreachStage.reminder)
        ).all()

        for contact, lead, job in reminder_contacts:
            if _days_since(contact.reminder_sent_at) >= 13:
                await outreach_mailer.send_discount(
                    lead, job, contact.site_password, settings, http_client
                )
                contact.stage = OutreachStage.discount
                contact.discount_sent_at = now
                session.add(contact)
                session.commit()
                logger.info("Discount offer sent for '%s'", lead.name)

        # ── Stage: discount → final (day 30 = 10 more days) ─────────────
        discount_contacts = session.exec(
            select(OutreachContact, Lead, RebuildJob)
            .join(Lead, OutreachContact.lead_place_id == Lead.place_id)
            .join(RebuildJob, OutreachContact.rebuild_job_id == RebuildJob.id)
            .where(OutreachContact.stage == OutreachStage.discount)
        ).all()

        for contact, lead, job in discount_contacts:
            if _days_since(contact.discount_sent_at) >= 10:
                await outreach_mailer.send_final(
                    lead, job, contact.site_password, settings, http_client
                )
                contact.stage = OutreachStage.final
                contact.final_sent_at = now
                session.add(contact)
                session.commit()
                logger.info("Final email sent for '%s'", lead.name)

        # ── Recycle: opted_out=True OR final+7d without response ─────────────
        to_recycle = session.exec(
            select(OutreachContact, Lead, RebuildJob)
            .join(Lead, OutreachContact.lead_place_id == Lead.place_id)
            .join(RebuildJob, OutreachContact.rebuild_job_id == RebuildJob.id)
            .where(OutreachContact.stage != OutreachStage.recycled)
            .where(
                or_(
                    OutreachContact.opted_out == True,  # noqa: E712
                    OutreachContact.stage == OutreachStage.final,
                )
            )
        ).all()

        for contact, lead, job in to_recycle:
            if not contact.opted_out and _days_since(contact.final_sent_at) < 7:
                continue

            similar = _find_similar_lead(session, lead)
            contact.stage = OutreachStage.recycled
            contact.recycled_at = now

            if similar:
                fix_prompt = _build_recycle_prompt(lead, job)
                session.add(RebuildJob(
                    id=str(uuid.uuid4()),
                    lead_place_id=similar.place_id,
                    fix_prompt=fix_prompt,
                    priority=5,
                    queued_at=now,
                ))
                contact.recycled_to_place_id = similar.place_id
                logger.info("Recycled site from '%s' → '%s'", lead.name, similar.name)
            else:
                logger.info("No similar lead for '%s' — marked recycled, no new job", lead.name)

            session.add(contact)
            session.commit()
