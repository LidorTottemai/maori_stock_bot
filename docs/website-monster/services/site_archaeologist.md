# site_archaeologist.py

> **קובץ:** `app/services/site_archaeologist.py`
> **סטטוס:** 🔴 לא קיים — יש לממש
> **תלויות:** `playwright`, `asyncio`, `re`, `dataclasses`

---

## מה זה עושה

סורק אתר קיים עם Playwright ומחלץ **כל המידע הרלוונטי לבניית האתר החדש**:
- תוכן עסקי (שירותים, צוות, שעות, כתובת)
- יכולות קיימות (האם יש הזמנות? תפריט? חנות?)
- צבע ראשי מהCSS הקיים
- מה חסר באתר הנוכחי (גלריה? המלצות?)

הפלט הוא `SiteData` שעובר ישירות ל-`site_generator.py` לבניית `CLAUDE.md`.

---

## Data Classes

```python
from dataclasses import dataclass, field

@dataclass
class PageData:
    href: str
    title: str
    content_summary: str = ""

@dataclass
class TeamMember:
    name: str
    role: str

@dataclass
class SiteData:
    url: str
    business_name: str
    business_type: str
    description: str
    phone: str
    email: str
    address: str
    city: str
    pages: list[PageData]          = field(default_factory=list)
    services: list[str]            = field(default_factory=list)
    team: list[TeamMember]         = field(default_factory=list)
    gallery_images: list[str]      = field(default_factory=list)
    social_links: dict[str, str]   = field(default_factory=dict)
    whatsapp: str                  = ""
    opening_hours: dict[str, str]  = field(default_factory=dict)
    primary_color: str             = "#2563eb"
    fonts_used: list[str]          = field(default_factory=list)
    has_booking: bool              = False
    has_menu: bool                 = False
    has_shop: bool                 = False
    has_payment: bool              = False
    missing_pages: list[str]       = field(default_factory=list)
```

---

## קוד מלא

