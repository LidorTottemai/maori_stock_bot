# CLAUDE.md — הטמפלייט הדינמי

> **קובץ:** `app/templates/claude_md_template.txt`
> **זה הארטיפקט המרכזי של כל הפרויקט** — הטקסט שClaude Code מקבל בפועל לבנות אתר שלם.
> `site_generator.py` ממלא את הplaceholders `{...}` בנתונים מ-SiteData + InspirationReport.

---

## הטמפלייט המלא

```
# WEBSITE BUILD MISSION — {business_name}

You are building a world-class Hebrew Israeli business website from scratch.
This will be scored 1-10 by an AI reviewer. Target: 8+/10. Do not stop until done.

Business: {business_name}
Type:     {business_type}
City:     {city}

---

## ABSOLUTE RULES (never break these)

1. NEVER import from shadcn/ui, MUI, Radix, Headless UI directly
2. ALL UI components come from @tottemai/ui only
3. ALL charts/data-viz come from @tottemai/ui/charts only
4. NEVER hardcode colors — use CSS variables everywhere
5. NEVER use px for font-size — use rem
6. ALWAYS write TypeScript strict (no `any`)
7. NEVER skip animations — every section must animate
8. ALWAYS support Hebrew RTL as the default direction
9. ALWAYS include accessibility (see section below)
10. BUILD IN ORDER — follow FILE BUILD ORDER exactly

---

## TECH STACK

```json
{
  "framework":   "Next.js 15 App Router",
  "language":    "TypeScript strict",
  "styling":     "Tailwind CSS + CSS Variables",
  "ui-library":  "@tottemai/ui (github:LidorTottemai/tottemai-ui#main)",
  "animations":  "motion/react (Framer Motion 11) + GSAP 3 + ScrollTrigger + Lenis",
  "i18n":        "next-intl (he default, en secondary)",
  "fonts":       "Heebo (Hebrew) + Inter (English/numbers)",
  "images":      "next/image (AVIF + WebP)",
  "forms":       "@tottemai/ui Form + Zod validation"
}
```

---

## DESIGN TOKENS (globals.css — set these first)

```css
:root {
  --color-primary:      {primary_color};
  --color-primary-dark: color-mix(in srgb, {primary_color} 80%, black);
  --color-surface:      #ffffff;
  --color-surface-alt:  #f8fafc;
  --color-text:         #0f172a;
  --color-text-muted:   #64748b;
  --color-border:       #e2e8f0;

  --radius-sm:  6px;
  --radius-md:  12px;
  --radius-lg:  20px;
  --radius-xl:  32px;

  --shadow-sm:  0 1px 3px rgba(0,0,0,.08);
  --shadow-md:  0 4px 16px rgba(0,0,0,.12);
  --shadow-lg:  0 8px 32px rgba(0,0,0,.16);

  --font-heebo: var(--font-heebo);
  --font-inter: var(--font-inter);

  --section-padding: clamp(4rem, 8vw, 8rem);
  --container-max:   1280px;
}
```

---

## TYPOGRAPHY SCALE

```css
/* Use only these sizes — no arbitrary values */
.text-hero   { font-size: clamp(3rem, 6vw, 5.5rem); font-weight: 800; line-height: 1.1; }
.text-h1     { font-size: clamp(2rem, 4vw, 3.5rem); font-weight: 700; line-height: 1.2; }
.text-h2     { font-size: clamp(1.5rem, 3vw, 2.5rem); font-weight: 700; line-height: 1.3; }
.text-h3     { font-size: clamp(1.25rem, 2vw, 1.75rem); font-weight: 600; }
.text-body   { font-size: 1rem; line-height: 1.7; }
.text-small  { font-size: 0.875rem; line-height: 1.6; }
.text-label  { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
```

---

## PAGES TO BUILD

{pages_list}

Minimum: home + about + services + contact + accessibility-statement = 5 pages.
Each page must have real content from the business info below — no Lorem Ipsum.

---

## BUSINESS CONTENT (use exactly — do not invent)

**Business:** {business_name}
**Description:** {description}

**Contact:**
  Phone: {phone}
  WhatsApp: {whatsapp}
  Email: {email}
  Address: {address}

**Services:**
{services_list}

**Team:**
{team_list}

**Opening Hours:**
{hours}

**Social Media:**
{social}

**Competitor Insights:**
{competitor_insights}

---

## ANIMATIONS — MANDATORY (minimum 5 techniques, ALL major sections)

### Setup (providers.tsx — build this second, after globals.css)
```tsx
"use client"
import Lenis from "lenis"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import { useEffect } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10*t)) })
    gsap.ticker.add(time => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)
    ScrollTrigger.refresh()
    return () => { lenis.destroy() }
  }, [])
  return <>{children}</>
}
```

### Mandatory Animations
```tsx
import {
  TextReveal,      // ALL hero headings + section titles
  ScrollReveal,    // ALL cards, features, content blocks
  MagneticButton,  // ALL primary CTA buttons
  CharReveal,      // At least ONE dramatic title (hero or about)
  ClipReveal,      // Image reveals — gallery, team photos
  CountUp,         // Statistics section (years, clients, projects)
  Marquee,         // Logo strip OR quote strip OR services list
  Parallax,        // Hero background OR decorative elements
} from "@tottemai/ui"
```

**Rules:**
- TextReveal: `<TextReveal text="כל כותרת ראשית" />` — do not put raw text in H1/H2
- ScrollReveal: wrap every Card, every content block below the fold
- MagneticButton: `<MagneticButton><Button>צור קשר</Button></MagneticButton>` on all primary CTAs
- CountUp: at least 3 stats — years in business, clients, treatments/projects, etc.
- Never put ALL animations in one section — distribute across the page

### INSPIRATION from world-class sites
{inspiration_summary}

Top fonts seen: {top_fonts}
Animation stack seen: {animation_stack}

---

## COMPONENT RULES (@tottemai/ui)

```tsx
// ✅ Correct imports
import { Button, Card, Section, Container } from "@tottemai/ui"
import { Navbar, MobileNav, Footer } from "@tottemai/ui"
import { HeroSection, FeatureGrid, TestimonialCard } from "@tottemai/ui"
import { ContactForm, WhatsAppButton, GoogleMapsEmbed, BusinessHours } from "@tottemai/ui"
import { ImageGallery, VideoPlayer, SocialLinks } from "@tottemai/ui"
import { FAQAccordion, PricingCard, CTABanner, ReviewStars } from "@tottemai/ui"
import { TextReveal, ScrollReveal, MagneticButton, Parallax } from "@tottemai/ui"
import { Spinner, Skeleton, Toast, Modal } from "@tottemai/ui"
import { useBreakpoint, useScrollPosition } from "@tottemai/ui"

