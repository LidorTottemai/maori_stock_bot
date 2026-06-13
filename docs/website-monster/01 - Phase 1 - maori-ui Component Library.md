# 📦 Phase 1 — ספריית הרכיבים `@tottemai/ui`

> **מטרה:** ספריית רכיבים משותפת שכל אתר שנבנה מייבא ממנה.
> **Package:** `@tottemai/ui`
> **Repo:** `github:LidorTottemai/tottemai-ui#main`
> **דוקומנטציה:** `docs/website-monster/component-library/` (104 קבצי Obsidian)
> **עלות:** ~4 שעות פיתוח ראשוני
> **תלויות:** שלב זה הוא הבסיס לכל השאר.

---

## למה ספרייה נפרדת?

בלי ספרייה משותפת: Claude בונה כל אתר מאפס → לא עקבי, לא מלוטש.  
עם ספרייה: Claude מתמקד בלייאאוט ובתוכן, הרכיבים ברמה הגבוהה כבר קיימים.

**⚠️ אין גרפים בספרייה** — גרפים ב-Recharts שמורים לפרויקטים שמצריכים דשבורד בלבד.

---

## שיטת התקנה — github: (ללא npm publish)

```json
// package.json של כל אתר שנבנה
{
  "dependencies": {
    "@tottemai/ui": "github:LidorTottemai/tottemai-ui#main",
    "motion": "^11",
    "gsap": "^3.12",
    "@gsap/react": "^2",
    "lenis": "^1.1"
  }
}
```

```ts
// next.config.mjs של כל אתר
transpilePackages: ["@tottemai/ui"]
```

```ts
// tailwind.config.ts של כל אתר
content: [
  "./app/**/*.{ts,tsx}",
  "./components/**/*.{ts,tsx}",
  "./node_modules/@tottemai/ui/src/**/*.{ts,tsx}"  // ← חשוב!
]
```

---

## מבנה הספרייה — 104 רכיבים

