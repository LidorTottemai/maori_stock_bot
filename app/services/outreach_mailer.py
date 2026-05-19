import logging
from datetime import date, timedelta

import httpx

from app.core.config import Settings
from app.models.lead import Lead
from app.models.rebuild_job import RebuildJob

logger = logging.getLogger(__name__)

_RESEND_URL = "https://api.resend.com/emails"

_BASE_STYLE = """
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #f4f4f5; font-family: 'Segoe UI', Arial, sans-serif;
         direction: rtl; color: #18181b; }
  .wrapper { max-width: 600px; margin: 32px auto; background: #fff;
             border-radius: 16px; overflow: hidden;
             box-shadow: 0 4px 24px rgba(0,0,0,.08); }
  .hero { background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
          padding: 40px 32px; text-align: center; color: #fff; }
  .hero h1 { font-size: 26px; font-weight: 700; margin-bottom: 8px; }
  .hero p  { font-size: 15px; opacity: .85; }
  .body { padding: 32px; }
  .hi    { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
  .text  { font-size: 15px; line-height: 1.7; color: #3f3f46; margin-bottom: 20px; }
  .box   { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;
           padding: 20px 24px; margin-bottom: 24px; }
  .box .label { font-size: 13px; color: #64748b; margin-bottom: 4px; }
  .box .val   { font-size: 18px; font-weight: 700; color: #0f172a; word-break: break-all; }
  .features { list-style: none; margin-bottom: 24px; }
  .features li { padding: 8px 0; font-size: 15px; border-bottom: 1px solid #f1f5f9; }
  .features li:last-child { border: none; }
  .features .check { color: #22c55e; font-weight: 700; margin-left: 8px; }
  .price { background: #0f172a; color: #fff; border-radius: 12px;
           padding: 20px 24px; text-align: center; margin-bottom: 28px; }
  .price .amount { font-size: 32px; font-weight: 800; color: #fbbf24; }
  .price .note   { font-size: 13px; opacity: .7; margin-top: 4px; }
  .btn { display: inline-block; padding: 14px 28px; border-radius: 8px;
         font-size: 15px; font-weight: 600; text-decoration: none;
         text-align: center; }
  .btn-primary { background: #2563eb; color: #fff; }
  .btn-secondary { background: #f1f5f9; color: #0f172a; border: 1px solid #e2e8f0; }
  .btn-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 28px; }
  .footer { padding: 20px 32px; background: #f8fafc; text-align: center;
            font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  .urgent { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px;
            padding: 16px 20px; margin-bottom: 20px; color: #dc2626; font-weight: 600; }
  .offer  { background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px;
            padding: 20px 24px; margin-bottom: 24px; }
  .offer .offer-title { font-size: 18px; font-weight: 700; color: #15803d; margin-bottom: 8px; }
</style>
"""

_FOOTER = """
<div class="footer">
  נשלח על ידי צוות השיווק הדיגיטלי | לביטול הרשמה השב STOP<br>
  © {year} כל הזכויות שמורות
</div>
""".format(year=date.today().year)

_FEATURES = [
    "אחסון ותחזוקת שרתים מהירים",
    "ניהול דומיין (שם האתר)",
    "תחזוקה טכנית שוטפת",
    "תיקוני באגים ותקלות",
    "עדכוני תוכן קטנים כל חודש",
    "גיבויים אוטומטיים יומיים",
    "אבטחה ו-SSL (מנעול ירוק)",
]


def _features_html() -> str:
    items = "".join(
        f'<li><span class="check">✓</span>{f}</li>' for f in _FEATURES
    )
    return f'<ul class="features">{items}</ul>'


