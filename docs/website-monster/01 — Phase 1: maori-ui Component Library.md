# Phase 1: @tottemai/maori-ui — ספריית הרכיבים

> **תלות:** אין  
> **משך משוער:** 3–5 שעות  
> **תוצר:** repo `LidorTottemai/maori-ui` חי ב-GitHub

---

## מה זה ולמה

בלי ספרייה משותפת, כל אתר שClaude בונה מתחיל מאפס.  
התוצאה: לא עקבית, לא מלוטשת, גנרית.

עם `@tottemai/maori-ui`:
- Claude לא "ממציא" אנימציות — הוא **משתמש** בהן
- כל אתר מקבל את אותם פרימיטיבים מלוטשים
- עדכון ב-maori-ui → כל האתרים מעודכנים אוטומטית

---

## אופן ההפצה — git install (ללא npm registry)

```jsonc
// package.json של כל אתר שנבנה
{
  "dependencies": {
    "@tottemai/maori-ui": "github:LidorTottemai/maori-ui#main"
  }
}
```

```ts
// next.config.mjs של כל אתר
transpilePackages: ["@tottemai/maori-ui"]
```

```ts
// tailwind.config.ts של כל אתר
content: [
  "./app/**/*.{ts,tsx}",
  "./components/**/*.{ts,tsx}",
  "./node_modules/@tottemai/maori-ui/src/**/*.{ts,tsx}"  // ← חובה
]
```

**יתרון:** אין צורך ב-`npm publish`, אין tokens, push = עדכון לכולם.

---

## מבנה הספרייה

```
maori-ui/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                    ← re-export הכל
│   ├── cn.ts                       ← clsx + tailwind-merge
│   │
│   ├── motion/                     ← 🎬 אנימציות
│   │   ├── TextReveal.tsx
│   │   ├── CharReveal.tsx
│   │   ├── ScrollReveal.tsx
│   │   ├── MagneticButton.tsx
│   │   ├── PageTransition.tsx
│   │   ├── ScrollProgress.tsx
│   │   ├── CustomCursor.tsx
│   │   ├── Parallax.tsx
│   │   ├── Marquee.tsx
│   │   ├── CountUp.tsx
│   │   ├── Reveal3D.tsx
│   │   ├── ClipReveal.tsx
│   │   └── HorizontalScroll.tsx
│   │
│   ├── primitives/                 ← 🧱 בסיס
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Section.tsx
│   │   ├── Container.tsx
│   │   └── Divider.tsx
│   │
│   ├── charts/                     ← 📊 גרפים (Recharts)
│   │   ├── LineChart.tsx
│   │   ├── BarChart.tsx
│   │   ├── PieChart.tsx
│   │   ├── AreaChart.tsx
│   │   └── StatsCard.tsx
│   │
│   ├── layout/                     ← 📐 לייאאוט
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── MobileMenu.tsx
│   │   └── SectionTitle.tsx
│   │
│   └── hooks/
│       ├── useMousePosition.ts
│       ├── useScrollVelocity.ts
│       ├── useReducedMotion.ts
│       └── useBreakpoint.ts
│
└── README.md
```

---

## עיקרון הצבעים — CSS Variables בלבד

**אין אף צבע קשיח בספרייה.** הכל דרך CSS custom properties:

```css
/* כל אתר מגדיר בglobals.css שלו: */
:root {
  --color-primary:        #2563eb;
  --color-primary-hover:  #1d4ed8;
  --color-secondary:      #7c3aed;
  --color-accent:         #f59e0b;

  --color-bg:             #0a0a0a;
  --color-surface:        #111111;
  --color-surface-2:      #1a1a1a;
  --color-border:         #222222;

  --color-text:           #f0f0f0;
  --color-text-muted:     #888888;
  --color-text-subtle:    #444444;
}
```

כל רכיב בספרייה משתמש: `className="text-[var(--color-primary)]"` וכו'.

---

## package.json של maori-ui

```json
{
  "name": "@tottemai/maori-ui",
  "version": "0.1.0",
  "main": "src/index.ts",
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18",
    "framer-motion": ">=11",
    "gsap": ">=3.12",
    "lenis": ">=1.1",
    "recharts": ">=2.12",
    "clsx": ">=2",
    "tailwind-merge": ">=2"
  }
}
```

---

## יצירת הריפו — `component_library.py`

הקובץ `app/services/component_library.py` יכיל:
1. `MAORI_UI_FILES: dict[str, str]` — כל קבצי הספרייה כstring constants
2. `ensure_library_repo(settings, http_client)` — יוצר את הריפו אם לא קיים ודוחף את הקבצים

```python
async def ensure_library_repo(settings: Settings, http: httpx.AsyncClient) -> None:
    """Idempotent: creates maori-ui repo and pushes all component files."""
    repo = "maori-ui"
    # check if exists
    r = await http.get(f"https://api.github.com/repos/{settings.github_username}/{repo}",
                       headers=_gh_headers(settings))
    if r.status_code == 200:
        logger.info("maori-ui repo already exists — skipping creation")
        return
    # create
    await http.post("https://api.github.com/user/repos", headers=_gh_headers(settings),
                    json={"name": repo, "private": False, "auto_init": False})
    # push all files
    for path, content in MAORI_UI_FILES.items():
        await _push_file(settings.github_username, repo, path, content,
                         _gh_headers(settings), http)
    logger.info("maori-ui repo created and populated")
```

הפונקציה נקראת פעם אחת לפני כל rebuild (idempotent — לא עושה כלום אם הריפו קיים).

---

## בדיקות סוף שלב

- [ ] ריפו `LidorTottemai/maori-ui` מופיע ב-GitHub
- [ ] `src/motion/TextReveal.tsx` קיים וכולל Framer Motion
- [ ] `src/motion/MagneticButton.tsx` קיים
- [ ] `src/charts/LineChart.tsx` קיים ומשתמש בRecharts
- [ ] `src/index.ts` מייצא את כל הרכיבים
- [ ] `npm install github:LidorTottemai/maori-ui` עובד בפרויקט Next.js ריק
- [ ] `import { TextReveal } from "@tottemai/maori-ui"` מקמפל ללא שגיאות
- [ ] `TextReveal` מציג אנימציה בדפדפן עם `--color-primary: red`