```python
# app/services/site_archaeologist.py
import asyncio
import re
from dataclasses import dataclass, field
from playwright.async_api import async_playwright, Page

BUSINESS_TYPE_KEYWORDS = {
    "ספא": ["spa", "ספא", "עיסוי", "massage", "beauty", "נייל"],
    "מסעדה": ["restaurant", "מסעדה", "אוכל", "food", "menu", "תפריט", "cafe", "קפה"],
    "עורך דין": ["law", "עורך דין", "attorney", "legal", "עו\"ד"],
    "רואה חשבון": ["accountant", "רואה חשבון", "cpa", "חשבונות"],
    "קוסמטיקה": ["cosmet", "קוסמטיקה", "אסתטיקה", "aesthetic", "skin"],
    "כושר": ["gym", "כושר", "fitness", "pilates", "פילאטיס", "yoga", "יוגה"],
    "שיניים": ["dental", "שיניים", "dentist", "רופא שיניים"],
    "פסיכולוג": ["psycholog", "טיפול", "therapy", "therapist"],
    "אדריכל": ["architect", "אדריכל", "עיצוב", "interior"],
    "שרברב": ["plumb", "שרברב", "אינסטלטור", "נזילה"],
    "חשמלאי": ["electric", "חשמלאי", "חשמל"],
}


async def excavate_site(url: str, timeout: int = 90) -> SiteData:
    """Entry point — מקבל URL, מחזיר SiteData מובנה."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(
            user_agent="Mozilla/5.0 (compatible; TotteMaiBot/1.0)",
            viewport={"width": 1280, "height": 800},
            locale="he-IL",
        )
        page = await ctx.new_page()
        try:
            data = await _crawl(page, url, timeout)
        except Exception as exc:
            # fallback — מחזיר SiteData חסרה אם הסריקה נכשלת
            data = SiteData(url=url, business_name=url, business_type="עסק")
            data.description = f"[ארכיאולוגיה נכשלה: {exc}]"
        finally:
            await browser.close()
    return data


async def _crawl(page: Page, url: str, timeout: int) -> SiteData:
    await page.goto(url, wait_until="networkidle", timeout=timeout * 1000)
    await page.wait_for_timeout(1500)   # JS animations settle

    title        = await page.title()
    description  = await _get_meta(page, "description") or await _get_meta(page, "og:description")
    phone        = await _extract_phone(page)
    whatsapp     = _phone_to_whatsapp(phone)
    email        = await _extract_email(page)
    address      = await _extract_address(page)
    city         = _extract_city(address)
    primary_color = await _extract_primary_color(page)
    fonts        = await _extract_fonts(page)

    nav_links    = await _extract_nav_links(page)
    services     = await _extract_services(page)
    team         = await _extract_team(page)
    social       = await _extract_social(page)
    images       = await _extract_images(page)
    hours        = await _extract_hours(page)

    has_booking  = await _has_selector(page,
        "[class*='book'], [class*='appoint'], [href*='calendly'], [href*='setmore'], [href*='acuity']"
    )
    has_menu     = await _has_selector(page, "[class*='menu-item'], [href*='/menu'], [data-menu]")
    has_shop     = await _has_selector(page,
        "[class*='woocommerce'], [class*='shopify'], [href*='/shop'], [class*='add-to-cart']"
    )

    body_text    = (await page.inner_text("body")).lower()
    business_type = _detect_business_type(title + " " + description + " " + body_text)

    return SiteData(
        url=url,
        business_name=_clean_title(title),
        business_type=business_type,
        description=description,
        phone=phone,
        email=email,
        address=address,
        city=city,
        pages=[PageData(href=l["href"], title=l["text"]) for l in nav_links[:8]],
        services=services[:12],
        team=team[:8],
        gallery_images=images[:10],
        social_links=social,
        whatsapp=whatsapp,
        opening_hours=hours,
        primary_color=primary_color,
        fonts_used=fonts,
        has_booking=has_booking,
        has_menu=has_menu,
        has_shop=has_shop,
        has_payment=has_booking or has_shop,
        missing_pages=_detect_missing_pages(nav_links, services, team, has_booking),
    )


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _get_meta(page: Page, name: str) -> str:
    el = await page.query_selector(f'meta[name="{name}"], meta[property="{name}"]')
    if el:
        return (await el.get_attribute("content") or "").strip()
    return ""


async def _extract_phone(page: Page) -> str:
    el = await page.query_selector("a[href^='tel:']")
    if el:
        return (await el.get_attribute("href") or "").replace("tel:", "").strip()
    text = await page.inner_text("body")
    match = re.search(r"0\d[\-\s]?\d{3}[\-\s]?\d{4}", text)
    return match.group(0).replace("-", "").replace(" ", "") if match else ""


def _phone_to_whatsapp(phone: str) -> str:
    digits = re.sub(r"\D", "", phone)
    if digits.startswith("0"):
        digits = "972" + digits[1:]
    return digits


async def _extract_email(page: Page) -> str:
    el = await page.query_selector("a[href^='mailto:']")
    if el:
        href = (await el.get_attribute("href") or "").replace("mailto:", "").split("?")[0]
        return href.strip()
    text = await page.inner_text("body")
    match = re.search(r"[\w.+-]+@[\w-]+\.[a-z]{2,}", text)
    return match.group(0) if match else ""


async def _extract_address(page: Page) -> str:
    # schema.org
    el = await page.query_selector('[itemprop="streetAddress"], [itemprop="address"]')
    if el:
        return (await el.inner_text()).strip()
    # נסיון מהטקסט — חפש דפוסי כתובת ישראלית
    text = await page.inner_text("body")
    match = re.search(r"(רח(?:וב)?|שד(?:רות)?|דרך|כיכר)\s+[\w֐-׿\s]+\d+", text)
    return match.group(0).strip() if match else ""


def _extract_city(address: str) -> str:
    israeli_cities = [
        "תל אביב", "ירושלים", "חיפה", "ראשון לציון", "פתח תקווה",
        "אשדוד", "נתניה", "באר שבע", "בני ברק", "רמת גן",
        "הרצליה", "כפר סבא", "מודיעין", "רחובות", "חולון",
        "בת ים", "רעננה", "גבעתיים", "עפולה", "אשקלון",
    ]
    for city in israeli_cities:
        if city in address:
            return city
    return ""


async def _extract_primary_color(page: Page) -> str:
    return await page.evaluate("""() => {
        const style = getComputedStyle(document.documentElement)
        const cssVarNames = ['--primary', '--color-primary', '--brand-color',
                             '--accent', '--main-color', '--theme-color']
        for (const v of cssVarNames) {
            const val = style.getPropertyValue(v).trim()
            if (val && val.startsWith('#')) return val
        }
        // fallback: background-color של כפתור ראשי
        const btns = document.querySelectorAll('button, .btn, [class*="btn-primary"], [class*="button"]')
        for (const btn of btns) {
            const bg = getComputedStyle(btn).backgroundColor
            if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
                // Convert rgb to hex
                const m = bg.match(/rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)/)
                if (m) return '#' + [m[1],m[2],m[3]].map(n => parseInt(n).toString(16).padStart(2,'0')).join('')
            }
        }
        return '#2563eb'
    }""")


async def _extract_fonts(page: Page) -> list[str]:
    return await page.evaluate("""() => {
        const fonts = new Set()
        document.querySelectorAll('*').forEach(el => {
            const f = getComputedStyle(el).fontFamily
            if (f) f.split(',').forEach(name => fonts.add(name.trim().replace(/['"]/g, '')))
        })
        return [...fonts].slice(0, 5)
    }""")


async def _extract_nav_links(page: Page) -> list[dict]:
    return await page.eval_on_selector_all(
        "nav a, header a",
        """els => els
            .map(el => ({ href: el.href, text: el.innerText.trim() }))
            .filter(l => l.text && l.href && !l.href.includes('#'))
            .slice(0, 10)"""
    )


async def _extract_services(page: Page) -> list[str]:
    # נסה לחלץ שירותים מכותרות H2/H3 או רשימות בסעיף "שירותים"
    services_section = await page.query_selector(
        "[class*='service'], [class*='treatment'], [id*='service'], section:has(h2)"
    )
    if not services_section:
        return []
    items = await services_section.eval_on_selector_all(
        "h2, h3, h4, li",
        "els => els.map(el => el.innerText.trim()).filter(t => t.length > 2 && t.length < 60)"
    )
    return items[:12]


async def _extract_team(page: Page) -> list[TeamMember]:
    members = []
    # schema.org
    cards = await page.query_selector_all("[itemprop='employee'], [class*='team-member'], [class*='staff']")
    for card in cards[:8]:
        name = ""
        role = ""
        name_el = await card.query_selector("[itemprop='name'], h3, h4, .name, .member-name")
        role_el = await card.query_selector("[itemprop='jobTitle'], .role, .title, .position, p")
        if name_el:
            name = (await name_el.inner_text()).strip()
        if role_el:
            role = (await role_el.inner_text()).strip()
        if name:
            members.append(TeamMember(name=name, role=role))
    return members


async def _extract_social(page: Page) -> dict[str, str]:
    social = {}
    platforms = {
        "instagram": "instagram.com",
        "facebook": "facebook.com",
        "tiktok": "tiktok.com",
        "linkedin": "linkedin.com",
        "youtube": "youtube.com",
        "twitter": "twitter.com",
    }
    links = await page.eval_on_selector_all(
        "a[href]", "els => els.map(el => el.href)"
    )
    for link in links:
        for platform, domain in platforms.items():
            if domain in link and platform not in social:
                social[platform] = link
    return social


async def _extract_images(page: Page) -> list[str]:
    return await page.eval_on_selector_all(
        "img[src]",
        """els => els
            .map(el => el.src)
            .filter(src =>
                src.startsWith('http') &&
                !src.includes('logo') &&
                !src.includes('icon') &&
                !src.includes('pixel') &&
                !src.includes('1x1') &&
                !src.endsWith('.svg')
            )
            .slice(0, 10)"""
    )


async def _extract_hours(page: Page) -> dict[str, str]:
    hours = {}
    # schema.org
    els = await page.query_selector_all("[itemprop='openingHours']")
    for el in els:
        text = (await el.get_attribute("content") or await el.inner_text()).strip()
        # format: "Mo-Fr 09:00-18:00"
        hours[text[:5]] = text[6:] if len(text) > 6 else text
    return hours


async def _has_selector(page: Page, selector: str) -> bool:
    el = await page.query_selector(selector)
    return el is not None


def _clean_title(title: str) -> str:
    # מסיר suffixes נפוצים כמו " | Home", " - Official Site"
    for sep in [" | ", " - ", " — ", " · "]:
        if sep in title:
            return title.split(sep)[0].strip()
    return title.strip()


def _detect_business_type(text: str) -> str:
    text = text.lower()
    scores: dict[str, int] = {}
    for btype, keywords in BUSINESS_TYPE_KEYWORDS.items():
        scores[btype] = sum(1 for kw in keywords if kw.lower() in text)
    best = max(scores, key=lambda k: scores[k])
    return best if scores[best] > 0 else "עסק"


def _detect_missing_pages(
    nav_links: list[dict],
    services: list[str],
    team: list[TeamMember],
    has_booking: bool,
) -> list[str]:
    existing_titles = {l["text"].strip().lower() for l in nav_links}
    missing = []

    if not any("גלריה" in t or "gallery" in t or "תמונות" in t for t in existing_titles):
        missing.append("gallery")
    if not any("המלצות" in t or "ביקורות" in t or "reviews" in t for t in existing_titles):
        missing.append("testimonials")
    if team and not any("צוות" in t or "team" in t or "אודות" in t or "about" in t for t in existing_titles):
        missing.append("team-section")
    if services and not any("שירות" in t or "service" in t or "טיפול" in t for t in existing_titles):
        missing.append("services-page")
    if not has_booking and not any("הזמנ" in t or "book" in t or "קביע" in t for t in existing_titles):
        missing.append("booking-cta")

    return missing
```

