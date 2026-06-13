# ⚙️ Phase 4 — מנוע הבנייה (CLAUDE.md)

> **מטרה:** שכתוב מלא של site_generator.py — CLAUDE.md תובעני שמשתמש ב-`@tottemai/ui`.
> **קובץ:** `app/services/site_generator.py`
> **ספריות:** `@tottemai/ui` (רכיבים + motion) · `@tottemai/graphs` (גרפים, אם נדרש)
> **תנאי קדם:** [[03.5 - Phase 3.5 - Inspiration Crawler]] חייב לרוץ קודם — הוא מייצר את `InspirationReport` שנדחף לCLAUDE.md

---

## השינויים הטכניים

| פרמטר | לפני | אחרי |
|-------|------|-------|
| `max_turns` | 80 | 150 |
| `timeout` | 30 דקות | 60 דקות |
| דפים בsummary | 6 | 10 |
| תווים לדף | 800 | 3000 |

---

## מבנה CLAUDE.md החדש

### 1. אישיות
```
You are a creative director + senior Next.js engineer.
Your work wins Awwwards SOTD. If this looks like a generic template — you FAILED.
```

### 2. שימוש בספריות (חובה)
```
@tottemai/ui IS INSTALLED — NEVER reimplement its components.

// motion
import { TextReveal, CharReveal, ScrollReveal, ClipReveal } from "@tottemai/ui"
import { MagneticButton, PageTransition, CustomCursor, ScrollProgress } from "@tottemai/ui"
import { Parallax, Marquee, CountUp, Reveal3D, HorizontalScroll } from "@tottemai/ui"

// primitives + forms
import { Button, Badge, Avatar, Input, Select, Dialog, Sheet } from "@tottemai/ui"

// layout
import { Navbar, Footer, MobileMenu, SectionTitle, Container, Section } from "@tottemai/ui"

// special (השתמש כשמתאים לסוג האתר)
import { Spotlight, BentoGrid, AnimatedGradient, AuroraText } from "@tottemai/ui"

// גרפים — רק כשהאתר דורש data viz או admin dashboard
import { LineChart, StatsCard, BubbleMap } from "@tottemai/graphs"

Your job: LAYOUT + CONTENT + CHOREOGRAPHY using these building blocks.
Never implement TextReveal / ScrollReveal / MagneticButton from scratch.
```

### 3. מבנה דפים (חובה — לא SPA)
```
app/[locale]/                  → Home (hero + teasers בלבד)
app/[locale]/about/            → הסיפור שלנו + stats + team
app/[locale]/services/         → שירותים מפורטים
app/[locale]/gallery/          → גלריה (אם יש תמונות/עבודות)
app/[locale]/booking/          → הזמנות (services)
  OR app/[locale]/shop/        → חנות (retail)
app/[locale]/contact/          → צור קשר + מפה
```

### 4. Hero Section — דרישות מפורטות
```
חייב לכלול את כולם:
✓ Full-viewport (h-screen)
✓ <TextReveal> על הכותרת הראשית (לא headline פשוט)
✓ <ScrollReveal> על תת-כותרת ו-CTA
✓ <MagneticButton> לCTA הראשי
✓ רקע אחד מ: animated gradient mesh / תמונה עם overlay / GSAP shapes
✓ חץ scroll עם bounce animation (Framer Motion)
✓ מספר טלפון בולט וגדול
✓ Lenis + GSAP initialized בlayout
```

### 5. Typography Scale (חובה)
```ts
// tailwind.config.ts
fontSize: {
  "display-2xl": ["clamp(3rem,8vw,7rem)",   {lineHeight:"1.05",letterSpacing:"-0.04em"}],
  "display-xl":  ["clamp(2.5rem,6vw,5rem)", {lineHeight:"1.1", letterSpacing:"-0.03em"}],
  "display-lg":  ["clamp(2rem,4vw,3.5rem)", {lineHeight:"1.15",letterSpacing:"-0.02em"}],
  "heading":     ["clamp(1.5rem,3vw,2.5rem)",{lineHeight:"1.2"}],
  "body-lg":     ["1.125rem", {lineHeight:"1.7"}],
  "body":        ["1rem",     {lineHeight:"1.7"}],
}
```