// ✅ Accessibility (mandatory)
import { A11yProvider, SkipLink, AccessibilityWidget } from "@tottemai/ui"
import "@tottemai/ui/a11y.css"   // in globals.css

// ❌ Never do this
import { Button } from "shadcn/ui"
import { Box } from "@mui/material"
```

---

## ACCESSIBILITY — חובה חוקית (תקן ישראלי 5568)

```tsx
// app/[locale]/layout.tsx — exact structure
export default function RootLayout({ children, params: { locale } }) {
  return (
    <html lang={locale} dir={locale === "he" ? "rtl" : "ltr"}>
      <body>
        <A11yProvider />                     {/* ← ראשון */}
        <SkipLink locale={locale as "he"|"en"} />
        <Navbar />
        <main id="main-content">
          {children}
        </main>
        <Footer />
        <AccessibilityWidget
          locale={locale as "he"|"en"}
          businessName="{business_name}"
          phone="{phone}"
          email="{email}"
          statementUrl={`/${locale}/accessibility-statement`}
        />                                   {/* ← אחרון */}
      </body>
    </html>
  )
}
```

**ARIA checklist:**
- [ ] aria-label on Navbar, every icon-only button, form fields
- [ ] focus:ring-2 focus:ring-[var(--color-primary)] on all interactive elements
- [ ] alt text in Hebrew on all images
- [ ] role="dialog" + aria-modal on all Modals
- [ ] Skip link tested with Tab key

---

## SEO — מובנה בכל דף

```tsx
// Every page.tsx must export metadata
export const metadata: Metadata = {
  title: "{business_name} | {business_type} ב{city}",
  description: "{description}",
  openGraph: {
    title: "{business_name}",
    description: "{description}",
    type: "website",
    locale: "he_IL",
    alternateLocale: "en_US",
  },
  alternates: {
    canonical: `https://\${process.env.NEXT_PUBLIC_DOMAIN}/he`,
    languages: { "he": `/he`, "en": `/en` },
  },
}
```

**SEO checklist:**
- [ ] LocalBusinessSchema JSON-LD on home page (address, phone, hours, priceRange)
- [ ] BreadcrumbSchema on all non-home pages
- [ ] next/image with priority on hero (above fold)
- [ ] All images: alt in Hebrew, width + height set
- [ ] app/sitemap.ts — all pages, both locales
- [ ] app/robots.ts — allow all
- [ ] Canonical on every page

---

## SECURITY — נדחף אוטומטית

```ts
// next.config.mjs — security headers
const securityHeaders = [
  { key: "X-Frame-Options",           value: "DENY" },
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
]
```

```ts
// middleware.ts — rate limiting on /api routes
// Contact form: 3 req/min | Booking: 5 req/min | General: 60 req/min
```

```ts
// Every POST route: Zod validation
const schema = z.object({ name: z.string().min(2).max(50), ... })
const result = schema.safeParse(await request.json())
if (!result.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })
```

---

## RTL / HEBREW RULES

```tsx
// ✅ Correct
<html lang={locale} dir={locale === "he" ? "rtl" : "ltr"}>
className="font-heebo text-start pe-4 ms-auto"   // logical properties

