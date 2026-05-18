"""
Analyzes a business website to detect manual booking patterns.
Returns a typed result with a score and human-readable findings.
Higher score = stronger lead (relies on manual booking / outdated infrastructure).
"""

import logging
import re
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup
from pydantic import BaseModel

logger = logging.getLogger(__name__)

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "he,en;q=0.9",
}

# (regex, points, label)
_MANUAL_SIGNALS: list[tuple[str, int, str]] = [
    (r"להזמנה\s*(חייגו|התקשרו|טלפון)", 40, "להזמנה חייגו/התקשרו"),
    (r"לקביעת\s*תור\s*(חייגו|התקשרו)", 40, "לקביעת תור חייגו"),
    (r"לתיאום\s*(תור|פגישה)\s*(חייגו|התקשרו)", 40, "לתיאום תור חייגו"),
    (r"להזמנה\s*שלח(ו|י)?\s*(מייל|אימייל|email)", 35, "להזמנה שלחו מייל"),
    (r"הזמנות?\s*(רק\s*)?(בטלפון|במייל|דרך\s*טלפון)", 35, "הזמנות בטלפון/מייל"),
    (r"להזמנה\s*שלח(ו|י)?\s*וואטסאפ", 30, "להזמנה שלחו וואטסאפ"),
    (r"לרכישה\s*(צרו\s*קשר|שלחו|חייגו)", 30, "לרכישה צרו קשר"),
    (r"to\s*book\s*(call|phone|email|whatsapp)", 30, "to book call/email"),
    (r"order\s*via\s*(phone|email|whatsapp)", 25, "order via phone/email"),
    (r"(?:wa\.me|api\.whatsapp\.com/send)[^\s\"'<]{3,}", 25, "קישור WhatsApp להזמנה"),
    (r"לפרטים\s*(נוספים\s*)?(והזמנה|וקביעת\s*תור)", 20, "לפרטים והזמנה"),
    (r"צרו\s*קשר\s*(לקביעת|להזמנ)", 20, "צרו קשר לקביעת תור"),
]

_BOOKING_WIDGETS: list[str] = [
    "calendly.com", "simplybook", "booksy", "fresha.com",
    "acuityscheduling", "squareup.com", "square.site",
    "vcita.com", "setmore.com", "appointy.com", "timify.com",
    "reservio.com", "treatwell.co", "mindbodyonline.com",
    "pike13.com", "classpass.com", "wixbookings",
    "snipcart.com", "ecwid.com", "shopify",
    r"woocommerce.*booking", r"add[_-]to[_-]cart",
    "paypal", "tranzila", "cardcom", "meshulam", "icount",
]

_WP_GENERATOR = re.compile(
    r"<meta[^>]+name=[\"']generator[\"'][^>]+content=[\"']WordPress\s*([\d.]+)",
    re.IGNORECASE,
)
_WP_CONTENT = re.compile(r"/wp-content/", re.IGNORECASE)
_COPYRIGHT = re.compile(r"copyright\s*[©&copy;]*\s*(\d{4})", re.IGNORECASE)


class AnalysisResult(BaseModel):
    url: str
    score: int
    findings: list[str]
    has_booking_system: bool
    wordpress_version: str | None
    reachable: bool


async def analyze(url: str, client: httpx.AsyncClient) -> AnalysisResult:
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    result = AnalysisResult(
        url=url, score=0, findings=[], has_booking_system=False,
        wordpress_version=None, reachable=False,
    )

    try:
        resp = await client.get(url, headers=_HEADERS)
        resp.raise_for_status()
    except (httpx.RequestError, httpx.HTTPStatusError) as exc:
        logger.debug("Unreachable %s: %s", url, exc)
        return result

    result.reachable = True
    html = resp.text
    html_lower = html.lower()
    soup = BeautifulSoup(html, "lxml")
    text = soup.get_text(" ", strip=True)

    # Booking widget — disqualifies the lead
    for sig in _BOOKING_WIDGETS:
        if re.search(sig, html_lower):
            result.has_booking_system = True
            result.findings.append(f"יש מערכת הזמנות: {sig.split('.')[0]}")
            return result

    # Manual booking signals
    for pattern, points, label in _MANUAL_SIGNALS:
        if re.search(pattern, text, re.IGNORECASE):
            result.score += points
            result.findings.append(f"❌ {label} (+{points})")

    # HTTPS check
    if str(resp.url).startswith("http://"):
        result.score += 15
        result.findings.append("❌ אין HTTPS (+15)")

    # WordPress version
    wp_match = _WP_GENERATOR.search(html)
    if not wp_match and _WP_CONTENT.search(html):
        result.wordpress_version = "unknown"
        result.score += 5
        result.findings.append("⚠️ WordPress (גרסה לא ידועה) (+5)")
    elif wp_match:
        version_str = wp_match.group(1).strip()
        result.wordpress_version = version_str
        parts = version_str.split(".")
        try:
            major_minor = float(f"{parts[0]}.{parts[1]}" if len(parts) > 1 else parts[0])
        except (ValueError, IndexError):
            major_minor = 0.0

        if major_minor < 5.0:
            result.score += 30
            result.findings.append(f"❌ WordPress {version_str} — ישן מאוד (לפני 2018) (+30)")
        elif major_minor < 6.0:
            result.score += 15
            result.findings.append(f"⚠️ WordPress {version_str} — ישן (לפני 2022) (+15)")
        else:
            result.score += 5
            result.findings.append(f"ℹ️ WordPress {version_str} (+5)")

    # Old copyright year
    copy_match = _COPYRIGHT.search(text)
    if copy_match and int(copy_match.group(1)) < 2022:
        result.score += 10
        result.findings.append(f"⚠️ שנת copyright {copy_match.group(1)} (+10)")

    # Mobile responsiveness
    if not soup.find("meta", attrs={"name": "viewport"}):
        result.score += 10
        result.findings.append("❌ אין meta viewport — לא מותאם לנייד (+10)")

    # Free Wix subdomain
    if "wixsite.com" in urlparse(str(resp.url)).netloc:
        result.score += 10
        result.findings.append("⚠️ Wix חינמי (wixsite.com) (+10)")

    return result
