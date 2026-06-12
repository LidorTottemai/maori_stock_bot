# Phase 6: Inspiration Crawler — למידה מאתרים מגניבים

> **תלות:** Phase 4  
> **קובץ:** `app/services/inspiration_crawler.py` (חדש)  
> **משך משוער:** 2–3 שעות

---

## הבעיה עם competitor_researcher הנוכחי

```
DuckDuckGo → 4 אתרים ישראליים ממוצעים → "Mobile-first, WhatsApp button"
```

זה לא מספיק. אנחנו צריכים ללמוד מהטובים בעולם, לא מהממוצע.

---

## הזרימה החדשה

```
search: "best {category} website design award 2024 2025"
     ↓
Playwright: פתח 3-5 אתרים מהתוצאות
     ↓
לכל אתר חלץ signals:
  - fonts (computed font-family)
  - color palette (background, text, accent)
  - section structure (h1, nav links, section count)
  - animation libraries (gsap? framer? lenis? ב-scripts)
  - layout patterns (full-viewport? horizontal-scroll?)
  - has_whatsapp, has_booking, has_video_hero
     ↓
סנתז → InspirationReport
     ↓
CLAUDE.md מקבל: top_fonts, color_palette, layout_patterns, detected_libraries
```

---

## ה-InspirationReport

```python
class DesignSignals(BaseModel):
    url: str
    fonts: list[str]            # ["Syne", "DM Sans"]
    colors: list[str]           # ["#0a0a0a", "#FF006E", "#ffffff"]
    has_gsap: bool
    has_framer: bool
    has_lenis: bool
    has_threejs: bool
    has_horizontal_scroll: bool
    has_full_viewport_sections: bool
    has_video_hero: bool
    has_custom_cursor: bool
    section_count: int

class InspirationReport(BaseModel):
    category: str
    sites_analyzed: int
    top_fonts: list[str]              # merged from all sites
    color_palette_examples: list[list[str]]  # 3 palettes from best sites
    detected_libraries: list[str]     # ["gsap", "framer-motion", "lenis"]
    layout_patterns: list[str]        # ["full-viewport-sections", "horizontal-scroll"]
    must_have_features: list[str]     # ["custom-cursor", "video-hero"]
    summary_for_claude: str           # paragraph for CLAUDE.md
```

---

## הקוד — `inspiration_crawler.py`

