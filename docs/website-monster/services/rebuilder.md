# rebuilder.py — שדרוג Phase 04

> **קובץ:** `app/services/rebuilder.py`
> **סטטוס:** 🟡 קיים (202 שורות, גרסה 1.0) — צריך אינטגרציה של archaeology + quality loop
> **orchestrator מרכזי** — מחבר את כל ה-services

---

## ההבדל בין גרסה 1.0 לגרסה 2.0

### גרסה 1.0 (קיים)

```python
async def run_rebuild_job(job_id: str):
    job = await get_job(job_id)
    
    await update_status(job_id, "scraping")
    crawled_data = await crawl_site(job.original_url)    # ← scraper פשוט
    
    await update_status(job_id, "researching")
    competitors = await research_competitors(...)         # ← עובד

    await update_status(job_id, "generating")
    generated = await generate_site(job, crawled_data)  # ← 80 turns, CLAUDE.md סטטי

    # ← אין quality loop

    await update_status(job_id, "pushing")
    repo_url = await create_repo_and_push(generated)
    
    await update_status(job_id, "deploying")
    deploy_url = await deploy_site(repo_url, job.slug)
    
    await notify_telegram(job, deploy_url)
```

### גרסה 2.0 (מטרה)

```python
import asyncio
import logging
from app.services.site_archaeologist import excavate_site
from app.services.inspiration_crawler import get_inspiration
from app.services.site_generator import generate_site
from app.services.quality_loop import quality_loop, quality_loop_available

logger = logging.getLogger(__name__)


async def run_rebuild_job(job_id: str) -> None:
    job = await get_job(job_id)
    logger.info(f"[{job_id}] Starting rebuild for {job.original_url}")

    try:
        # ── שלב 1+2: ארכיאולוגיה + השראה במקביל ──────────────
        await update_status(job_id, "researching")
        await notify_telegram(job, stage="🔍 סורק את האתר הקיים + אוסף השראה...")

        site_data, inspiration = await asyncio.gather(
            excavate_site(job.original_url),
            get_inspiration(job.business_type or "עסק"),
            return_exceptions=True,
        )

        # אם ארכיאולוגיה נכשלה — fallback לנתוני job
        if isinstance(site_data, Exception):
            logger.warning(f"[{job_id}] Archaeology failed: {site_data} — using fallback")
            site_data = _fallback_site_data(job)

        if isinstance(inspiration, Exception):
            logger.warning(f"[{job_id}] Inspiration failed: {inspiration} — using empty report")
            inspiration = _empty_inspiration()

        # ── שלב 3: מחקר מתחרים (בסדר, לא במקביל — שימוש ב-city מarche) ──
        competitors = await research_competitors(
            business_type=site_data.business_type,
            city=site_data.city,
        )

        # ── שלב 4: בנייה עם CLAUDE.md דינמי ──────────────────
        await update_status(job_id, "generating")
        await notify_telegram(job, stage="🏗️ בונה אתר עם Claude Code (150 turns)...")

        generated = await generate_site(
            job=job,
            site_data=site_data,
            inspiration=inspiration,
            competitors=competitors,
        )

        # ── שלב 5: בקרת איכות (Phase 05) ─────────────────────
        if quality_loop_available():
            await update_status(job_id, "quality_checking")
            await notify_telegram(job, stage="🎯 בודק איכות (מינימום 8/10)...")
            generated = await quality_loop(
                generated=generated,
                site_data=site_data,
                max_attempts=3,
                min_score=8.0,
            )
            logger.info(f"[{job_id}] Quality score: {generated.quality_score}/10 ({generated.attempts} attempts)")
        else:
            logger.info(f"[{job_id}] Quality loop not available (Phase 05) — skipping")

        # ── שלב 6: GitHub push ─────────────────────────────────
        await update_status(job_id, "pushing")
        await notify_telegram(job, stage="📤 מעלה ל-GitHub...")
        repo_url = await create_repo_and_push(generated, job.slug)

        # ── שלב 7: Deploy ──────────────────────────────────────
        await update_status(job_id, "deploying")
        await notify_telegram(job, stage="🚀 מדפלוי ל-GCP...")
        deploy_url = await deploy_site(repo_url, job.slug)

        # ── סיום ───────────────────────────────────────────────
        await update_status(job_id, "done")
        score_text = f" | ציון: {generated.quality_score:.1f}/10" if generated.quality_score else ""
        await notify_telegram(job, stage=f"✅ האתר מוכן{score_text}", url=deploy_url)
        logger.info(f"[{job_id}] Done → {deploy_url}")

    except Exception as exc:
        logger.exception(f"[{job_id}] rebuild failed")
        await update_status(job_id, "failed")
        await notify_telegram(job, stage=f"❌ שגיאה: {exc}")
        raise
```

