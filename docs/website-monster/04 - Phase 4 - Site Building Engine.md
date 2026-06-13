# ⚙️ Phase 4 — Smart Site Building Engine

> **מטרה:** מנוע בנייה חכם — לומד את האתר הישן, מבין מה חסר, בונה את אותם הדפים בעיצוב עולמי.
> **קבצים:** `app/services/site_archaeologist.py` · `app/services/site_generator.py`
> **תנאי קדם:** [[03.5 - Phase 3.5 - Inspiration Crawler]] · [[04.1]] · [[04.2]] · [[04.3]]

---

## הרעיון המרכזי

```
האתר הישן (URL קיים)
        ↓
Site Archaeologist (Playwright)
  ← מה הדפים? ← מה התוכן בכל דף? ← מה חסר?
        ↓
Architecture Decision
  ← אותם דפים + שדרוגים + modules חסרים
        ↓
CLAUDE.md דינמי (לא template!)
  ← InspirationReport + ארכיאולוגיה + חוקים גנריים
        ↓
Claude Code subprocess (150 turns / 60 דקות)
        ↓
~35 קבצי Next.js מוכנים לdeploy
```

---

## שלב א — Site Archaeologist

```python
# app/services/site_archaeologist.py
from pydantic import BaseModel
from playwright.async_api import async_playwright

class ServiceData(BaseModel):
    name: str
    price: str | None
    duration: str | None
    description: str | None

class TeamMember(BaseModel):
    name: str
    role: str
    image_url: str | None

class PageData(BaseModel):
    url: str
    route: str                    # /about, /services, ...
    title: str
    h1: str | None
    sections: list[str]           # כותרות h2/h3 שנמצאו
    content_summary: str          # 300 תווים של תוכן ראשי
    has_form: bool
    has_gallery: bool
    has_prices: bool
    has_map: bool

class SiteArchaeology(BaseModel):
    # מבנה
    pages: list[PageData]
    nav_items: list[str]

    # תוכן
    services: list[ServiceData]
    team_members: list[TeamMember]
    testimonials: list[str]
    gallery_image_count: int
    contact: dict                  # phone, address, email, hours

    # יכולות קיימות
    has_booking: bool
    has_online_payment: bool
    has_shop: bool
    has_restaurant_menu: bool
    has_blog: bool
    has_accessibility_widget: bool  # האם יש כפתור נגישות

    # עיצוב
    brand_colors: list[str]
    existing_fonts: list[str]
    is_mobile_friendly: bool


async def dig(url: str) -> SiteArchaeology:
    """סורק אתר קיים ומחלץ את כל המידע הרלוונטי."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # דסקטופ
        await page.set_viewport_size({"width": 1440, "height": 900})
        await page.goto(url, timeout=30000, wait_until="networkidle")
        await page.wait_for_timeout(2000)

        # --- ניווט ---
        nav_items = await page.evaluate("""() =>
            Array.from(document.querySelectorAll('nav a, header a'))
                .map(a => a.innerText.trim())
                .filter(t => t.length > 0 && t.length < 40)
                .slice(0, 10)
        """)

        # --- דפים ---
        internal_links = await page.evaluate(f"""() => {{
            const base = new URL('{url}')
            return [...new Set(
                Array.from(document.querySelectorAll('a[href]'))
                    .map(a => a.href)
                    .filter(h => h.startsWith(base.origin) && !h.includes('#'))
            )].slice(0, 20)
        }}""")

        pages = []
        for link in [url] + internal_links[:8]:
            try:
                await page.goto(link, timeout=15000)
                pd = await _extract_page_data(page, link, url)
                pages.append(pd)
            except Exception:
                pass

        # --- שירותים ומחירים ---
        await page.goto(url, timeout=15000)
        services = await _extract_services(page)

        # --- תמונות גלריה ---
        gallery_count = await page.evaluate("""() =>
            document.querySelectorAll('img[src*="gallery"], [class*="gallery"] img, [class*="Gallery"] img').length
        """)

        # --- פרטי קשר ---
        contact = await _extract_contact(page)

        # --- כפתור נגישות ---
        has_a11y = await page.evaluate("""() =>
            !!document.querySelector(
                '[class*="accessibility"], [id*="accessibility"], [aria-label*="נגישות"],
                 [class*="nagish"], .equalweb-btn, #INDmenu-btn, .userway-btn'
            )
        """)

        # --- עיצוב ---
        brand_colors = await page.evaluate("""() => {
            const els = [document.body, document.querySelector('header'), document.querySelector('button')]
            const cols = new Set()
            els.filter(Boolean).forEach(el => {
                const s = getComputedStyle(el)
                ;[s.backgroundColor, s.color, s.borderColor].forEach(c => {
                    if (c && c !== 'rgba(0, 0, 0, 0)') cols.add(c)
                })
            })
            return [...cols].slice(0, 6)
        }""")

        fonts = await page.evaluate("""() => {
            const s = getComputedStyle(document.body)
            const h1 = document.querySelector('h1')
            return [...new Set([
                s.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
                h1 ? getComputedStyle(h1).fontFamily.split(',')[0].replace(/['"]/g, '').trim() : null,
            ].filter(Boolean))]
        }""")

        # mobile check
        await page.set_viewport_size({"width": 390, "height": 844})
        await page.goto(url, timeout=15000)
        mobile_ok = await page.evaluate("""() =>
            !!document.querySelector('meta[name="viewport"]') &&
            document.body.scrollWidth <= window.innerWidth
        """)

        await browser.close()

        return SiteArchaeology(
            pages=pages,
            nav_items=nav_items,
            services=services,
            team_members=[],
            testimonials=[],
            gallery_image_count=gallery_count,
            contact=contact,
            has_booking=any(
                kw in str(nav_items).lower()
                for kw in ["הזמנ", "book", "תור", "appoint"]
            ),
            has_online_payment=False,
            has_shop="חנות" in str(nav_items) or "shop" in str(nav_items).lower(),
            has_restaurant_menu="תפריט" in str(nav_items) or "menu" in str(nav_items).lower(),
            has_blog=any(kw in str(nav_items).lower() for kw in ["בלוג", "blog", "מאמר"]),
            has_accessibility_widget=has_a11y,
            brand_colors=brand_colors,
            existing_fonts=fonts,
            is_mobile_friendly=mobile_ok,
        )
```

