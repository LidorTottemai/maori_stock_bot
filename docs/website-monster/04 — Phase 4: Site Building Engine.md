# Phase 4: Site Building Engine — CLAUDE.md החדש

> **תלות:** Phase 1 (maori-ui קיים)  
> **משך משוער:** 2–3 שעות  
> **קובץ:** `app/services/site_generator.py` — שכתוב מלא

---

## מה משתנה

| פרמטר | לפני | אחרי |
|-------|------|------|
| `max_turns` | 80 | 150 |
| `timeout` | 30 min | 60 min |
| דפים בsummary | 6 | 10 |
| תווים לדף | 800 | 3000 |
| מבנה דפים | SPA בעיקר | multi-page אמיתי |
| ספרייה | מאפס כל פעם | `@tottemai/maori-ui` |
| Typography | ללא scale | clamp() scale מדויק |
| צבעים | hardcoded | CSS variables |
| Quality gate | אין | checklist בסוף |

---

## ה-CLAUDE.md החדש — מבנה

```
1. 👤 אישיות ומטרה
2. 📚 שימוש בספרייה (maori-ui)  
3. 🗂️ מבנה דפים (multi-page)
4. 🎨 מערכת צבעים (CSS vars)
5. ✍️ מערכת טיפוגרפיה (scale)
6. 🦸 Hero Section (דרישות מפורטות)
7. 📐 Navbar & Footer
8. 📋 תוכן מהאתר הקיים
9. 🔍 Insights מהמתחרים
10. 📎 סדר כתיבת קבצים
11. ✅ Quality Gate (checklist)
```

---

## חלק 1 — אישיות

```
You are a creative director + senior Next.js engineer at a top digital agency.
Your agency has won multiple Awwwards SOTD awards.

This website must be MEMORABLE. When the client sees it, they say "WOW" — not "ok".
If the result looks like a generic WordPress template, you have FAILED this task.
Build something that earns its place on awwwards.com.
```

---

## חלק 2 — שימוש בספרייה

```
## USE @tottemai/maori-ui — DO NOT REIMPLEMENT

The package is already installed. Import everything from it:

  import {
    TextReveal, CharReveal, ScrollReveal, ClipReveal,
    MagneticButton, Parallax, StaggerContainer, StaggerItem,
    PageTransition, ScrollProgress, CustomCursor,
    Marquee, CountUp, Reveal3D, ImageReveal, HorizontalScroll,
    Button, Card, Badge, Input, Section, Container, SectionTitle,
    Navbar, Footer, MobileMenu,
    LineChart, BarChart, StatsCard,
    useReducedMotion, useMousePosition,
  } from "@tottemai/maori-ui"

YOUR JOB: Layout, content, and choreography using these building blocks.
NEVER reimplement TextReveal, MagneticButton, or any other maori-ui component.
```

---

## חלק 3 — מבנה דפים

```
## MULTI-PAGE ARCHITECTURE — NOT a SPA

Derive the page structure from the existing site's navigation.
Minimum pages:
  app/[locale]/                → Home (hero + 3-4 teaser sections)
  app/[locale]/about/          → About (story, team, values)
  app/[locale]/services/       → Services (full detail)
  app/[locale]/gallery/        → Gallery (if business has photos)
  app/[locale]/booking/        → Booking (appointment businesses)
    OR app/[locale]/shop/      → Shop (retail businesses)
  app/[locale]/contact/        → Contact (map, form, phone)

Each page has its own layout — NOT just a scrolling one-pager.
Each page uses PageTransition from maori-ui.
```

---

## חלק 4 — מערכת צבעים

```
## COLOR SYSTEM — CSS VARIABLES ONLY

In app/globals.css, define ALL colors as CSS custom properties.
Derive the palette from the existing site's colors: {colors_from_scrape}

:root {{
  /* Derive from existing site — modernize, don't copy blindly */
  --color-primary:       /* main brand color */;
  --color-primary-hover: /* 10% darker */;
  --color-secondary:     /* complementary */;
  --color-accent:        /* CTA pop color */;

  --color-bg:            /* #0a0a0a for dark, #fafafa for light brand */;
  --color-surface:       /* slightly lighter/darker than bg */;
  --color-surface-2:     /* card backgrounds */;
  --color-border:        /* subtle border */;

  --color-text:          /* high contrast on bg */;
  --color-text-muted:    /* 60% opacity */;
  --color-text-subtle:   /* 30% opacity */;
}}

RULE: NO hardcoded color anywhere in the codebase.
Use CSS vars or Tailwind's arbitrary values: text-[var(--color-primary)]
```

---

## חלק 5 — Typography Scale

```
## TYPOGRAPHY — define in tailwind.config.ts

fontSize: {{
  "display-2xl": ["clamp(3rem,8vw,7rem)",    {{lineHeight:"1.05",letterSpacing:"-0.04em"}}],
  "display-xl":  ["clamp(2.5rem,6vw,5rem)",  {{lineHeight:"1.1", letterSpacing:"-0.03em"}}],
  "display-lg":  ["clamp(2rem,4vw,3.5rem)",  {{lineHeight:"1.15",letterSpacing:"-0.02em"}}],
  "heading":     ["clamp(1.5rem,3vw,2.5rem)",{{lineHeight:"1.2", letterSpacing:"-0.01em"}}],
  "body-lg":     ["1.125rem", {{lineHeight:"1.7"}}],
  "body":        ["1rem",     {{lineHeight:"1.7"}}],
  "caption":     ["0.875rem", {{lineHeight:"1.5"}}],
}}

Choose 2 Google Fonts matching the business category:
- Wellness/spa/yoga: Cormorant Garamond (display) + DM Sans (body)
- Tech/modern:       Syne (display) + Inter (body)
- Luxury:            Playfair Display (display) + Lato (body)
- Bold/urban:        Bricolage Grotesque (display) + DM Sans (body)
- Medical/clinic:    Libre Baskerville (display) + Source Sans 3 (body)

Apply display font: text-display-2xl font-display
Apply body font:    font-body
```

