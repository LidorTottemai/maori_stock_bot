# 🔄 Phase 5 — לולאת האיכות + סוכן ביקורתי

> **מטרה:** אף אתר לא יצא מהמנגנון עם ציון פחות מ-8/10.
> **קובץ:** `app/services/quality_loop.py`
> **תיעוד מפורט:** [[services/quality_loop]] — קוד מלא, STRUCTURAL_RULES, Haiku scoring, build_fix_prompt, retry_with_fix

---

## הזרימה

```
generate_site() → files dict
       ↓
attempt 1 (עד 3):
  ┌─ בדיקה מבנית (0 עלות, מהיר מאוד)
  │   grep: TextReveal, MagneticButton, maori-ui imports, ≥5 דפים
  │   נכשל? → fix_prompt מיידי, דלג על scoring
  │
  ├─ ציון קוד ע"י Claude Haiku (זול ומהיר — ~2 שניות)
  │   קרא: HeroSection.tsx + page.tsx + package.json
  │   JSON response: { score: N, issues: [...], fixes: [...] }
  │   score ≥ 8? → ✅ החזר files
  │   score < 8? → fix_prompt = fixes → ניסיון הבא
  │
  └─ אחרי 3 ניסיונות → החזר הגרסה עם הציון הגבוה ביותר
```

---

## בדיקה מבנית — structural check

```python
def _structural_check(files: dict[str, str]) -> tuple[bool, str]:
    """בדיקה מהירה: האם הרכיבים הנכונים קיימים?"""
    issues = []
    
    # בדוק package.json
    pkg = files.get("package.json", "")
    if "@tottemai/maori-ui" not in pkg:
        issues.append("@tottemai/maori-ui missing from package.json")
    if "framer-motion" not in pkg and "motion/react" not in pkg:
        issues.append("framer-motion missing")
    if "gsap" not in pkg:
        issues.append("gsap missing")
    
    # בדוק שימוש בספרייה
    all_code = " ".join(files.values())
    if "TextReveal" not in all_code:
        issues.append("TextReveal not used anywhere")
    if "MagneticButton" not in all_code:
        issues.append("MagneticButton not used anywhere")
    if "ScrollReveal" not in all_code:
        issues.append("ScrollReveal not used anywhere")
    
    # בדוק מספר דפים
    page_files = [k for k in files if "page.tsx" in k and "[locale]" in k]
    if len(page_files) < 4:
        issues.append(f"Only {len(page_files)} pages — need at least 4")
    
    # בדוק CSS variables
    globals_css = files.get("app/globals.css", "")
    if "--color-primary" not in globals_css:
        issues.append("CSS color variables not defined")
    
    ok = len(issues) == 0
    feedback = "Structural issues:\n" + "\n".join(f"- {i}" for i in issues)
    return ok, feedback
```

---

## ציון קוד — code review score

```python
async def _code_review_score(
    files: dict[str, str],
    http_client: httpx.AsyncClient,
    settings: Settings,
) -> tuple[int, list[str]]:
    
    hero = files.get("components/sections/HeroSection.tsx", "")
    home = next((v for k,v in files.items() if k.endswith("]/page.tsx")), "")
    pkg  = files.get("package.json", "{}")[:500]
    
    prompt = f"""You are an Awwwards jury member reviewing Next.js source code.

package.json (excerpt): {pkg}

HeroSection.tsx: {hero[:3000]}

Home page.tsx: {home[:2000]}

Score 1-10 based on:
- Animation richness: TextReveal, MagneticButton, Parallax, ScrollReveal used?
- Design ambition: custom fonts? gradient/mesh background? not just plain white?
- Typography: display-2xl/display-xl/clamp() scale applied?
- Component usage: @tottemai/maori-ui imported multiple times?
- Multi-page: ≥4 pages, not SPA?
- Lenis + GSAP initialized?

HARSH scoring: 10=Awwwards SOTD, 5=generic template, 2=no animations.

Return STRICT JSON only:
{{"score": N, "issues": ["..."], "fixes": ["specific actionable change"]}}"""

    resp = await http_client.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": settings.anthropic_api_key,
            "anthropic-version": "2023-06-01",
        },
        json={
            "model": "claude-haiku-4-5-20251001",
            "max_tokens": 400,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=30,
    )
    
    if resp.status_code != 200:
        return 5, []  # neutral score on failure
    
    text = resp.json()["content"][0]["text"].strip()
    result = json.loads(text)
    return int(result.get("score", 5)), result.get("fixes", [])
```

