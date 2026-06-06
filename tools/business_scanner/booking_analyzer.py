"""
Analyzes a business website to detect manual booking patterns.
Returns a score (0-100+) and a list of findings that explain the score.
Higher score = better lead (relies on manual booking / outdated site).
"""

import re
import sys
import argparse
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "he,en;q=0.9",
}

# (regex_pattern, score, human_readable_label)
MANUAL_BOOKING_SIGNALS = [
    (r'להזמנה\s*(חייגו|התקשרו|טלפון)', 40, 'להזמנה חייגו/התקשרו'),
    (r'לקביעת\s*תור\s*(חייגו|התקשרו)', 40, 'לקביעת תור חייגו'),
    (r'לתיאום\s*(תור|פגישה)\s*(חייגו|התקשרו)', 40, 'לתיאום תור חייגו'),
    (r'להזמנה\s*שלח(ו|י)?\s*(מייל|אימייל|email)', 35, 'להזמנה שלחו מייל'),
    (r'הזמנות?\s*(רק\s*)?(בטלפון|במייל|דרך\s*טלפון)', 35, 'הזמנות בטלפון/מייל'),
    (r'להזמנה\s*שלח(ו|י)?\s*וואטסאפ', 30, 'להזמנה שלחו וואטסאפ'),
    (r'לרכישה\s*(צרו\s*קשר|שלחו|חייגו)', 30, 'לרכישה צרו קשר'),
    (r'to\s*book\s*(call|phone|email|whatsapp)', 30, 'to book call/email'),
    (r'order\s*via\s*(phone|email|whatsapp)', 25, 'order via phone/email'),
    (r'(?:wa\.me|api\.whatsapp\.com/send)[^\s"\'<]{3,}', 25, 'קישור WhatsApp להזמנה'),
    (r'לפרטים\s*(נוספים\s*)?(והזמנה|וקביעת\s*תור)', 20, 'לפרטים והזמנה'),
    (r'צרו\s*קשר\s*(לקביעת|להזמנ)', 20, 'צרו קשר לקביעת תור'),
]

BOOKING_WIDGET_SIGNATURES = [
    'calendly.com',
    'simplybook',
    'booksy',
    'fresha.com',
    'acuityscheduling',
    'squareup.com',
    'square.site',
    'vcita.com',
    'setmore.com',
    'appointy.com',
    'timify.com',
    'reservio.com',
    'treatwell.co',
    'mindbodyonline.com',
    'pike13.com',
    'classpass.com',
    'woocommerce.*booking',
    'wix.com/bookings',
    'wixbookings',
    'woo-booking',
    'snipcart.com',
    'ecwid.com',
    'shopify',
    'woocommerce',
    'add[_-]to[_-]cart',
    'checkout',
    'paypal',
    'tranzila',
    'cardcom',
    'meshulam',
    'icount',
    'grow.*payment',
]

COPYRIGHT_PATTERN = re.compile(r'copyright\s*[©&copy;]*\s*(\d{4})', re.IGNORECASE)
WP_GENERATOR_PATTERN = re.compile(
    r'<meta[^>]+name=["\']generator["\'][^>]+content=["\']WordPress\s*([\d.]+)',
    re.IGNORECASE,
)
WP_CONTENT_PATTERN = re.compile(r'/wp-content/', re.IGNORECASE)


def analyze(url: str) -> dict:
    """
    Fetch and analyze a business website.

    Returns:
        {
            "url": str,
            "score": int,
            "findings": list[str],   # human-readable reasons
            "has_booking_system": bool,
            "wordpress_version": str | None,
            "reachable": bool,
        }
    """
    result = {
        "url": url,
        "score": 0,
        "findings": [],
        "has_booking_system": False,
        "wordpress_version": None,
        "reachable": False,
    }

    if not url:
        return result

    if not url.startswith(("http://", "https://")):
        url = "https://" + url
        result["url"] = url

    try:
        resp = requests.get(url, headers=HEADERS, timeout=12, allow_redirects=True)
        resp.raise_for_status()
    except requests.RequestException:
        return result

    result["reachable"] = True
    html = resp.text
    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text(" ", strip=True)
    html_lower = html.lower()

    # --- Check for existing booking system (disqualifies lead) ---
    for sig in BOOKING_WIDGET_SIGNATURES:
        if re.search(sig, html_lower):
            result["has_booking_system"] = True
            result["findings"].append(f"יש מערכת הזמנות: {sig.split('.')[0]}")
            break

    # If already has a proper booking/payment system, score stays 0
    if result["has_booking_system"]:
        return result

    # --- Manual booking signals ---
    for pattern, points, label in MANUAL_BOOKING_SIGNALS:
        if re.search(pattern, text, re.IGNORECASE):
            result["score"] += points
            result["findings"].append(f'❌ {label} (+{points})')

    # --- No HTTPS ---
    if resp.url.startswith("http://"):
        result["score"] += 15
        result["findings"].append("❌ אין HTTPS (+15)")

    # --- WordPress detection ---
    wp_match = WP_GENERATOR_PATTERN.search(html)
    if not wp_match and WP_CONTENT_PATTERN.search(html):
        # WordPress present but version hidden
        result["wordpress_version"] = "unknown"
        result["score"] += 5
        result["findings"].append("⚠️ WordPress (גרסה לא ידועה) (+5)")
    elif wp_match:
        version_str = wp_match.group(1).strip()
        result["wordpress_version"] = version_str
        try:
            major = float(version_str.split(".")[0] + "." + version_str.split(".")[1] if len(version_str.split(".")) > 1 else version_str)
        except (ValueError, IndexError):
            major = 0.0

        if major < 5.0:
            result["score"] += 30
            result["findings"].append(f"❌ WordPress {version_str} — ישן מאוד (לפני 2018) (+30)")
        elif major < 6.0:
            result["score"] += 15
            result["findings"].append(f"⚠️ WordPress {version_str} — ישן (לפני 2022) (+15)")
        else:
            result["score"] += 5
            result["findings"].append(f"ℹ️ WordPress {version_str} (+5)")

    # --- Old copyright year ---
    copyright_match = COPYRIGHT_PATTERN.search(text)
    if copyright_match:
        year = int(copyright_match.group(1))
        if year < 2022:
            result["score"] += 10
            result["findings"].append(f"⚠️ שנת copyright {year} (+10)")

    # --- Mobile responsiveness: check for viewport meta tag ---
    viewport = soup.find("meta", attrs={"name": "viewport"})
    if not viewport:
        result["score"] += 10
        result["findings"].append("❌ אין meta viewport — לא מותאם לנייד (+10)")

    # --- Free Wix subdomain ---
    parsed = urlparse(resp.url)
    if "wixsite.com" in parsed.netloc:
        result["score"] += 10
        result["findings"].append("⚠️ Wix חינמי (wixsite.com) (+10)")

    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Analyze a business website for manual booking signals")
    parser.add_argument("--url", required=True, help="URL to analyze")
    args = parser.parse_args()

    r = analyze(args.url)
    print(f"\nURL: {r['url']}")
    print(f"Score: {r['score']}/100")
    print(f"Has booking system: {r['has_booking_system']}")
    if r['wordpress_version']:
        print(f"WordPress: {r['wordpress_version']}")
    print("\nFindings:")
    for f in r['findings']:
        print(f"  {f}")