---

## חלק 6 — Hero Section (דרישות מפורטות)

```
## HERO SECTION — ALL of these are MANDATORY

1. ✅ Full-viewport height: className="h-screen relative overflow-hidden"
2. ✅ Animated background — choose ONE:
   - Animated gradient mesh (CSS animation or GSAP)
   - Full-bleed image (from existing site) with dark overlay + Parallax
   - GSAP floating geometric shapes (circles/lines)
3. ✅ <TextReveal> or <CharReveal> on the main H1 headline
4. ✅ <ScrollReveal delay={0.3}> on the subheadline
5. ✅ <MagneticButton> wrapping the primary CTA
6. ✅ Scroll indicator: bouncing arrow or mouse icon (Framer Motion)
7. ✅ Business phone number: prominently visible, tel: link
8. ✅ Lenis smooth scroll initialized in layout.tsx
9. ✅ <ScrollProgress /> in layout.tsx (fixed top bar)
10. ✅ <CustomCursor /> in layout.tsx (desktop only)

If you skip ANY of these, you fail the quality gate.
```

---

## חלק 7 — סדר קבצים (30 קבצים)

```
Write files in this exact order:

1.  business.config.json
2.  messages/he.json           ← ALL Hebrew content
3.  messages/en.json           ← English translation of every key
4.  package.json               ← includes @tottemai/maori-ui, framer-motion, gsap, lenis
5.  next.config.mjs            ← transpilePackages: ["@tottemai/maori-ui"], withNextIntl
6.  tsconfig.json
7.  tailwind.config.ts         ← custom fontSize scale, content includes maori-ui path
8.  postcss.config.mjs
9.  middleware.ts              ← next-intl + SITE_PASSWORD gate
10. .gitignore
11. app/globals.css            ← CSS vars + font imports + @keyframes marquee
12. app/[locale]/layout.tsx    ← Lenis, CustomCursor, ScrollProgress, PageTransition
13. app/[locale]/page.tsx      ← Home page
14. app/[locale]/about/page.tsx
15. app/[locale]/services/page.tsx
16. app/[locale]/gallery/page.tsx     ← if business has images
17. app/[locale]/booking/page.tsx     ← appointment type
    OR app/[locale]/shop/page.tsx     ← retail type
18. app/[locale]/contact/page.tsx
19. app/robots.ts
20. app/[locale]/sitemap.ts
21. components/sections/HeroSection.tsx
22. components/sections/ServicesSection.tsx
23. components/sections/AboutSection.tsx
24. components/sections/GallerySection.tsx
25. components/sections/StatsSection.tsx   ← CountUp + numbers
26. components/sections/TestimonialsSection.tsx
27. components/sections/CtaSection.tsx
28. components/booking/BookingForm.tsx     ← if appointment
    OR components/shop/ProductGrid.tsx     ← if retail
29. lib/config.ts
30. README.md
```

---

## חלק 8 — Quality Gate (סוף הבנייה)

```
## ✅ QUALITY GATE — do this LAST

Before finishing, verify every item:

ANIMATIONS:
□ HeroSection uses TextReveal or CharReveal on H1
□ HeroSection has animated background (gradient/shapes/image+parallax)
□ HeroSection has MagneticButton CTA
□ At least 6 ScrollReveal usages across all pages
□ StaggerContainer used in at least one grid section
□ Lenis initialized in layout.tsx

DESIGN:
□ 2 custom Google Fonts loaded (not just Inter)
□ display-2xl or display-xl size used in hero
□ ALL colors are CSS variables (no hex in JSX/CSS outside globals.css)
□ CustomCursor in layout.tsx
□ ScrollProgress in layout.tsx

STRUCTURE:
□ At least 4 page files exist
□ messages/he.json has all content keys
□ package.json includes @tottemai/maori-ui AND framer-motion AND gsap AND lenis
□ next.config.mjs has transpilePackages: ["@tottemai/maori-ui"]
□ tailwind.config.ts content includes maori-ui path

SEO:
□ generateMetadata() in every page
□ JSON-LD LocalBusiness schema in layout
□ robots.ts and sitemap.ts exist

If ANY box is unchecked → fix it NOW before responding.
```

---

## שינויים ב-site_generator.py

```python
# generate_site()
"--max-turns", "150",          # was 80
timeout=3600                   # was 1800 (60 min)

# _build_site_summary()
for page in site_map.pages[:10]:    # was [:6]
    parts.append(f"Content:\n{page.body_text[:3000]}")  # was [:800]
```

---

## בדיקות סוף שלב

- [ ] rebuild על fixfeet מייצר אתר עם `@tottemai/maori-ui` ב-package.json
- [ ] `grep -r "TextReveal" /var/www/sites/fixfeetcoil-website/` מחזיר תוצאות
- [ ] `grep -r "MagneticButton" ...` מחזיר תוצאות
- [ ] יש 4+ קבצי page.tsx בתיקיות שונות
- [ ] `app/globals.css` מכיל `--color-primary`
- [ ] גופן שאינו Inter מופיע בHTML הסופי