---

## שלב ב — Architecture Decision

```python
# app/services/site_archaeologist.py (המשך)

class NewPage(BaseModel):
    route: str
    title_he: str
    sections: list[str]          # sections לבנות
    content_notes: str           # הנחיות לClaude על התוכן

class SiteArchitecture(BaseModel):
    pages: list[NewPage]
    modules: list[str]           # BookingWidget, ShopModule, RestaurantMenu
    needs_payment: bool
    payment_mode: str            # "cardcom" | "whatsapp_only"


def decide_architecture(arch: SiteArchaeology, site_type: str) -> SiteArchitecture:
    pages = []

    # העתק את כל הדפים שנמצאו
    for pd in arch.pages:
        pages.append(NewPage(
            route=_normalize_route(pd.route),
            title_he=pd.title,
            sections=_upgrade_sections(pd.sections, site_type),
            content_notes=f"הדף הישן כלל: {pd.content_summary}. שמור על כל המידע, שדרג את העיצוב.",
        ))

    # דפים חסרים — הוסף
    existing_routes = {p.route for p in pages}
    if "/" not in existing_routes:
        pages.insert(0, NewPage(route="/", title_he="בית", sections=["Hero", "Services", "About", "Stats", "Testimonials", "CTA"], content_notes="דף הבית"))
    if "/contact" not in existing_routes:
        pages.append(NewPage(route="/contact", title_he="צור קשר", sections=["ContactForm", "Map", "BusinessHours"], content_notes=""))

    # modules חדשים
    modules = []
    needs_payment = bool(arch.services) and any(s.price for s in arch.services)

    if not arch.has_booking and site_type in ("spa", "clinic", "fitness", "salon"):
        modules.append("BookingWidget")
        # הוסף דף booking אם לא קיים
        if "/booking" not in existing_routes:
            pages.append(NewPage(route="/booking", title_he="קביעת תור", sections=["BookingWidget"], content_notes=""))

    if not arch.has_restaurant_menu and site_type == "restaurant":
        modules.append("RestaurantMenu")
        if "/menu" not in existing_routes:
            pages.append(NewPage(route="/menu", title_he="תפריט", sections=["RestaurantMenu"], content_notes=""))

    return SiteArchitecture(
        pages=sorted(pages, key=lambda p: (p.route != "/", p.route)),
        modules=modules,
        needs_payment=needs_payment,
        payment_mode="cardcom" if needs_payment else "whatsapp_only",
    )
```

---

## שלב ג — CLAUDE.md דינמי

