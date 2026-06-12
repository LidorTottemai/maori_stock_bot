# Phase 5: Quality Loop & AI Review

> **תלות:** Phase 4  
> **קובץ:** `app/services/quality_loop.py` (חדש)  
> **משך משוער:** 2–3 שעות

---

## הרעיון

Claude Code בונה אתר. אנחנו לא מאמינים לו באופן עיוור.  
סוכן שני — **ביקורתי** — קורא את הקוד שנוצר ומציין אותו 1-10.  
אם הציון מתחת ל-8 → בנייה מחדש עם feedback ספציפי.

---

## זרימת הלולאה

```
generate_site(fix_prompt)
       │
       ▼
בדיקה מבנית מהירה (0 עלות):
  האם package.json כולל @tottemai/maori-ui?
  האם HeroSection מכיל TextReveal?
  האם יש 4+ קבצי page.tsx?
       │
       ├─ נכשל? → fix_prompt = "חסר: {missing}" → generate שוב
       │
       ▼
ציון קוד ע"י Claude Haiku (מהיר, ~$0.01):
  קרא HeroSection.tsx + page.tsx + package.json
  שאל: "Score 1-10 for animation richness, design ambition"
  מחזיר JSON: { score, issues, fixes }
       │
       ├─ score >= 8? → ✅ DONE → החזר files
       ├─ score < 8? → fix_prompt = fixes → ניסיון הבא
       │
       ▼
עד MAX_ATTEMPTS = 3 ניסיונות
החזר את הגרסה עם הציון הגבוה ביותר (best-of)
```

---

## Prompt לסוכן הביקורתי

```python
CRITIC_PROMPT = """You are an Awwwards jury member reviewing website source code.
Score this website 1-10 based on the code quality and design ambition.

package.json:
{pkg}

HeroSection.tsx:
{hero}

Home page (page.tsx):
{page}

tailwind.config.ts:
{tailwind}

Score criteria:
- 9-10: Multiple animations (TextReveal+Parallax+MagneticButton), custom fonts, CSS vars, 4+ pages
- 7-8:  Most animations present, good typography, mostly correct
- 5-6:  Some animations, generic design, missing key components  
- 3-4:  Few animations, hardcoded colors, generic template feel
- 1-2:  No animations, plain HTML, completely generic

Be HARSH. First attempts usually score 5-6.

Return ONLY valid JSON:
{{"score": N, "issues": ["specific missing thing"], "fixes": ["specific actionable fix"]}}"""
```

---

## הקוד — `quality_loop.py`

```python
import json
import logging
from app.core.config import Settings
from app.services.site_generator import generate_site
from app.services.playwright_inspector import SiteMap
from app.services.competitor_researcher import CompetitorInsights
import httpx

logger = logging.getLogger(__name__)

STRUCTURAL_CHECKS = [
    ("package.json",                    "@tottemai/maori-ui",  "package.json חסר @tottemai/maori-ui"),
    ("package.json",                    "framer-motion",       "package.json חסר framer-motion"),
    ("package.json",                    "gsap",                "package.json חסר gsap"),
    ("components/sections/HeroSection.tsx", "TextReveal",      "HeroSection חסר TextReveal"),
    ("components/sections/HeroSection.tsx", "MagneticButton",  "HeroSection חסר MagneticButton"),
    ("app/globals.css",                 "--color-primary",     "globals.css חסר CSS variables"),
]

def _structural_check(files: dict[str, str]) -> list[str]:
    """Returns list of missing items. Empty = all good."""
    missing = []
    for filepath, pattern, msg in STRUCTURAL_CHECKS:
        content = files.get(filepath, "")
        if pattern not in content:
            missing.append(msg)
    # check page count
    page_files = [k for k in files if k.endswith("page.tsx")]
    if len(page_files) < 4:
        missing.append(f"יש רק {len(page_files)} דפים — נדרשים לפחות 4")
    return missing

async def _code_review_score(
    files: dict[str, str],
    settings: Settings,
    http: httpx.AsyncClient,
) -> tuple[int, list[str]]:
    """Score the site using Claude Haiku. Returns (score, fixes)."""
    if not settings.anthropic_api_key:
        return 7, []  # neutral score if no API key

    hero = files.get("components/sections/HeroSection.tsx", "")[:3000]
    page = ""
    for k, v in files.items():
        if k.endswith("page.tsx") and "[locale]/" in k and k.count("/") == 2:
            page = v[:2000]; break
    pkg      = files.get("package.json", "")[:500]
    tailwind = files.get("tailwind.config.ts", "")[:800]

    prompt = CRITIC_PROMPT.format(
        pkg=pkg, hero=hero, page=page, tailwind=tailwind
    )
    try:
        resp = await http.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key":          settings.anthropic_api_key,
                "anthropic-version":  "2023-06-01",
                "content-type":       "application/json",
            },
            json={
                "model":      "claude-haiku-4-5-20251001",
                "max_tokens": 400,
                "messages":   [{"role": "user", "content": prompt}],
            },
            timeout=30,
        )
        text = resp.json()["content"][0]["text"].strip()
        # extract JSON (might be wrapped in markdown)
        if "```" in text:
            text = text.split("```")[1].lstrip("json").strip()
        result = json.loads(text)
        score  = int(result.get("score", 5))
        fixes  = result.get("fixes", [])
        logger.info("Quality score: %d/10 | issues: %s", score, result.get("issues", []))
        return score, fixes
    except Exception as e:
        logger.warning("Code review scoring failed: %s", e)
        return 5, []

