# quality_loop.py

> **קובץ:** `app/services/quality_loop.py`
> **סטטוס:** 🔴 לא קיים — יש לממש
> **תלויות:** `anthropic` SDK, `site_generator` (GeneratedSite, _run_claude_subprocess), `site_archaeologist` (SiteData)

---

## מה זה עושה

מקבל `GeneratedSite` מ-`site_generator.py` ומריץ עד 3 ניסיונות שיפור עד שהציון ≥ 8/10.

```
GeneratedSite (attempt 1)
      ↓
structural_check()     ← חינם, מיידי
      ↓ fail → build_fix_prompt() → retry_with_fix()
      ↓ pass
score_with_haiku()     ← Haiku, ~2s, זול
      ↓ score < 8 → build_fix_prompt() → retry_with_fix()
      ↓ score ≥ 8
GeneratedSite (final, quality_score מלא)
```

**retry_with_fix:** מוסיפה `## CRITICAL FIXES` בראש CLAUDE.md המקורי → Claude Code קורא ומתקן קוד קיים, לא בונה מאפס.

---

## קוד מלא

```python
# app/services/quality_loop.py
import json
import logging
import os
import re
import shutil
import tempfile
from pathlib import Path

from app.services.site_archaeologist import SiteData
from app.services.site_generator import (
    GeneratedSite,
    _collect_files,
    _run_claude_subprocess,
    _write_claude_settings,
)

logger = logging.getLogger(__name__)


# ── Public API ────────────────────────────────────────────────────────────────

def quality_loop_available() -> bool:
    """True כשANTHROPIC_API_KEY מוגדר — אחרת structural check בלבד."""
    return bool(os.environ.get("ANTHROPIC_API_KEY"))


async def quality_loop(
    generated: GeneratedSite,
    site_data: SiteData,
    max_attempts: int = 3,
    min_score: float = 8.0,
) -> GeneratedSite:
    """
    מריץ עד max_attempts ניסיונות שיפור.
    מחזיר את הגרסה עם הציון הגבוה ביותר.
    """
    best = generated
    original_claude_md = generated.claude_md_used

    for attempt in range(1, max_attempts + 1):
        logger.info(f"[quality_loop] Attempt {attempt}/{max_attempts}")
        files = best.files

        # ── שלב 1: בדיקה מבנית (חינם) ───────────────────────
        ok, structural_issues = structural_check(files)
        if not ok:
            logger.warning(f"[quality_loop] Structural issues: {structural_issues}")
            fix_prompt = build_fix_prompt(score=0, structural_issues=structural_issues, haiku_fixes=[])
            best = await retry_with_fix(original_claude_md, fix_prompt, site_data)
            best = GeneratedSite(
                files=best.files,
                quality_score=best.quality_score,
                attempts=attempt,
                claude_md_used=best.claude_md_used,
            )
            continue

        # ── שלב 2: ציון Haiku ────────────────────────────────
        if not quality_loop_available():
            logger.info("[quality_loop] Haiku scoring skipped (no ANTHROPIC_API_KEY)")
            break

        score, fixes = await score_with_haiku(files)
        logger.info(f"[quality_loop] Score: {score}/10 (attempt {attempt})")

        candidate = GeneratedSite(
            files=files,
            quality_score=score,
            attempts=attempt,
            claude_md_used=best.claude_md_used,
        )
        if score > best.quality_score:
            best = candidate

        if score >= min_score:
            logger.info(f"[quality_loop] Gate passed at attempt {attempt} ({score}/10)")
            break

        if attempt < max_attempts:
            fix_prompt = build_fix_prompt(score=score, structural_issues=[], haiku_fixes=fixes)
            retried = await retry_with_fix(original_claude_md, fix_prompt, site_data)
            best = GeneratedSite(
                files=retried.files,
                quality_score=0.0,
                attempts=attempt,
                claude_md_used=retried.claude_md_used,
            )

    return best


# ── Structural Check ──────────────────────────────────────────────────────────

# (file_key, needle, error_message)
# file_key="*" בודק בכל הקוד
STRUCTURAL_RULES: list[tuple[str, str, str]] = [
    # ── ספרייה ─────────────────────────────────────────────────
    ("package.json",             "@tottemai/ui",        "@tottemai/ui missing from package.json"),
    ("package.json",             "gsap",                "gsap missing from package.json"),
    ("package.json",             "lenis",               "lenis missing from package.json"),
    # ── אנימציות ────────────────────────────────────────────────
    ("*",                        "TextReveal",          "TextReveal not used in any file"),
    ("*",                        "MagneticButton",      "MagneticButton not used in any file"),
    ("*",                        "ScrollReveal",        "ScrollReveal not used in any file"),
    ("*",                        "new Lenis",           "Lenis not initialized (smooth scroll missing)"),
    # ── CSS variables ────────────────────────────────────────────
    ("app/globals.css",          "--color-primary",     "CSS variables not defined in globals.css"),
    # ── נגישות (חובה חוקית) ─────────────────────────────────────
    ("*",                        "AccessibilityWidget", "AccessibilityWidget missing (Israeli law violation)"),
    ("*",                        "SkipLink",            "SkipLink missing (accessibility)"),
    # ── SEO ──────────────────────────────────────────────────────
    ("*",                        "LocalBusiness",       "LocalBusiness JSON-LD schema missing"),
    ("app/sitemap.ts",           "sitemap",             "app/sitemap.ts missing"),
    # ── RTL ──────────────────────────────────────────────────────
    ("*",                        "dir=\"rtl\"",         "RTL direction not set on <html>"),
]


def structural_check(files: dict[str, str]) -> tuple[bool, list[str]]:
    """
    בדיקה מהירה ללא API.
    מחזיר (True, []) אם עובר, או (False, [issues...]) אם נכשל.
    """
    all_code = " ".join(files.values())
    issues: list[str] = []

    for target_file, needle, message in STRUCTURAL_RULES:
        if target_file == "*":
            if needle not in all_code:
                issues.append(message)
        else:
            content = files.get(target_file, "")
            if needle not in content:
                issues.append(message)

    # מספר דפים מינימלי
    page_count = sum(
        1 for k in files
        if k.endswith("page.tsx") and "[locale]" in k and "accessibility" not in k
    )
    if page_count < 4:
        issues.append(f"Only {page_count} real pages — need at least 4 (home, about, services, contact)")

    return (len(issues) == 0), issues


# ── Haiku Scoring ─────────────────────────────────────────────────────────────

async def score_with_haiku(files: dict[str, str]) -> tuple[float, list[str]]:
    """
    שולח קטעי קוד קריטיים לClaude Haiku לציון 1-10.
    מחזיר (score, [actionable_fixes]).
    """
    from anthropic import AsyncAnthropic
    client = AsyncAnthropic()

    # קבצים הכי משפיעים על הציון
    hero   = files.get("components/sections/HeroSection.tsx", "")[:3000]
    home   = next(
        (v[:2000] for k, v in files.items() if k.endswith("]/page.tsx") and "locale" in k),
        ""
    )
    layout = files.get("app/[locale]/layout.tsx", "")[:1500]
    pkg    = files.get("package.json", "{}")[:400]

    prompt = f"""You are an Awwwards jury member reviewing Next.js Israeli business website source code.

package.json (excerpt):
{pkg}

app/[locale]/layout.tsx:
{layout}

HeroSection.tsx:
{hero}

Home page.tsx:
{home}

Score 1-10 based on these weighted criteria:
1. Animation richness (25%): TextReveal on headings? MagneticButton on CTAs? Lenis smooth scroll? Parallax? CountUp stats?
2. Design ambition (25%): gradient/mesh hero background? custom font pairing? bold typography scale? not a plain white template?
3. Hebrew/RTL quality (20%): dir="rtl" on html? Heebo font? logical CSS properties (padding-inline, margin-inline)?
4. Component coverage (15%): @tottemai/ui imported in multiple files? HeroSection, FeatureGrid, TestimonialCard used?
5. Technical quality (15%): TypeScript strict? metadata export? sitemap? no obvious errors?

SCORING CALIBRATION:
10 = Awwwards SOTD winner
8  = Client-ready professional site with real animations
6  = Decent but generic template, animations minimal
4  = No custom animations, plain white background
2  = Broken or skeleton only

Return ONLY valid JSON with no extra text:
{{"score": 7.5, "issues": ["hero has no animation", "Inter font only, no Heebo"], "fixes": ["Add TextReveal to hero h1 in HeroSection.tsx line ~15", "Initialize Lenis in app/providers.tsx with GSAP ticker", "Import and use Heebo font from next/font/google in layout.tsx"]}}"""

    try:
        message = await client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=600,
            messages=[{"role": "user", "content": prompt}],
        )
        text = message.content[0].text.strip()
        m = re.search(r"\{.*\}", text, re.DOTALL)
        if not m:
            return 5.0, []
        data = json.loads(m.group(0))
        score = max(1.0, min(10.0, float(data.get("score", 5))))
        fixes = data.get("fixes", [])
        return score, fixes
    except Exception as exc:
        logger.warning(f"[quality_loop] Haiku scoring failed: {exc}")
        return 5.0, []    # neutral fallback — לא חוסם את הretry


# ── Fix Prompt Builder ────────────────────────────────────────────────────────

def build_fix_prompt(
    score: float,
    structural_issues: list[str],
    haiku_fixes: list[str],
) -> str:
    """בונה פרומפט ממוקד לretry — לתקן בעיות ספציפיות, לא rebuild מאפס."""
    parts: list[str] = []

    if structural_issues:
        issues_text = "\n".join(f"- {i}" for i in structural_issues)
        parts.append(f"## ⚠️ CRITICAL STRUCTURAL ISSUES (fix these first)\n{issues_text}")

    if score > 0:
        parts.append(f"## 📊 QUALITY SCORE: {score}/10 (need 8/10 minimum)")

    if haiku_fixes:
        fixes_text = "\n".join(f"- {f}" for f in haiku_fixes)
        parts.append(f"## 🔧 REQUIRED FIXES (apply to existing code — do NOT rebuild)\n{fixes_text}")

    parts.append("""## 📋 RETRY RULES
- Do NOT rebuild from scratch — apply targeted fixes only
- Read the existing files, then apply the changes listed above
- TextReveal MUST wrap every h1, h2, h3 heading
- MagneticButton MUST wrap every primary CTA button
- Lenis MUST be initialized in providers.tsx with GSAP ticker attached
- AccessibilityWidget MUST appear in app/[locale]/layout.tsx (last child of body)
- SkipLink MUST appear in layout.tsx (first visible child of body)
- hero section MUST have animated background (gradient, mesh, or Parallax)
- After fixing, verify: grep TextReveal in all page files""")

    return "\n\n".join(parts)


# ── Retry ─────────────────────────────────────────────────────────────────────

async def retry_with_fix(
    original_claude_md: str,
    fix_prompt: str,
    site_data: SiteData,
) -> GeneratedSite:
    """
    מריצה Claude Code מחדש עם CLAUDE.md + ה-fix_prompt מצורף בראש.
    Claude Code יקרא את התיקונים הנדרשים לפני כל שאר ה-instructions.
    """
    updated_claude_md = f"""# ⚠️ RETRY SESSION — READ THIS FIRST

{fix_prompt}

---

{original_claude_md}"""

    temp_dir = Path(tempfile.mkdtemp(prefix="site_retry_"))
    try:
        (temp_dir / "CLAUDE.md").write_text(updated_claude_md, encoding="utf-8")
        _write_claude_settings(temp_dir)

        await _run_claude_subprocess(
            cwd=temp_dir,
            max_turns=150,
            timeout=3600,
        )
        files = _collect_files(temp_dir)

        return GeneratedSite(
            files=files,
            quality_score=0.0,       # יועדכן לאחר scoring
            attempts=0,              # quality_loop ימלא
            claude_md_used=updated_claude_md,
        )
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)
```

