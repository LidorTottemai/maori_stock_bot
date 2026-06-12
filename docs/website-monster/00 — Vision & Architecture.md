# 🦛 Website Monster — Vision & Architecture

> **סטטוס:** תכנון  
> **תאריך:** 2026-06-12  
> **מטרה:** מנגנון אוטומטי שלוקח עסק ישראלי עם אתר מכוער → מוציא אתר ברמת Awwwards

---

## The Problem

אנחנו לוקחים עסק עם אתר מכוער, בונים לו אתר חדש — ויוצא מכוער יותר.  
הסיבה: Claude Code מקבל הוראות כלליות מדי, בונה "אתר תקין" ולא יצירת מופת.

**אנחנו צריכים מכונה שמייצרת אתרי תדמית שגורמים ללקוח להגיד WOW.**

---

## The Solution — 4 שכבות

```
┌─────────────────────────────────────────────────────┐
│  שכבה 1: @tottemai/maori-ui                         │
│  ספריית רכיבים משותפת — אנימציות, primitives, charts│
└───────────────────┬─────────────────────────────────┘
                    │ כל אתר מייבא מכאן
┌───────────────────▼─────────────────────────────────┐
│  שכבה 2: Site Building Engine                        │
│  CLAUDE.md תובעני → Claude Code builds multi-page   │
└───────────────────┬─────────────────────────────────┘
                    │ קבצים גולמיים
┌───────────────────▼─────────────────────────────────┐
│  שכבה 3: Quality Loop                               │
│  סוכן ביקורתי → ציון 1-10 → retry עד 8/10          │
└───────────────────┬─────────────────────────────────┘
                    │ אתר מאושר
┌───────────────────▼─────────────────────────────────┐
│  שכבה 4: Business Systems                           │
│  הזמנות + מסעדות — plug-in לכל אתר                 │
└─────────────────────────────────────────────────────┘
```

---

## זרימת הפעולה המלאה

```
עסק קיים (URL)
     │
     ▼
Playwright Inspector → SiteMap (תוכן, צבעים, ניווט, תמונות)
     │
     ▼
Inspiration Crawler → InspirationReport (למידה מאתרים מגניבים בתחום)
     │
     ▼
Competitor Research → CompetitorInsights (מה המתחרים עושים)
     │
     ▼
Quality Loop:
  ┌─ generate_site() → Claude Code (150 turns, 60min)
  │       ↓
  │  structural check (מהיר)
  │       ↓
  │  code review score (Claude Haiku, 1-10)
  │       ↓ score < 8?
  └─ retry עם feedback (עד 3 ניסיונות)
     │
     ▼ score ≥ 8
GitHub push → repository_dispatch → GCP VM → nginx → live!
     │
     ▼
Telegram: "האתר מוכן! ציון: 9/10 🎨 http://..."
```

---

## מבנה הריפוים

```
LidorTottemai/
├── maori_stock_bot/     ← FastAPI + bots + pipeline
├── maori-ui/            ← ספריית הרכיבים המשותפת ← חדש
└── {slug}-website/      ← אתר שנבנה (auto-generated)
```

---

## קבצים שישתנו ב-maori_stock_bot

| קובץ | שינוי |
|------|-------|
| `app/services/component_library.py` | חדש — יוצר repo maori-ui |
| `app/services/quality_loop.py` | חדש — scoring + retry |
| `app/services/inspiration_crawler.py` | חדש — למידה מאתרים |
| `app/services/site_generator.py` | שכתוב מלא |
| `app/services/rebuilder.py` | עדכון — orchestration |
| `app/core/config.py` | הוספת שדות quality |
| `app/services/playwright_inspector.py` | הוספת image URLs |

---

## קישורים לשלבים

- [[01 — Phase 1: maori-ui Component Library]]
- [[02 — Phase 2: Animation System]]
- [[03 — Phase 3: Charts & Data Viz]]
- [[04 — Phase 4: Site Building Engine]]
- [[05 — Phase 5: Quality Loop & AI Review]]
- [[06 — Phase 6: Inspiration Crawler]]
- [[07 — Phase 7: Booking System]]
- [[08 — Phase 8: Restaurant Ordering]]
- [[09 — Testing & Verification]]