```
tottemai-ui/
├── package.json              name: @tottemai/ui
│                             peerDeps: react >=18, motion >=11, gsap >=3.12
├── src/
│   ├── index.ts              ← re-export הכל
│   ├── cn.ts                 ← clsx + tailwind-merge
│   │
│   ├── primitives/           🧱 בסיס (6 רכיבים)
│   │   ├── Button.tsx        variants: primary/secondary/ghost/outline/destructive
│   │   ├── Badge.tsx         variants: default/secondary/success/warning/destructive/outline
│   │   ├── Avatar.tsx        image + fallback initials
│   │   ├── Skeleton.tsx      loading placeholder + pulse
│   │   ├── Separator.tsx     horizontal/vertical divider
│   │   └── Spinner.tsx       loading indicator, sizes sm/md/lg
│   │
│   ├── forms/                📝 טפסים (17 רכיבים)
│   │   ├── Input.tsx         + prefix/suffix icons
│   │   ├── Textarea.tsx      + auto-resize
│   │   ├── Label.tsx         required indicator
│   │   ├── Field.tsx         label + input + error wrapper
│   │   ├── Select.tsx        Radix UI
│   │   ├── Combobox.tsx      searchable select (cmdk)
│   │   ├── Checkbox.tsx      Radix UI + indeterminate
│   │   ├── RadioGroup.tsx    Radix UI
│   │   ├── Switch.tsx        Radix UI
│   │   ├── Slider.tsx        Radix UI + range
│   │   ├── Rating.tsx        stars 1-5 + half-star
│   │   ├── Toggle.tsx        Radix UI
│   │   ├── ToggleGroup.tsx   single/multiple
│   │   ├── InputOTP.tsx      input-otp slots
│   │   ├── DatePicker.tsx    react-day-picker + date-fns + עברית
│   │   ├── Calendar.tsx      standalone calendar
│   │   └── FileUpload.tsx    react-dropzone + drag & drop
│   │
│   ├── data-display/         📊 הצגת מידע (9 רכיבים)
│   │   ├── Table.tsx         HTML table + striped/bordered
│   │   ├── DataTable.tsx     TanStack Table + sort/filter/pagination
│   │   ├── List.tsx          ordered/unordered/description
│   │   ├── Chip.tsx          filterable tags
│   │   ├── Typography.tsx    heading scale h1-h6 + body variants
│   │   ├── Tooltip.tsx       Radix UI + delay
│   │   ├── HoverCard.tsx     Radix UI rich preview
│   │   ├── KbdKey.tsx        keyboard shortcut display
│   │   └── Timeline.tsx      vertical timeline + MUI-style
│   │
│   ├── feedback/             🔔 פידבק (7 רכיבים)
│   │   ├── Alert.tsx         variants: info/success/warning/error
│   │   ├── AlertDialog.tsx   Radix UI confirm dialog
│   │   ├── Dialog.tsx        Radix UI modal
│   │   ├── Sheet.tsx         Radix UI side/bottom drawer
│   │   ├── Toast.tsx         Sonner-based notifications
│   │   ├── Progress.tsx      linear + circular
│   │   └── Backdrop.tsx      overlay for modals/loading
│   │
│   ├── navigation/           🧭 ניווט (9 רכיבים)
│   │   ├── Tabs.tsx          Radix UI
│   │   ├── Breadcrumb.tsx    path breadcrumbs + ellipsis
│   │   ├── Pagination.tsx    page-based + cursor-based
│   │   ├── Stepper.tsx       MUI-style wizard steps
│   │   ├── Menu.tsx          accessible list menu
│   │   ├── DropdownMenu.tsx  Radix UI + icons/shortcuts
│   │   ├── NavigationMenu.tsx Radix UI top-level nav
│   │   ├── Command.tsx       cmdk Cmd+K palette
│   │   └── Menubar.tsx       Radix UI desktop menu
│   │
│   ├── surfaces/             🗂️ מיכלים (7 רכיבים)
│   │   ├── Card.tsx          header/body/footer + hover
│   │   ├── Accordion.tsx     Radix UI
│   │   ├── Popover.tsx       Radix UI
│   │   ├── ContextMenu.tsx   Radix UI right-click
│   │   ├── Collapsible.tsx   Radix UI
│   │   ├── ScrollArea.tsx    Radix UI custom scrollbar
│   │   └── Resizable.tsx     react-resizable-panels split view
│   │
│   ├── layout/               📐 לייאאוט (10 רכיבים)
│   │   ├── Navbar.tsx        sticky + scroll-aware + mobile hamburger
│   │   ├── Footer.tsx        multi-column grid + social icons
│   │   ├── MobileMenu.tsx    animated slide-in drawer
│   │   ├── SectionTitle.tsx  badge + heading + subtitle + scroll reveal
│   │   ├── Sidebar.tsx       collapsible + Framer Motion width
│   │   ├── Container.tsx     max-width wrapper (sm/md/lg/xl/full)
│   │   ├── Section.tsx       vertical spacing with clamp()
│   │   ├── Stack.tsx         flexbox + gap + dividers
│   │   ├── Grid.tsx          responsive CSS grid
│   │   └── AspectRatio.tsx   Radix UI aspect ratio
│   │
│   ├── motion/               🎬 אנימציות (13 רכיבים)
│   │   ├── TextReveal.tsx    reveal מילה-מילה עם stagger
│   │   ├── CharReveal.tsx    reveal אות-אות (hero)
│   │   ├── ScrollReveal.tsx  fade+slide בviewport
│   │   ├── ClipReveal.tsx    clip-path reveal מלמטה
│   │   ├── MagneticButton.tsx spring mouse tracking
│   │   ├── PageTransition.tsx AnimatePresence page switch
│   │   ├── ScrollProgress.tsx scaleX progress bar
│   │   ├── CustomCursor.tsx  dot + ring, mix-blend-mode: difference
│   │   ├── Parallax.tsx      GSAP ScrollTrigger parallax
│   │   ├── Marquee.tsx       CSS infinite scroll ticker
│   │   ├── CountUp.tsx       animated number counter
│   │   ├── Reveal3D.tsx      mouse-tilt 3D card
│   │   └── HorizontalScroll.tsx GSAP pin + scrub gallery
│   │
│   ├── special/              ✨ Magic UI / Aceternity level (17 רכיבים)
│   │   ├── AuroraText.tsx    RGB gradient shimmer text
│   │   ├── ShimmerButton.tsx rotating gradient border + shimmer
│   │   ├── BorderBeam.tsx    animated SVG border glow
│   │   ├── AnimatedBeam.tsx  connecting beams between elements
│   │   ├── BentoGrid.tsx     asymmetric feature grid
│   │   ├── OrbitingCircles.tsx CSS animation orbiting icons
│   │   ├── Particles.tsx     canvas floating particles
│   │   ├── Globe.tsx         Three.js interactive globe
│   │   ├── Spotlight.tsx     radial mouse-tracking spotlight
│   │   ├── LampEffect.tsx    glow cone from top hero
│   │   ├── CardStack.tsx     Framer Motion stacked cards
│   │   ├── WavyBackground.tsx SVG wavy animated background
│   │   ├── TypingAnimation.tsx typewriter cursor effect
│   │   ├── WordRotate.tsx    AnimatePresence word cycler
│   │   ├── MorphingText.tsx  GSAP text morph between strings
│   │   ├── SparklesText.tsx  random sparkles on text
│   │   └── AnimatedGradient.tsx moving mesh gradient background
│   │
│   └── hooks/                🪝 hooks (7)
│       ├── useMousePosition.ts  { x, y } + normalized option
│       ├── useScrollVelocity.ts scroll px/s with RAF decay
│       ├── useReducedMotion.ts  prefers-reduced-motion reactive
│       ├── useBreakpoint.ts     Tailwind breakpoints + isMobile/isTablet/isDesktop
│       ├── useClickOutside.ts   ref + callback + enabled
│       ├── useDebounce.ts       generic debounce
│       └── useLocalStorage.ts   useState + localStorage + cross-tab sync
│
└── README.md
```