---

## Flow מפורט

```
quality_loop(generated, site_data, max_attempts=3, min_score=8)
  │
  ├─ attempt 1
  │    structural_check(files)
  │      ├─ PASS → score_with_haiku(files) → score=6.5, fixes=[...]
  │      │           └─ 6.5 < 8 → build_fix_prompt(6.5, [], fixes)
  │      │                          └─ retry_with_fix(original_md, fix_prompt)
  │      └─ FAIL (TextReveal missing) → build_fix_prompt(0, issues, [])
  │                                      └─ retry_with_fix(original_md, fix_prompt)
  │
  ├─ attempt 2
  │    structural_check → PASS
  │    score_with_haiku → score=8.2 ≥ 8 → ✅ return best
  │
  └─ attempt 3 (אם הגענו לכאן)
       מחזיר הגרסה עם הציון הגבוה ביותר מכל הניסיונות
```

---

## עלויות

| פעולה | עלות | זמן |
|-------|------|-----|
| `structural_check` | $0 | < 1ms |
| `score_with_haiku` | ~$0.0002 | ~2s |
| `retry_with_fix` (Claude Code subprocess) | משתנה | ~25-45min |
| **סה"כ לניסיון מלא** | **~$0.0002 + Claude Code** | **~30min** |

Haiku זול מאוד — 3 ניסיוני scoring עולים פחות מ-$0.001.