**2 Google Fonts לפי קטגוריה:**
| קטגוריה | Display Font | Body Font |
|---------|-------------|-----------|
| ספא/יופי | Playfair Display | DM Sans |
| כושר/ספורט | Bebas Neue | Inter |
| מסעדה | Syne | Lato |
| קליניקה | Bricolage Grotesque | Plus Jakarta Sans |
| קמעונאות | Archivo | Nunito |

### 6. מערכת צבעים
```
globals.css חייב להגדיר:
--color-primary, --color-primary-hover
--color-secondary, --color-accent
--color-bg, --color-surface, --color-surface-2
--color-border, --color-text, --color-text-muted

הצבעים נגזרים מהאתר הקיים:
- חולץ מה-colors ב-SiteMap
- אם כחול → palette כחולה מודרנית
- אם ירוק → palette ירוקה וטרית
- אם אין מידע → dark mode עם accent פוקסיה
```

### 7. סדר קבצים (30 קבצים)
```
1.  package.json              ← @tottemai/ui + @tottemai/graphs (אם נדרש) + motion + gsap + lenis
2.  next.config.mjs           ← transpilePackages: ["@tottemai/ui", "@tottemai/graphs"]
3.  tsconfig.json
4.  tailwind.config.ts        ← fontSize scale + CSS vars in content
5.  postcss.config.mjs
6.  middleware.ts              ← next-intl + password gate
7.  .gitignore
8.  messages/he.json           ← כל התוכן בעברית
9.  messages/en.json           ← תרגום אנגלית
10. app/globals.css            ← CSS vars + font imports + base
11. app/[locale]/layout.tsx    ← SmoothScroll + CustomCursor + ScrollProgress
12. app/[locale]/page.tsx      ← Home
13. app/[locale]/about/page.tsx
14. app/[locale]/services/page.tsx
15. app/[locale]/gallery/page.tsx  (אם רלוונטי)
16. app/[locale]/booking/page.tsx  OR shop/page.tsx
17. app/[locale]/contact/page.tsx
18. app/robots.ts
19. app/[locale]/sitemap.ts
20. components/sections/HeroSection.tsx
21. components/sections/ServicesSection.tsx
22. components/sections/AboutSection.tsx
23. components/sections/GallerySection.tsx
24. components/sections/StatsSection.tsx
25. components/sections/CtaSection.tsx
26. components/sections/TestimonialsSection.tsx
27. components/booking/BookingForm.tsx  OR components/shop/...
28. lib/config.ts
29. business.config.json
30. README.md
```

### 8. Quality Gate פנימי
```
לפני שאתה מסיים, בדוק כל אחד:
□ TextReveal בhero?
□ MagneticButton?
□ רקע אנימטי בhero?
□ 4+ ScrollReveal בדף הבית?
□ גופנים מותאמים (לא רק Inter)?
□ CSS variables לכל הצבעים?
□ 5+ דפים קיימים (לא SPA)?
□ @tottemai/ui מיובא ומשמש (TextReveal, ScrollReveal, MagneticButton לפחות)?
□ Lenis מאותחל בlayout?
□ next-intl עם he + en?

אם משהו חסר → תקן עכשיו לפני שתסיים.
```

---

## בדיקות סיום שלב 4

- [ ] rebuild ידני על עסק קיים (fixfeet)
- [ ] בדוק `cat package.json | grep tottemai` → `@tottemai/ui` קיים
- [ ] בדוק `grep -r "TextReveal" components/` → מופיע
- [ ] בדוק `grep -r "from \"@tottemai/ui\"" components/` → מופיע
- [ ] בדוק `grep -r "from \"@tottemai/graphs\"" .` → קיים (אם site_type דורש גרפים)
- [ ] ספור דפים: `ls app/[locale]/` → ≥5 תיקיות
- [ ] hero: TextReveal נראה, MagneticButton מגיב
- [ ] עברית: RTL, גופן תקין
- [ ] אנגלית: LTR, שפה מתחלפת
