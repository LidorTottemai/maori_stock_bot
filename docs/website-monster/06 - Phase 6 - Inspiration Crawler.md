# 🌍 Phase 6 — Inspiration Crawler

> **⚠️ שלב זה הועבר לפני מנוע הבנייה.**
> **ראה:** [[03.5 - Phase 3.5 - Inspiration Crawler]] — הגרסה המלאה והעדכנית.
> **קובץ:** `app/services/inspiration_crawler.py`

---

## הבעיה הנוכחית

`competitor_researcher.py` עושה DuckDuckGo → 4 אתרים ישראלים ממוצעים → patterns גנריים.
התוצאה: Claude לומד מהמכוערים, בונה כמוהם.

---

## הפתרון

```
חיפוש Awwwards + Google →
אתרים מהשורה הראשונה בעולם בקטגוריה →
חילוץ: fonts, colors, animations, layout patterns →
InspirationReport שנשלח ל-Claude
```

---

## המבנה

```python
class DesignSignals(BaseModel):
    url: str
    fonts: list[str]           # font-family computed styles
    colors: list[str]          # dominant colors
    has_gsap: bool
    has_framer: bool
    has_lenis: bool
    has_custom_cursor: bool
    has_horizontal_scroll: bool
    has_full_viewport_sections: bool
    nav_structure: list[str]   # כותרות הניווט

class InspirationReport(BaseModel):
    top_fonts: list[str]           # 3-5 גופנים מהנפוצים
    color_approaches: list[str]    # "dark with neon accent", "minimal white"...
    animation_stack: list[str]     # הספריות שנמצאו
    layout_patterns: list[str]     # מה שהשתכרר
    summary_for_claude: str        # טקסט לCLAUDE.md
```

---

## אלגוריתם

```python
async def get_inspiration(category: str, http: httpx.AsyncClient) -> InspirationReport:
    
    # 1. חיפוש — שני מקורות במקביל
    awwwards_urls = await _search_awwwards(category, http)
    # fallback: google search "best {category} website award winning 2024"
    
    # 2. סרוק 5 אתרים
    signals = []
    for url in awwwards_urls[:5]:
        try:
            s = await _extract_design_signals(url)
            signals.append(s)
        except Exception:
            pass
    
    # 3. סנתז
    return _synthesize(signals, category)


async def _extract_design_signals(url: str) -> DesignSignals:
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(url, timeout=20000)
        await page.wait_for_timeout(2000)
        
        fonts = await page.evaluate("""() => {
            const els = [document.body, document.querySelector('h1'), document.querySelector('nav')]
            return [...new Set(els.filter(Boolean).map(el =>
                window.getComputedStyle(el).fontFamily.split(',')[0].replace(/['"]/g, '').trim()
            ))]
        }""")
        
        colors = await page.evaluate("""() => {
            const els = [document.body, document.querySelector('header'), document.querySelector('main')]
            const cols = new Set()
            els.filter(Boolean).forEach(el => {
                const s = window.getComputedStyle(el)
                cols.add(s.backgroundColor)
                cols.add(s.color)
            })
            return [...cols].filter(c => c && c !== 'rgba(0,0,0,0)').slice(0, 6)
        }""")
        
        scripts = await page.evaluate("""() =>
            Array.from(document.querySelectorAll('script[src]')).map(s => s.src)
        """)
        
        has_gsap = any('gsap' in s.lower() for s in scripts)
        has_framer = any('framer' in s.lower() or 'motion' in s.lower() for s in scripts)
        has_lenis = any('lenis' in s.lower() for s in scripts)
        
        await browser.close()
        return DesignSignals(url=url, fonts=fonts, colors=colors,
                             has_gsap=has_gsap, has_framer=has_framer, has_lenis=has_lenis, ...)
```

---

## שילוב ב-rebuilder.py

```python
# לפני הבנייה, לאחר competitor_researcher:
inspiration = await get_inspiration(lead_category, http_client)

# insights.summary_for_claude מתעדכן:
combined_summary = f"{insights.summary_for_claude}\n\n## TOP-TIER INSPIRATION:\n{inspiration.summary_for_claude}"
```

---

## בדיקות סיום שלב 6

- [ ] `get_inspiration("ספא")` מחזיר InspirationReport
- [ ] fonts: לא Inter בלבד — מגיעים גופנים אמיתיים
- [ ] has_gsap/has_framer מזוהים נכון
- [ ] summary_for_claude מכיל דוגמאות ספציפיות
- [ ] fallback עובד כשAwwwards חסום (google search)
- [ ] timeout תקין — לא תוקע את הpipeline