```python
import logging, re
from playwright.async_api import async_playwright
import httpx
from app.core.config import Settings

logger = logging.getLogger(__name__)

SEARCH_QUERIES = [
    "best {category} website design award winning 2024 2025",
    "award winning {category} website inspiration",
    "{category} website awwwards nominee",
]

async def get_inspiration(
    category: str,
    http: httpx.AsyncClient,
    settings: Settings,
) -> InspirationReport:
    # 1. search
    urls = await _google_search(SEARCH_QUERIES[0].format(category=category), http)
    urls = [u for u in urls if _is_good_site(u)][:5]

    if not urls:
        return _fallback_report(category)

    # 2. crawl
    signals_list = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        for url in urls:
            try:
                signals = await _extract_design_signals(browser, url)
                signals_list.append(signals)
            except Exception as e:
                logger.warning("Failed to crawl %s: %s", url, e)
        await browser.close()

    # 3. synthesize
    return _synthesize(signals_list, category)


async def _extract_design_signals(browser, url: str) -> DesignSignals:
    page = await browser.new_page()
    await page.goto(url, timeout=15000, wait_until="domcontentloaded")
    await page.wait_for_timeout(2000)

    fonts = await page.evaluate("""() => {
        const els = [document.body, document.querySelector("h1"), document.querySelector("nav")]
        return [...new Set(els.filter(Boolean).map(el =>
            window.getComputedStyle(el).fontFamily.split(",")[0].replace(/['"]/g,"").trim()
        ))].filter(f => f && f !== "serif" && f !== "sans-serif")
    }""")

    colors = await page.evaluate("""() => {
        const els = [document.body, document.querySelector("header"), document.querySelector("section")]
        const cols = new Set()
        for (const el of els.filter(Boolean)) {
            const s = window.getComputedStyle(el)
            cols.add(s.backgroundColor); cols.add(s.color)
        }
        return [...cols].filter(c => c && c !== "rgba(0, 0, 0, 0)").slice(0, 5)
    }""")

    scripts = await page.evaluate("""() =>
        Array.from(document.scripts).map(s => s.src + s.textContent).join(" ")
    """)

    has_gsap    = "gsap" in scripts.lower() or "greensock" in scripts.lower()
    has_framer  = "framer" in scripts.lower()
    has_lenis   = "lenis" in scripts.lower()
    has_threejs = "three.js" in scripts.lower() or "threejs" in scripts.lower()

    section_count = await page.evaluate("() => document.querySelectorAll('section').length")

    await page.close()
    return DesignSignals(
        url=url, fonts=fonts, colors=colors,
        has_gsap=has_gsap, has_framer=has_framer,
        has_lenis=has_lenis, has_threejs=has_threejs,
        has_horizontal_scroll=False,  # TODO: detect
        has_full_viewport_sections=section_count >= 3,
        has_video_hero=False,  # TODO: detect
        has_custom_cursor=False,  # TODO: detect cursor styles
        section_count=section_count,
    )


def _synthesize(signals: list[DesignSignals], category: str) -> InspirationReport:
    all_fonts   = [f for s in signals for f in s.fonts]
    top_fonts   = list(dict.fromkeys(all_fonts))[:6]  # preserve order, dedupe

    lib_counts  = {"gsap": 0, "framer-motion": 0, "lenis": 0, "three.js": 0}
    for s in signals:
        if s.has_gsap:    lib_counts["gsap"] += 1
        if s.has_framer:  lib_counts["framer-motion"] += 1
        if s.has_lenis:   lib_counts["lenis"] += 1
        if s.has_threejs: lib_counts["three.js"] += 1

    detected_libs = [k for k, v in lib_counts.items() if v >= len(signals) // 2]

    color_palettes = [s.colors for s in signals[:3] if s.colors]

    patterns = []
    if any(s.has_full_viewport_sections for s in signals): patterns.append("full-viewport-sections")
    if any(s.has_horizontal_scroll for s in signals):      patterns.append("horizontal-scroll")
    if any(s.has_video_hero for s in signals):             patterns.append("video-hero")
    if any(s.has_custom_cursor for s in signals):          patterns.append("custom-cursor")

    summary = (
        f"Analyzed {len(signals)} award-winning {category} websites. "
        f"Popular fonts: {', '.join(top_fonts[:4])}. "
        f"Libraries used: {', '.join(detected_libs) or 'standard CSS'}. "
        f"Layout patterns: {', '.join(patterns) or 'standard vertical scroll'}. "
        f"Apply these patterns while keeping the content from the existing site."
    )

    return InspirationReport(
        category=category,
        sites_analyzed=len(signals),
        top_fonts=top_fonts,
        color_palette_examples=color_palettes,
        detected_libraries=detected_libs,
        layout_patterns=patterns,
        must_have_features=patterns,
        summary_for_claude=summary,
    )
```

---

## שילוב ב-rebuilder.py

```python
from app.services.inspiration_crawler import get_inspiration

# לפני generate_site:
_update_job(job_id, current_phase="מנתח אתרים מובילים בתחום...")
inspiration = await get_inspiration(lead_category, http_client, settings)

# העברה ל-CLAUDE.md:
# ב-_build_claude_md: הוסף inspiration.summary_for_claude + top_fonts + color_palette_examples
```

---

## בדיקות סוף שלב

- [ ] `get_inspiration("ספא", http, settings)` מחזיר InspirationReport תקין
- [ ] `top_fonts` מכיל שמות גופנים ריאליים
- [ ] `detected_libraries` מכיל ספריות שנמצאו בפועל
- [ ] CLAUDE.md שנוצר מכיל את `inspiration.summary_for_claude`
- [ ] אם החיפוש נכשל (network error) → `_fallback_report()` מוחזר ולא נזרקת חריגה