---

## בדיקות

```python
# test_quality_loop.py

def test_structural_check_passes():
    files = {
        "package.json": '{"dependencies": {"@tottemai/ui": "*", "gsap": "*", "lenis": "*"}}',
        "app/globals.css": ":root { --color-primary: #2563eb; }",
        "app/[locale]/layout.tsx": """
            <html dir="rtl">
              <SkipLink />
              <AccessibilityWidget />
            </html>
        """,
        "app/[locale]/page.tsx": "<TextReveal /><MagneticButton /><ScrollReveal />",
        "app/[locale]/about/page.tsx": "about page",
        "app/[locale]/services/page.tsx": "services page",
        "app/[locale]/contact/page.tsx": "contact page",
        "app/sitemap.ts": "export default function sitemap() {}",
        "components/sections/HeroSection.tsx": "new Lenis()",
        "app/[locale]/page.tsx": 'LocalBusiness',
    }
    ok, issues = structural_check(files)
    assert ok, f"Unexpected issues: {issues}"


def test_structural_check_catches_missing():
    files = {"package.json": '{"dependencies": {}}', "app/globals.css": ""}
    ok, issues = structural_check(files)
    assert not ok
    assert any("TextReveal" in i for i in issues)
    assert any("@tottemai/ui" in i for i in issues)
    assert any("AccessibilityWidget" in i for i in issues)


def test_build_fix_prompt_structural():
    prompt = build_fix_prompt(0, ["TextReveal not used", "Lenis missing"], [])
    assert "CRITICAL STRUCTURAL ISSUES" in prompt
    assert "TextReveal not used" in prompt
    assert "do NOT rebuild" in prompt


def test_build_fix_prompt_haiku():
    prompt = build_fix_prompt(6.5, [], ["Add TextReveal to hero h1"])
    assert "6.5/10" in prompt
    assert "Add TextReveal" in prompt
    assert "do NOT rebuild" in prompt


@pytest.mark.asyncio
async def test_quality_loop_skips_scoring_without_key(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    assert not quality_loop_available()
```

---

## שילוב ב-rebuilder.py

```python
# app/services/rebuilder.py (מעודכן מPhase 04)
from app.services.quality_loop import quality_loop, quality_loop_available

async def run_rebuild_job(job_id: str) -> None:
    # ...generate...
    generated = await generate_site(job, site_data, inspiration, competitors)

    if quality_loop_available():
        await update_status(job_id, "quality_checking")
        generated = await quality_loop(
            generated=generated,
            site_data=site_data,
            max_attempts=3,
            min_score=8.0,
        )

    score_text = f" | ציון: {generated.quality_score:.1f}/10" if generated.quality_score else ""
    await notify_telegram(job, stage=f"✅ האתר מוכן{score_text}", url=deploy_url)
```

← [[00 - Services Overview]] | [[rebuilder]]