---

## Fallbacks

```python
def _fallback_site_data(job: RebuildJob) -> SiteData:
    """כשarכיאולוגיה נכשלת — בונים SiteData בסיסי מנתוני ה-job."""
    from app.services.site_archaeologist import SiteData
    return SiteData(
        url=job.original_url,
        business_name=job.slug.replace("-", " ").title(),
        business_type=job.business_type or "עסק",
        description="",
        phone=job.phone or "",
        email=job.email or "",
        address=job.address or "",
        city=job.city or "",
        primary_color="#2563eb",
    )

def _empty_inspiration():
    from app.services.inspiration_crawler import InspirationReport
    return InspirationReport(
        top_fonts=["Heebo", "Inter"],
        font_style="clean modern sans-serif",
        color_approach="bold primary with white space",
        animation_stack=["GSAP", "Framer Motion", "Lenis"],
        layout_patterns=["full-viewport hero", "card grid", "sticky nav"],
        summary="Use world-class Israeli business site patterns. Bold Hebrew typography, smooth scroll, animated reveals.",
    )
```

---

## Job Status Flow

```
queued
  → researching      (archaeology + inspiration — במקביל)
  → generating       (Claude Code subprocess — 150 turns)
  → quality_checking (AI score + retry — Phase 05)
  → pushing          (GitHub)
  → deploying        (GCP Cloud Run)
  → done ✅
  → failed ❌ (בכל שלב)
```

**Telegram notifications בכל מעבר בין שלבים.**

---

## שינויי API ב-`notify_telegram`

גרסה 2.0 מוסיפה `stage` ו-`url` לפונקציה:

```python
async def notify_telegram(
    job: RebuildJob,
    stage: str,
    url: str | None = None,
) -> None:
    text = f"*{job.slug}* — {stage}"
    if url:
        text += f"\n🔗 {url}"
    await send_telegram_message(job.telegram_chat_id, text, parse_mode="Markdown")
```

---

## שינויים מינימליים לגרסה 1.0 → 2.0

1. **החלף** `crawl_site()` ב-`excavate_site()` (import חדש)
2. **הוסף** `asyncio.gather()` עם `get_inspiration()`
3. **שנה** חתימת `generate_site()` — מקבל עכשיו `site_data, inspiration`
4. **הוסף** block של `quality_loop` לפני ה-push (wrapped ב-`if quality_loop_available()`)
5. **עדכן** `notify_telegram` לתמוך ב-`stage` + `url`

שורות מקוד שישתנו: **~40 שורות** מתוך 202.

---

## בדיקות

```python
@pytest.mark.asyncio
async def test_rebuild_job_with_mocks(mocker):
    mocker.patch("app.services.rebuilder.excavate_site", return_value=mock_site_data())
    mocker.patch("app.services.rebuilder.get_inspiration", return_value=mock_inspiration())
    mocker.patch("app.services.rebuilder.generate_site", return_value=mock_generated())
    mocker.patch("app.services.rebuilder.create_repo_and_push", return_value="https://github.com/...")
    mocker.patch("app.services.rebuilder.deploy_site", return_value="https://slug.run.app")
    mocker.patch("app.services.rebuilder.notify_telegram")

    await run_rebuild_job("test-job-123")

    # ודא שכל השלבים נקראו
    assert excavate_site.called
    assert get_inspiration.called
    assert generate_site.called
```

← [[00 - Services Overview]] | [[site_generator]]