---

## הלולאה המלאה

```python
async def run_quality_loop(
    site_map, insights, category, settings, fix_prompt=None, update_cb=None
) -> dict[str, str]:
    
    best_files, best_score = {}, 0
    current_fix = fix_prompt
    
    for attempt in range(1, settings.quality_max_attempts + 1):
        if update_cb:
            await update_cb(f"בונה אתר (ניסיון {attempt}/{settings.quality_max_attempts})...")
        
        files = await generate_site(site_map, insights, category, settings, fix_prompt=current_fix)
        
        # שלב 1: בדיקה מבנית
        ok, structural_feedback = _structural_check(files)
        if not ok:
            current_fix = f"CRITICAL ISSUES — fix these first:\n{structural_feedback}\n\n{fix_prompt or ''}"
            if not best_files: best_files = files
            continue
        
        # שלב 2: ציון קוד (אם יש API key)
        if settings.anthropic_api_key:
            if update_cb:
                await update_cb(f"בודק איכות עיצוב (ניסיון {attempt})...")
            score, fixes = await _code_review_score(files, http_client, settings)
            logger.info("Quality score: %d/10 (attempt %d)", score, attempt)
            
            if score > best_score:
                best_score, best_files = score, files
            
            if score >= settings.quality_min_score:
                logger.info("Quality gate passed!")
                break
            
            feedback = "\n".join(f"- {f}" for f in fixes)
            current_fix = f"QUALITY FEEDBACK (score={score}/10, need {settings.quality_min_score}/10):\n{feedback}\n\n{fix_prompt or ''}"
        else:
            best_files = files
            break
    
    return best_files
```

---

## שילוב ב-rebuilder.py

```python
# rebuilder.py — החלפת generate_site בrun_quality_loop
from app.services.quality_loop import run_quality_loop
from app.services.component_library import ensure_library_repo

async def run_rebuild_job(job_id, http_client, settings):
    # וודא שmaori-ui קיים (פעם אחת, idempotent)
    await ensure_library_repo(settings, http_client)
    
    # ...
    
    async def update_phase(msg):
        _update_job(job_id, current_phase=msg)
    
    files = await run_quality_loop(
        site_map, insights, category, settings,
        fix_prompt=fix_prompt,
        update_cb=update_phase,
    )
    
    # Telegram: כלול ציון
    await _tg(f"✅ {lead_name} — ציון עיצוב: {best_score}/10\n🌐 {site_url}", ...)
```

---

## פרמטרים (config.py)

```python
anthropic_api_key: str = ""       # אם ריק — דילוג על vision scoring
quality_min_score: int = 8         # ציון מינימלי לסיום
quality_max_attempts: int = 3      # מקסימום ניסיונות
```

---

## בדיקות סיום שלב 5

- [ ] structural_check מזהה אתר שחסר TextReveal
- [ ] _code_review_score מחזיר JSON תקין
- [ ] ניסיון 1 עם ציון 5 → ניסיון 2 עם fix_prompt → ציון עולה
- [ ] 3 ניסיונות כושלים → מחזיר הגרסה הכי טובה
- [ ] Telegram מציג ציון בסוף
- [ ] בלי anthropic_api_key → עובד (דילוג על scoring)
- [ ] לוגים: "Quality score: N/10 (attempt M)"