async def run_quality_loop(
    site_map: SiteMap,
    insights: CompetitorInsights,
    category: str,
    settings: Settings,
    http: httpx.AsyncClient,
    fix_prompt: str | None = None,
) -> tuple[dict[str, str], int]:
    """Returns (best_files, best_score)."""
    best_files: dict[str, str] = {}
    best_score = 0
    current_fix = fix_prompt

    for attempt in range(1, settings.quality_max_attempts + 1):
        logger.info("Quality loop — attempt %d/%d", attempt, settings.quality_max_attempts)

        files = await generate_site(site_map, insights, category, settings, fix_prompt=current_fix)
        if not files:
            continue

        # structural check
        missing = _structural_check(files)
        if missing:
            feedback = "תקן מיד:\n" + "\n".join(f"- {m}" for m in missing)
            logger.warning("Structural check failed: %s", missing)
            current_fix = f"{feedback}\n\n{fix_prompt or ''}"
            if not best_files:
                best_files, best_score = files, 2
            continue

        # code review score
        score, fixes = await _code_review_score(files, settings, http)

        if score > best_score:
            best_score = score
            best_files = files

        if score >= settings.quality_min_score:
            logger.info("✅ Quality gate passed (score=%d/10)", score)
            break

        # build fix prompt for next attempt
        feedback = "\n".join(f"- {f}" for f in fixes)
        current_fix = (
            f"QUALITY FEEDBACK (score={score}/10, need {settings.quality_min_score}/10):\n"
            f"{feedback}\n\n{fix_prompt or ''}"
        )

    return best_files, best_score
```

---

## עדכון config.py

```python
# app/core/config.py — הוספה
anthropic_api_key:    str = ""
quality_min_score:    int = 8
quality_max_attempts: int = 3
```

---

## עדכון rebuilder.py

```python
# החלפת קריאה ל-generate_site בקריאה ל-run_quality_loop
from app.services.quality_loop import run_quality_loop

# ב-run_rebuild_job():
_update_job(job_id, current_phase="בונה (ניסיון 1/3)...")
files, quality_score = await run_quality_loop(
    site_map, insights, lead_category, settings, http_client, fix_prompt=fix_prompt
)

# Telegram message עם ציון:
await _tg(
    f"✅ <b>{lead_name}</b> — האתר מוכן! ציון עיצוב: {quality_score}/10\n🌐 {site_url}",
    ...
)
```

---

## בדיקות סוף שלב

- [ ] rebuild מחזיר ציון ב-Telegram
- [ ] לוגים מראים "Quality loop — attempt 1/3"
- [ ] אם בניה ראשונה תקינה → לא רץ ניסיון 2
- [ ] אם `anthropic_api_key` ריק → עובד ללא scoring (ציון 7)
- [ ] בניה שנכשלת בבדיקה מבנית → מקבלת fix_prompt ורצה שוב
- [ ] `best_files` תמיד מכיל משהו (גם אם הציון נמוך)