---

## שימוש

```python
from app.services.site_archaeologist import excavate_site

# בתוך async context
site_data = await excavate_site("https://www.spa-example.co.il")

print(site_data.business_name)   # "ספא יפה"
print(site_data.business_type)   # "ספא"
print(site_data.primary_color)   # "#e91e8c"
print(site_data.services)        # ["עיסוי שוודי", "פילינג גוף", "פנים"]
print(site_data.missing_pages)   # ["gallery", "testimonials"]
```

---

## Fallbacks

| מה נכשל | fallback |
|---------|---------|
| `goto()` timeout | מחזיר `SiteData` עם שם = URL |
| אין טלפון בDOM | regex על body text |
| אין צבע בCSS vars | background-color של כפתור ראשי |
| אין nav links | `pages = []` (generator יבנה standard pages) |
| אין שירותים | `services = []` (generator יכתוב שירותים גנריים לפי business_type) |

---

## בדיקות

```python
# test_site_archaeologist.py
import pytest
from app.services.site_archaeologist import excavate_site, _detect_business_type, _phone_to_whatsapp

def test_phone_to_whatsapp():
    assert _phone_to_whatsapp("052-1234567") == "972521234567"
    assert _phone_to_whatsapp("0521234567") == "972521234567"

def test_detect_business_type():
    assert _detect_business_type("ספא עיסוי טיפול עור") == "ספא"
    assert _detect_business_type("מסעדה איטלקית תפריט") == "מסעדה"

@pytest.mark.asyncio
async def test_excavate_fallback():
    # אתר שלא קיים — fallback ולא crash
    data = await excavate_site("https://this-does-not-exist-12345.co.il", timeout=5)
    assert data.url == "https://this-does-not-exist-12345.co.il"
```

← [[00 - Services Overview]]
