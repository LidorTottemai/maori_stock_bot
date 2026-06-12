# 🦛 Vision & Architecture — Website Monster

> **מטרה:** מכונה אוטומטית שלוקחת עסק ישראלי עם אתר מכוער → מייצרת אתר ברמת Awwwards.
> **סטטוס:** תכנון ✅ | ביצוע 🔄
> **תאריך:** 2026-06-12

---

## הבעיה

אנחנו לוקחים עסק עם אתר מכוער בישראל, בונים לו אתר תדמית — ויוצא מכוער יותר ממה שהיה.

**שורש הבעיה:**
1. ה-prompt שנשלח ל-Claude Code לא תובעני מספיק
2. אין ספריית רכיבים — כל אתר מתחיל מאפס, לא עקבי
3. אין בקרת איכות — מה שיוצא נדחף ישירות
4. Claude לומד מהמתחרים הממוצעים, לא מהטובים בעולם

---

## הפתרון — 6 שכבות

```
שכבה 1: maori-ui         ← ספריית רכיבים משותפת (אנימציות, primitives, charts)
שכבה 2: Animation System  ← GSAP + Framer Motion + Lenis — 15 טכניקות
שכבה 3: Charts Library    ← Recharts עם CSS variables (גנרי לחלוטין)
שכבה 4: Build Engine      ← CLAUDE.md מחולל — תובעני, מפורט, מדויק
שכבה 5: Quality Loop      ← סוכן ביקורתי — ציון 1-10, retry עד ≥8
שכבה 6: Inspiration       ← לומד מ-Awwwards, לא מהממוצע
```

---

## ארכיטקטורת הריפוים

```
LidorTottemai/
│
├── maori_stock_bot/          ← "המוח" — FastAPI + Bot + Scanners
│   ├── app/services/
│   │   ├── site_generator.py       (שכבה 4 — CLAUDE.md)
│   │   ├── component_library.py    (שכבה 1 — ensure_library_repo)
│   │   ├── quality_loop.py         (שכבה 5 — scoring + retry)
│   │   ├── inspiration_crawler.py  (שכבה 6 — Awwwards learning)
│   │   └── rebuilder.py            (orchestrator)
│   └── .github/workflows/
│
├── maori-ui/                 ← ספריית הרכיבים (shared)
│   └── src/
│       ├── motion/           ← TextReveal, ScrollReveal, MagneticButton...
│       ├── primitives/       ← Button, Card, Section...
│       ├── charts/           ← Recharts wrappers
│       └── hooks/
│
└── {slug}-website/           ← כל אתר שנבנה (auto-generated)
    ├── package.json          ← "@tottemai/maori-ui": "github:LidorTottemai/maori-ui"
    └── app/[locale]/         ← multi-page, RTL Hebrew default
```

---

## עקרון הצבעים — CSS Variables גנריות

אף צבע קשיח בספרייה. הכל דרך variables שכל אתר מגדיר:

```css
:root {
  --color-primary:        /* נגזר מהאתר הקיים של העסק */
  --color-secondary:
  --color-accent:         /* CTAs */
  --color-bg:             /* dark או light לפי brand */
  --color-surface:
  --color-text:
  --color-text-muted:
}
```

---

## זרימה מלאה

```
עסק ישראלי עם אתר גרוע
        ↓
Playwright סורק (עד 10 דפים, טקסט מלא, צבעים, ניווט)
        ↓
Inspiration Crawler (Awwwards + Google → top 5 sites בקטגוריה)
        ↓
Claude Code (150 turns, 60 min) ← CLAUDE.md + maori-ui installed
        ↓
Quality Loop: structural check → Haiku scoring (1-10) → retry if <8
  עד 3 ניסיונות, מחזיר הגרסה הטובה ביותר
        ↓
GitHub push → GCP deploy → {slug}.hhippo.co.il
```

---

## KPIs להצלחה

| מדד | לפני | יעד |
|-----|------|-----|
| ציון איכות ממוצע | ~4/10 | ≥8/10 |
| אנימציות באתר | 0-1 | ≥5 |
| דפים ייחודיים | 1 (SPA) | 4-6 |
| % אתרים עם WOW factor | ~5% | ~70% |

---

## קישורים

- [[01 - Phase 1 - maori-ui Component Library]]
- [[02 - Phase 2 - Animation System]]
- [[03 - Phase 3 - Charts & Data Viz]]
- [[04 - Phase 4 - Site Building Engine]]
- [[05 - Phase 5 - Quality Loop & AI Review]]
- [[06 - Phase 6 - Inspiration Crawler]]
- [[07 - Phase 7 - Booking System]]
- [[08 - Phase 8 - Restaurant Ordering]]
- [[09 - Testing & Verification]]