```python
# app/services/site_generator.py

def build_claude_md(
    lead: Lead,
    arch: SiteArchitecture,
    archaeology: SiteArchaeology,
    inspiration: InspirationReport,
) -> str:

    pages_spec = "\n".join(
        f"- {p.route} ({p.title_he}): sections={p.sections}. {p.content_notes}"
        for p in arch.pages
    )

    modules_spec = "\n".join(f"- {m}" for m in arch.modules) if arch.modules else "- None"

    return f"""# CLAUDE.md — {lead.business_name}

## YOUR IDENTITY
You are a creative director + senior Next.js 15 engineer.
Your work wins Awwwards SOTD. If this looks like a generic template — you FAILED.
You are building a website for: {lead.business_name} ({lead.category}) in {lead.city}, Israel.

## LIBRARIES (INSTALLED — NEVER REIMPLEMENT)
```
@tottemai/ui IS INSTALLED.
import {{ TextReveal, CharReveal, ScrollReveal, ClipReveal }} from "@tottemai/ui"
import {{ MagneticButton, PageTransition, CustomCursor, ScrollProgress }} from "@tottemai/ui"
import {{ Parallax, Marquee, CountUp, Reveal3D, HorizontalScroll }} from "@tottemai/ui"
import {{ Navbar, Footer, MobileMenu, SectionTitle, Container, Section }} from "@tottemai/ui"
import {{ Spotlight, BentoGrid, AnimatedGradient, AuroraText }} from "@tottemai/ui"
import {{ Button, Input, Select, Dialog, Sheet, Toast }} from "@tottemai/ui"
{'import {{ BookingWidget }} from "@tottemai/ui/booking"' if "BookingWidget" in arch.modules else ""}
{'import {{ RestaurantMenu }} from "@tottemai/ui/restaurant"' if "RestaurantMenu" in arch.modules else ""}
```
Your job: LAYOUT + CONTENT + CHOREOGRAPHY. Never reimplement these.

## PAGES TO BUILD (based on old site analysis)
{pages_spec}

## NEW MODULES TO ADD (did not exist in old site)
{modules_spec}

## WORLD-CLASS INSPIRATION (from site archaeology of top {lead.category} sites)
{inspiration.summary_for_claude}

## OLD SITE ANALYSIS
- Old site had {len(archaeology.pages)} pages, {len(archaeology.services)} services
- Brand colors found: {', '.join(archaeology.brand_colors[:3])}
- Fonts found: {', '.join(archaeology.existing_fonts)}
- Had accessibility widget: {"YES" if archaeology.has_accessibility_widget else "NO — YOU MUST ADD ONE (Israeli law)"}
- Mobile-friendly: {"YES" if archaeology.is_mobile_friendly else "NO — YOU MUST FIX THIS"}

## MANDATORY STANDARDS (no exceptions)

### MOBILE-FIRST
Every component starts from mobile. Desktop = enhancement only.
breakpoints: sm(640), md(768), lg(1024), xl(1280)
Touch targets: minimum 44×44px. No hover-only interactions.

### HEBREW-FIRST (RTL)
dir="rtl" on <html>. CSS logical properties everywhere (margin-inline, padding-inline).
next-intl: he primary, en secondary.
messages/he.json: ALL content. messages/en.json: translation.

### TYPOGRAPHY
```ts
// tailwind.config.ts — REQUIRED
fontSize: {{
  "display-2xl": ["clamp(3rem,8vw,7rem)",    {{lineHeight:"1.05",letterSpacing:"-0.04em"}}],
  "display-xl":  ["clamp(2.5rem,6vw,5rem)",  {{lineHeight:"1.1", letterSpacing:"-0.03em"}}],
  "display-lg":  ["clamp(2rem,4vw,3.5rem)",  {{lineHeight:"1.15",letterSpacing:"-0.02em"}}],
  "heading":     ["clamp(1.5rem,3vw,2.5rem)",{{lineHeight:"1.2"}}],
  "body-lg":     ["1.125rem", {{lineHeight:"1.7"}}],
  "body":        ["1rem",     {{lineHeight:"1.7"}}],
}}
```
Fonts: {_pick_fonts(lead.category)} — NOT just Inter.

### COLORS — CSS VARIABLES ONLY
```css
/* app/globals.css */
:root {{
  --color-primary:       {_pick_primary(archaeology.brand_colors)};
  --color-primary-hover: {_pick_primary_hover(archaeology.brand_colors)};
  --color-secondary:     {_pick_secondary(archaeology.brand_colors)};
  --color-accent:        #f59e0b;
  --color-bg:            #0a0a0a;
  --color-surface:       #111111;
  --color-surface-2:     #1a1a1a;
  --color-border:        #222222;
  --color-text:          #f0f0f0;
  --color-text-muted:    #888888;
}}
```
ZERO hardcoded hex colors outside globals.css.

### HERO (HOME PAGE — ALL REQUIRED)
✓ h-screen, full viewport
✓ <TextReveal> on main headline — NOT a plain <h1>
✓ <MagneticButton> on primary CTA
✓ Animated background: AnimatedGradient OR Spotlight OR video with overlay
✓ Scroll arrow with bounce animation
✓ Phone number: big, clickable, tel: link
✓ Lenis + GSAP initialized in layout.tsx

### ACCESSIBILITY (Israeli Law — תקן ישראלי 5568)
See [[04.1 - Accessibility Module]] — ALL requirements mandatory.
Must include: AccessibilityWidget component + /accessibility-statement page

### SEO
See [[04.2 - SEO & Performance]] — ALL requirements mandatory.

### SECURITY
See [[04.3 - Security Layer]] — ALL requirements mandatory.

## FILE ORDER (build in this exact order)
1.  package.json
2.  next.config.mjs
3.  tsconfig.json
4.  tailwind.config.ts
5.  postcss.config.mjs
6.  middleware.ts
7.  lib/env.ts
8.  lib/config.ts
9.  business.config.json
10. messages/he.json
11. messages/en.json
12. app/globals.css
13. app/[locale]/layout.tsx        ← SmoothScroll + CustomCursor + ScrollProgress + AccessibilityWidget
14. app/[locale]/page.tsx          ← Home
{_generate_page_files(arch.pages)}
{_generate_api_files(arch.modules, arch.needs_payment)}
    components/a11y/AccessibilityWidget.tsx
    app/[locale]/accessibility-statement/page.tsx
    app/sitemap.ts
    app/robots.ts
    README.md

## QUALITY GATE (check before finishing)
□ TextReveal on hero headline?
□ MagneticButton on CTA?
□ Animated background in hero?
□ 4+ ScrollReveal across homepage?
□ Custom fonts (not only Inter)?
□ CSS variables — zero hardcoded hex outside globals.css?
□ {len(arch.pages)} pages built (not a SPA)?
□ @tottemai/ui imports — no reimplementation?
□ Lenis initialized in layout?
□ next-intl with he + en?
□ AccessibilityWidget present in layout?
□ /accessibility-statement page exists?
□ sitemap.ts + robots.ts?
□ All images with next/image + alt text?
□ Mobile tested: viewport 390px — no horizontal scroll?
□ All API routes have Zod validation?

If anything is missing → FIX IT before finishing.
"""
```