// ❌ Never
className="text-left pl-4 mr-auto"               // directional properties
```

**Font usage:**
```tsx
// next/font setup in layout.tsx
import { Heebo, Inter } from "next/font/google"
const heebo = Heebo({ subsets: ["hebrew", "latin"], variable: "--font-heebo" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
```

**WhatsApp button:**
```tsx
<WhatsAppButton phone="{whatsapp}" />
// renders: href="https://wa.me/{whatsapp}?text=שלום, אשמח לקבל מידע"
```

---

## FILE BUILD ORDER (follow exactly, no skipping)

```
Step 1:  globals.css                                   ← CSS variables + fonts + a11y import
Step 2:  app/[locale]/layout.tsx                       ← A11yProvider + SkipLink + Providers
Step 3:  next.config.mjs                               ← security headers + transpile
Step 4:  middleware.ts                                 ← rate limiting
Step 5:  lib/env.ts                                    ← Zod env validation
Step 6:  components/Navbar.tsx                         ← sticky, mobile-responsive
Step 7:  app/[locale]/page.tsx                         ← home: hero + services + stats + cta
Step 8:  app/[locale]/about/page.tsx                   ← team + story + values
Step 9:  app/[locale]/services/page.tsx                ← service cards + pricing
Step 10: app/[locale]/gallery/page.tsx                 ← masonry grid (ImageGallery)
Step 11: app/[locale]/contact/page.tsx                 ← ContactForm + map + hours
Step 12: app/[locale]/accessibility-statement/page.tsx ← חובה חוקית
Step 13: app/sitemap.ts                                ← all pages, both locales
Step 14: app/robots.ts
Step 15: components/Footer.tsx
Step 16: messages/he.json + messages/en.json          ← all i18n strings
```

---

## WOW FACTOR CHECKLIST (target 8+/10)

- [ ] Hero: full-viewport, CharReveal on main headline, Parallax on background
- [ ] At least ONE section with horizontal sticky scroll or scroll-driven animation
- [ ] Stats counter section: CountUp with large numbers, bold typography
- [ ] Marquee strip: services or client logos or testimonials quotes
- [ ] Cards hover state: subtle lift + shadow transition (100ms ease)
- [ ] MagneticButton on every primary CTA
- [ ] Custom scrollbar (optional but impressive for desktop)
- [ ] PageTransition between routes
- [ ] Gradient mesh or noise texture in hero background (CSS only, no images)
- [ ] Mobile: bottom sheet navigation, touch-friendly tap targets ≥ 44px

---

## QUALITY GATES (scored after build)

Your output will be scored 1-10 on these dimensions:

| Dimension | Weight | Criteria |
|-----------|--------|----------|
| Animation richness | 25% | ≥5 techniques, distributed across all sections |
| Design ambition | 25% | Not a basic template — unique layout, bold typography |
| Hebrew/RTL quality | 20% | Proper dir, fonts, logical properties, cultural fit |
| Component coverage | 15% | ≥80% of UI from @tottemai/ui |
| Pages & content | 10% | ≥5 pages, real business content, no Lorem Ipsum |
| Technical quality | 5% | TypeScript strict, no console.errors, builds clean |

**Score < 8 → system will retry with a fix prompt. Build it right the first time.**
```

---

## Placeholder Reference

| Placeholder | מקור | דוגמה |
|-------------|------|-------|
| `{business_name}` | `SiteData.business_name` | "ספא לוטוס" |
| `{business_type}` | `SiteData.business_type` | "ספא" |
| `{city}` | `SiteData.city` | "תל אביב" |
| `{description}` | `SiteData.description` | "ספא יוקרתי..." |
| `{primary_color}` | `SiteData.primary_color` | "#c084fc" |
| `{phone}` | `SiteData.phone` | "0521234567" |
| `{whatsapp}` | `SiteData.whatsapp` | "972521234567" |
| `{email}` | `SiteData.email` | "info@spa.co.il" |
| `{address}` | `SiteData.address` | "רחוב הרצל 5" |
| `{services_list}` | `SiteData.services` | "  - עיסוי שוודי\n  - פנים..." |
| `{team_list}` | `SiteData.team` | "  - מיכל — מטפלת..." |
| `{hours}` | `SiteData.opening_hours` | "  א-ה: 09:00-19:00" |
| `{social}` | `SiteData.social_links` | "  instagram: https://..." |
| `{pages_list}` | `ArchitectureDecision.pages` | "- /\n- /about\n- /services..." |
| `{inspiration_summary}` | `InspirationReport.summary` | "Sites analyzed use..." |
| `{top_fonts}` | `InspirationReport.top_fonts` | "Playfair Display, DM Sans" |
| `{animation_stack}` | `InspirationReport.animation_stack` | "GSAP, Framer Motion, Lenis" |
| `{competitor_insights}` | `research_competitors()` | "מתחרים באזור משתמשים ב..." |

← [[site_generator]] | [[00 - Services Overview]]