def _render_initial(name: str, site_url: str, password: str, price: int) -> str:
    return f"""<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">{_BASE_STYLE}</head>
<body><div class="wrapper">
  <div class="hero">
    <h1>🎉 האתר החדש שלכם מוכן!</h1>
    <p>בנינו עבורכם אתר מקצועי, מודרני ומותאם לנייד</p>
  </div>
  <div class="body">
    <div class="hi">היי {name}! 👋</div>
    <p class="text">
      הפתעה! הצוות שלנו בנה עבורכם אתר אינטרנט חדש לגמרי —
      מודרני, מהיר, מותאם לנייד ומותאם אישית לעסק שלכם.
      צפו בו עכשיו:
    </p>
    <div class="box">
      <div class="label">🌐 קישור לאתר (גרסת תצוגה מקדימה)</div>
      <div class="val">{site_url}</div>
      <div style="margin-top:12px">
        <div class="label">🔑 סיסמת כניסה</div>
        <div class="val" style="font-size:22px;letter-spacing:2px">{password}</div>
      </div>
    </div>
    <p class="text"><strong>מה כלול בחבילת ניהול האתר שלנו:</strong></p>
    {_features_html()}
    <div class="price">
      <div style="font-size:14px;margin-bottom:4px">עלות חבילת ניהול חודשית</div>
      <div class="amount">₪{price:,}</div>
      <div class="note">לא כולל מע"מ | ניתן לביטול בכל עת</div>
    </div>
    <div class="btn-row">
      <a href="{site_url}" class="btn btn-primary">🌐 צפייה באתר</a>
      <a href="mailto:?subject=מעוניינים%20באתר" class="btn btn-secondary">📞 מעוניינים? דברו איתנו</a>
    </div>
    <p class="text" style="font-size:13px;color:#64748b">
      האתר נמצא בגרסת תצוגה מקדימה — לאחר אישור תחל ההקמה הרשמית.
    </p>
  </div>
  {_FOOTER}
</div></body></html>"""


def _render_reminder(name: str, site_url: str, password: str) -> str:
    return f"""<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">{_BASE_STYLE}</head>
<body><div class="wrapper">
  <div class="hero">
    <h1>👋 תזכורת קטנה</h1>
    <p>האתר החדש שלכם עדיין מחכה לכם</p>
  </div>
  <div class="body">
    <div class="hi">{name} שלום,</div>
    <p class="text">
      לפני שבוע שלחנו לכם קישור לאתר החדש שבנינו עבורכם.
      עדיין לא הספקתם לצפות? הנה שוב:
    </p>
    <div class="box">
      <div class="label">🌐 קישור לאתר</div>
      <div class="val">{site_url}</div>
      <div style="margin-top:12px">
        <div class="label">🔑 סיסמה</div>
        <div class="val" style="font-size:22px;letter-spacing:2px">{password}</div>
      </div>
    </div>
    <p class="text">יש שאלות? נשמח לענות על כל שאלה ☎️</p>
    <div class="btn-row">
      <a href="{site_url}" class="btn btn-primary">🌐 צפייה באתר</a>
    </div>
  </div>
  {_FOOTER}
</div></body></html>"""


def _render_discount(name: str, site_url: str, password: str, price: int) -> str:
    free_value = price * 2
    deadline = (date.today() + timedelta(days=10)).strftime("%d.%m.%Y")
    return f"""<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">{_BASE_STYLE}</head>
<body><div class="wrapper">
  <div class="hero">
    <h1>🎁 מתנה מאיתנו</h1>
    <p>הצעה מיוחדת — חודשיים חינם</p>
  </div>
  <div class="body">
    <div class="hi">{name} שלום,</div>
    <p class="text">
      רצינו להעניק לכם הזדמנות מיוחדת. הצטרפו לחבילת ניהול האתר
      וקבלו <strong>חודשיים חינם</strong>!
    </p>
    <div class="offer">
      <div class="offer-title">🎁 חודשיים חינם — ערך ₪{free_value:,}</div>
      <p style="font-size:15px;color:#166534">
        שלמו על 10 חודשים — קבלו 12 חודשים.<br>
        ₪{price:,} × 10 = ₪{price * 10:,} בלבד לשנה שלמה.
      </p>
    </div>
    <div class="box">
      <div class="label">⏰ ההצעה תקפה עד</div>
      <div class="val">{deadline}</div>
    </div>
    <div class="btn-row">
      <a href="{site_url}" class="btn btn-primary">✅ מימוש ההצעה</a>
    </div>
  </div>
  {_FOOTER}
</div></body></html>"""