---

## שינויים טכניים לsite_generator.py

| פרמטר | לפני | אחרי |
|-------|------|-------|
| `max_turns` | 80 | 150 |
| `timeout` | 30 דקות | 60 דקות |
| תיאור לדף | 800 תווים | 3,000 תווים |
| CLAUDE.md | template סטטי | דינמי לפי archaeology |
| דפים | 6 קבועים | לפי מה שהיה + חסרים |
| a11y widget | לא קיים | חובה בכל אתר |
| payment | לא | CardCom / WhatsApp |

---

## שילוב ב-rebuilder.py

```python
async def rebuild_site(lead, settings, http):
    # 1. מחקר מתחרים ישראלים
    insights = await research_competitors(lead, http)

    # 2. השראה מאתרי שורה ראשונה עולמיים
    inspiration = await get_inspiration(lead.category, http)

    # 3. ארכיאולוגיה של האתר הישן
    archaeology = await dig(lead.existing_url)

    # 4. החלטת ארכיטקטורה
    architecture = decide_architecture(archaeology, lead.site_type)

    # 5. CLAUDE.md דינמי
    claude_md = build_claude_md(lead, architecture, archaeology, inspiration)

    # 6. בנייה
    files = await run_claude_code(claude_md, max_turns=150, timeout=3600)

    return files
```

---

## בדיקות סיום שלב 4

- [ ] `dig("https://fixfeetcoil.co.il")` מחזיר `SiteArchaeology` תקין
- [ ] `decide_architecture()` מוסיף BookingWidget לסוגי עסק מתאימים
- [ ] CLAUDE.md מכיל את שמות הדפים האמיתיים מהאתר הישן
- [ ] `grep -r "TextReveal" components/` → מופיע
- [ ] `ls app/[locale]/` → מכיל את הדפים שהיו באתר הישן
- [ ] AccessibilityWidget קיים בlayout
- [ ] `/accessibility-statement` דף קיים
- [ ] mobile 390px: אין גלילה אופקית
- [ ] `cat package.json | grep tottemai` → `@tottemai/ui` קיים

← [[03.5 - Phase 3.5 - Inspiration Crawler]]  
→ [[04.1 - Phase 4.1 - Accessibility Module]]
