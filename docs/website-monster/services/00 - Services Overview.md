# Services Overview — Python Backend

> **תיקייה:** `app/services/`
> **מטרה:** הלוגיקה שמחברת URL של עסק ישראלי ל-~35 קבצי Next.js מוכנים

---

## Flow מלא

```
לקוח שולח URL דרך Telegram Bot
          ↓
   rebuilder.py — run_rebuild_job()
          │
          ├─── 1. site_archaeologist.py        ~90s max
          │         Playwright → SiteData
          │
          ├─── 2. inspiration_crawler.py       ~90s max (במקביל לארכיאולוגיה)
          │         Awwwards + DDG → InspirationReport
          │
          ├─── 3. site_generator.py            ~60min max
          │         ├─ build_architecture_decision()
          │         ├─ build_dynamic_claude_md()      ← הארטיפקט המרכזי
          │         └─ run_claude_code_subprocess()   150 turns
          │
          ├─── 4. quality_loop.py              ~5-15min (Phase 05)
          │         ├─ structural_check()
          │         ├─ score_with_haiku()       1-10
          │         └─ retry up to 3x if score < 8
          │
          ├─── 5. github_service.py
          │         create_repo_and_push()
          │
          └─── 6. deploy_service.py
                    deploy_to_gcp()
                    → Telegram notification with URL
```

---

## קבצים בתיקייה

| קובץ | סטטוס | תיאור |
|------|--------|-------|
| `site_archaeologist.py` | 🔴 לא קיים | Playwright crawler → SiteData |
| `site_generator.py` | 🟡 קיים, ישן | 80 turns, CLAUDE.md סטטי → צריך שדרוג |
| `inspiration_crawler.py` | 🟡 קיים | Awwwards scraper → InspirationReport |
| `quality_loop.py` | 🔴 לא קיים | Phase 05 — AI scoring + retry |
| `rebuilder.py` | 🟡 קיים, ישן | orchestrator → צריך אינטגרציה של archaeology + quality |
| `github_service.py` | ✅ קיים | create_repo_and_push |
| `deploy_service.py` | ✅ קיים | GCP Cloud Run deployment |

---

## Data Structures

```python
# ─── קלט ────────────────────────────────────────────────────
@dataclass
class RebuildJob:
    id: str
    original_url: str
    slug: str
    business_type: str      # "ספא" / "מסעדה" / "עורך דין" / ...
    telegram_chat_id: str
    priority: int = 0

# ─── ארכיאולוגיה ─────────────────────────────────────────────
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
    pages: list[PageData]
    services: list[str]
    team: list[TeamMember]
    gallery_images: list[str]
    social_links: dict[str, str]
    whatsapp: str
    opening_hours: dict[str, str]
    primary_color: str
    fonts_used: list[str]
    has_booking: bool
    has_menu: bool
    has_shop: bool
    has_payment: bool
    missing_pages: list[str]

# ─── השראה ────────────────────────────────────────────────────
@dataclass
class InspirationReport:
    top_fonts: list[str]
    font_style: str
    color_approach: str
    animation_stack: list[str]
    layout_patterns: list[str]
    summary: str             # ← נשלח ישירות לCLAUDE.md

# ─── פלט ──────────────────────────────────────────────────────
@dataclass
class GeneratedSite:
    files: dict[str, str]    # { "app/page.tsx": "content..." }
    quality_score: float     # 1-10
    attempts: int
    claude_md_used: str
```

---

## Timing

| שלב | זמן רגיל | זמן מקסימום |
|-----|---------|------------|
| ארכיאולוגיה | ~15s | 90s |
| השראה | ~30s | 90s |
| בנייה (Claude Code) | ~25-45min | 60min |
| Quality Loop (×1) | ~3min | 10min |
| Push + Deploy | ~2min | 5min |
| **סה"כ** | **~35min** | **~70min** |

**הארכיאולוגיה וההשראה רצות במקביל** (`asyncio.gather`) → חוסכות ~15-30s.

---

## קישורים לדוקומנטציה מפורטת

- [[site_archaeologist]] — Playwright crawler, `SiteData`, כל הפונקציות
- [[site_generator]] — dynamic CLAUDE.md, שדרוג מ-80 ל-150 turns
- [[CLAUDE_MD_TEMPLATE]] — הטמפלייט המלא שClaude Code מקבל
- [[rebuilder]] — orchestrator מעודכן

← [[../04 - Phase 4 - Site Building Engine]]