---

## עיקרון הצבעים — CSS Variables בלבד

**אין אף צבע קשיח בספרייה.** דוגמה:

```tsx
// כל רכיב משתמש בvariables בלבד
<motion.div
  className="rounded-full border border-[var(--color-primary)]
             text-[var(--color-text)] hover:bg-[var(--color-primary)]
             px-8 py-4"
  style={{ x: springX, y: springY }}
>
  {children}
</motion.div>
```

כל אתר שמשתמש בספרייה מגדיר בגlobals.css שלו:
```css
:root {
  --color-primary:       #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-secondary:     #7c3aed;
  --color-accent:        #f59e0b;
  --color-bg:            #0a0a0a;
  --color-surface:       #111111;
  --color-surface-2:     #1a1a1a;
  --color-border:        #222222;
  --color-text:          #f0f0f0;
  --color-text-muted:    #888888;
}
```

---

## RTL ו-Accessibility

- **RTL:** כל layout משתמש ב-CSS logical properties (`margin-inline`, `padding-inline`, `inset-inline-start`)
- **prefers-reduced-motion:** כל רכיב motion בודק `useReducedMotion()` ומחזיר גרסה סטטית
- **aria-*:** כל Radix UI פרימיטיב כולל aria ו-keyboard nav אוטומטית

---

## אוטומציה — `component_library.py`

```python
# app/services/component_library.py

TOTTEMAI_UI_FILES: dict[str, str] = {
    "package.json": '{"name": "@tottemai/ui", ...}',
    "src/index.ts": "export * from './motion/TextReveal' ...",
    "src/cn.ts": "import { clsx } from 'clsx' ...",
    "src/motion/TextReveal.tsx": "...",
    # ... כל שאר הקבצים לפי הדוקומנטציה ב-component-library/
}

async def ensure_library_repo(settings: Settings, http_client: httpx.AsyncClient) -> None:
    """בדוק אם tottemai-ui קיים ב-GitHub. אם לא — צור ודחוף."""
    resp = await http_client.get(
        f"https://api.github.com/repos/{settings.github_username}/tottemai-ui",
        headers={"Authorization": f"Bearer {settings.github_token}"}
    )
    if resp.status_code == 404:
        await _create_and_push_library(settings, http_client)
```

נקרא פעם אחת ב-`rebuilder.py` לפני הבנייה הראשונה.

---

## בדיקות סיום שלב 1

- [ ] `gh repo view LidorTottemai/tottemai-ui` → קיים
- [ ] `ls tottemai-ui/src/motion/` → 13 קבצים
- [ ] `ls tottemai-ui/src/forms/` → 17 קבצים
- [ ] `ls tottemai-ui/src/special/` → 17 קבצים
- [ ] `npm install @tottemai/ui` על אתר ריק → בנייה מצליחה
- [ ] `TextReveal` מאנים נכון על מסך
- [ ] `MagneticButton` מגיב ל-hover
- [ ] `MorphingText` עובר בין מחרוזות
- [ ] כל הצבעים משתנים בהתאם ל-CSS variables
- [ ] RTL ו-LTR נראים נכון
- [ ] `prefers-reduced-motion` עוצר animations

← [[00 - Vision & Architecture]]  
→ [[component-library/00 - Library Overview & Build Plan]]
