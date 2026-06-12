# 📦 Phase 1 — ספריית הרכיבים `@tottemai/maori-ui`

> **מטרה:** ספריית רכיבים משותפת שכל אתר שנבנה מייבא ממנה.
> **עלות:** ~4 שעות פיתוח
> **תלויות:** שלב זה הוא הבסיס לכל השאר.

---

## למה ספרייה נפרדת?

בלי ספרייה משותפת: Claude בונה כל אתר מאפס → לא עקבי, לא מלוטש.
עם ספרייה: Claude מתמקד בלייאאוט ובתוכן, הרכיבים ברמה גבוהה כבר קיימים.

---

## שיטת התקנה — github: (ללא npm publish)

```json
// package.json של כל אתר שנבנה
{
  "dependencies": {
    "@tottemai/maori-ui": "github:LidorTottemai/maori-ui#main",
    "framer-motion": "^11",
    "gsap": "^3.12",
    "lenis": "^1.1"
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
  "./node_modules/@tottemai/maori-ui/src/**/*.{ts,tsx}"  // ← חשוב!
]
```

---

## מבנה הספרייה

```
maori-ui/
├── package.json              name: @tottemai/maori-ui
│                             peerDeps: react >=18, framer-motion >=11, gsap >=3.12
├── src/
│   ├── index.ts              ← re-export הכל
│   ├── cn.ts                 ← clsx + tailwind-merge
│   │
│   ├── motion/               🎬 אנימציות
│   │   ├── TextReveal.tsx    reveal מילה-מילה
│   │   ├── CharReveal.tsx    reveal אות-אות (hero)
│   │   ├── ScrollReveal.tsx  fade+slide בviewport
│   │   ├── ClipReveal.tsx    clip-path reveal
│   │   ├── MagneticButton.tsx
│   │   ├── PageTransition.tsx
│   │   ├── ScrollProgress.tsx
│   │   ├── CustomCursor.tsx
│   │   ├── Parallax.tsx      GSAP parallax
│   │   ├── Marquee.tsx       טקסט נע אינסופי
│   │   ├── CountUp.tsx       מספרים עולים
│   │   ├── Reveal3D.tsx      tilt על hover
│   │   └── HorizontalScroll.tsx
│   │
│   ├── primitives/           🧱 בסיס
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Section.tsx
│   │   └── Container.tsx
│   │
│   ├── charts/               📊 גרפים
│   │   ├── LineChart.tsx
│   │   ├── BarChart.tsx
│   │   ├── PieChart.tsx
│   │   ├── AreaChart.tsx
│   │   └── StatsCard.tsx
│   │
│   ├── layout/               📐 לייאאוט
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

## עיקרון הצבעים — גנרי לחלוטין

אף צבע קשיח בספרייה. דוגמת MagneticButton:

```tsx
// components/MagneticButton.tsx
<motion.div
  className="rounded-full border border-[var(--color-primary)] 
             text-[var(--color-text)] hover:bg-[var(--color-primary)]
             px-8 py-4 cursor-none"
  style={{ x: springX, y: springY }}
>
  {children}
</motion.div>
```

כל האתר שמשתמש בספרייה מגדיר את הצבעים בglobals.css — הרכיבים "מתצבעים" אוטומטית.

---

## אוטומציה — `component_library.py`

```python
# app/services/component_library.py

MAORI_UI_FILES: dict[str, str] = {
    "package.json": '{"name": "@tottemai/maori-ui", ...}',
    "src/index.ts": "export * from './motion/TextReveal' ...",
    "src/cn.ts": "import { clsx } from 'clsx' ...",
    "src/motion/TextReveal.tsx": "...",
    # ... כל שאר הקבצים
}

async def ensure_library_repo(settings: Settings, http_client: httpx.AsyncClient) -> None:
    """בדוק אם maori-ui קיים ב-GitHub. אם לא — צור ודחוף."""
    resp = await http_client.get(
        f"https://api.github.com/repos/{settings.github_username}/maori-ui",
        headers={"Authorization": f"Bearer {settings.github_token}"}
    )
    if resp.status_code == 404:
        await _create_and_push_library(settings, http_client)
    # אם קיים — idempotent, לא עושים כלום
```

נקרא פעם אחת ב-`rebuilder.py` לפני הבנייה הראשונה.

---

## בדיקות סיום שלב 1

- [ ] `gh repo view LidorTottemai/maori-ui` → קיים
- [ ] `ls maori-ui/src/motion/` → 12 קבצים
- [ ] `ls maori-ui/src/charts/` → 5 קבצים
- [ ] אתר demo (ידני) שמשתמש בספרייה — נראה טוב
- [ ] `npm install @tottemai/maori-ui` על אתר ריק → בנייה מצליחה
- [ ] `TextReveal` מאנים נכון על מסך
- [ ] `MagneticButton` מגיב ל-hover
- [ ] כל הצבעים משתנים בהתאם ל-CSS variables