def _render_final(name: str, site_url: str, password: str) -> str:
    deletion_date = (date.today() + timedelta(days=7)).strftime("%d.%m.%Y")
    return f"""<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">{_BASE_STYLE}</head>
<body><div class="wrapper">
  <div class="hero" style="background:linear-gradient(135deg,#7f1d1d,#991b1b)">
    <h1>⏰ 7 ימים אחרונים</h1>
    <p>ההצעה עומדת לפוג</p>
  </div>
  <div class="body">
    <div class="hi">{name} שלום,</div>
    <div class="urgent">
      ⚠️ האתר שלכם יסגר לצמיתות ב-{deletion_date} אם לא נשמע מכם.
    </div>
    <p class="text">
      לפני חודש בנינו עבורכם אתר אינטרנט מקצועי.
      עם כל הצער שבעולם — אנחנו נאלצים לפנות מקום בשרתים שלנו.
    </p>
    <p class="text">
      אם לא נשמע מכם עד <strong>{deletion_date}</strong>,
      האתר ייסגר לצמיתות וכל התוכן יאבד.
    </p>
    <p class="text">
      זו ההזדמנות האחרונה שלכם לשמור על האתר שבנינו עבורכם.
    </p>
    <div class="btn-row">
      <a href="{site_url}" class="btn btn-primary">🛟 אני רוצה לשמור את האתר</a>
      <a href="mailto:?subject=רוצים%20לשמור%20את%20האתר" class="btn btn-secondary">💬 דברו איתי</a>
    </div>
  </div>
  {_FOOTER}
</div></body></html>"""


async def _send(
    to: str,
    subject: str,
    html: str,
    settings: Settings,
    client: httpx.AsyncClient,
) -> None:
    if not to or "@" not in to:
        logger.warning("Skipping email — invalid address: %r", to)
        return
    if not settings.resend_api_key:
        logger.warning("RESEND_API_KEY not set — skipping email to %s", to)
        return
    try:
        resp = await client.post(
            _RESEND_URL,
            headers={"Authorization": f"Bearer {settings.resend_api_key}"},
            json={
                "from": settings.outreach_from_email,
                "to": [to],
                "subject": subject,
                "html": html,
            },
            timeout=20,
        )
        resp.raise_for_status()
        logger.info("Email sent to %s: %s", to, subject)
    except Exception as exc:
        logger.error("Failed to send email to %s: %s", to, exc)


async def send_initial(
    lead: Lead, job: RebuildJob, password: str, settings: Settings, client: httpx.AsyncClient
) -> None:
    site_url = job.vercel_url or job.repo_url or ""
    await _send(
        to=lead.email,
        subject=f"🎉 האתר החדש של {lead.name} מוכן לצפייה!",
        html=_render_initial(lead.name, site_url, password, settings.outreach_price_ils),
        settings=settings,
        client=client,
    )


async def send_reminder(
    lead: Lead, job: RebuildJob, password: str, settings: Settings, client: httpx.AsyncClient
) -> None:
    site_url = job.vercel_url or job.repo_url or ""
    await _send(
        to=lead.email,
        subject=f"👋 תזכורת — האתר של {lead.name} עדיין מחכה",
        html=_render_reminder(lead.name, site_url, password),
        settings=settings,
        client=client,
    )


async def send_discount(
    lead: Lead, job: RebuildJob, password: str, settings: Settings, client: httpx.AsyncClient
) -> None:
    site_url = job.vercel_url or job.repo_url or ""
    await _send(
        to=lead.email,
        subject=f"🎁 מתנה מאיתנו — חודשיים חינם עבור {lead.name}",
        html=_render_discount(lead.name, site_url, password, settings.outreach_price_ils),
        settings=settings,
        client=client,
    )


async def send_final(
    lead: Lead, job: RebuildJob, password: str, settings: Settings, client: httpx.AsyncClient
) -> None:
    site_url = job.vercel_url or job.repo_url or ""
    await _send(
        to=lead.email,
        subject=f"⏰ ההצעה עומדת לפוג — 7 ימים אחרונים",
        html=_render_final(lead.name, site_url, password),
        settings=settings,
        client=client,
    )
