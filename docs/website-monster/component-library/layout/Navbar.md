# Navbar

> **קטגוריה:** layout
> **תלויות:** framer-motion (motion/react)
> **Storybook:** src/stories/layout/Navbar.stories.tsx
> **קוד:** src/layout/Navbar.tsx
> **עלות בנייה:** ~40 דקות

## מה זה
Navigation bar עבור אתרים. Sticky, backdrop blur, scroll-aware (transparent at top → solid on scroll). כולל logo, links, CTA button, mobile hamburger. RTL תמיכה מלאה.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | שקוף בראש → solid בscroll |
| Dark | dark background |
| Minimal | רק logo + CTA |
| Centered | links במרכז |
| Mobile | hamburger + drawer |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| logo | `ReactNode` | — | logo element |
| links | `{ label: string; href: string }[]` | — | ניווט |
| cta | `{ label: string; href: string }` | — | כפתור CTA |
| transparent | `boolean` | true | שקוף ב-top |
| className | `string` | — | — |

## שימוש בסיסי
```tsx
import { Navbar } from "@tottemai/ui"

<Navbar
  logo={<span className="text-xl font-bold">MyBrand</span>}
  links={[
    { label: "שירותים", href: "/services" },
    { label: "אודות", href: "/about" },
    { label: "צור קשר", href: "/contact" },
  ]}
  cta={{ label: "קבע תור", href: "/booking" }}
/>
```

## קוד מלא
```tsx
"use client"
// src/layout/Navbar.tsx
import * as React from "react"
import { motion, useScroll, useMotionValueEvent } from "motion/react"
import { cn } from "../cn"

interface NavbarProps {
  logo?: React.ReactNode
  links?: { label: string; href: string }[]
  cta?: { label: string; href: string }
  transparent?: boolean
  className?: string
}

function Navbar({ logo, links = [], cta, transparent = true, className }: NavbarProps) {
  const [scrolled, setScrolled] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 20))

  return (
    <>
      <motion.header
        className={cn(
          "navbar",
          scrolled || !transparent ? "navbar--solid" : "navbar--transparent",
          className,
        )}
        initial={false}
        animate={{ backdropFilter: scrolled || !transparent ? "blur(12px)" : "blur(0px)" }}
      >
        <div className="navbar-inner">
          <div className="navbar-logo">{logo}</div>

          <nav className="navbar-links" aria-label="ניווט ראשי">
            {links.map((link) => (
              <a key={link.href} href={link.href} className="navbar-link">{link.label}</a>
            ))}
          </nav>

          <div className="navbar-actions">
            {cta && (
              <a href={cta.href} className="navbar-cta">{cta.label}</a>
            )}
            <button
              className="navbar-hamburger"
              aria-label="תפריט"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
            >
              <span className={cn("hamburger-line", mobileOpen && "hamburger-line--open-top")} />
              <span className={cn("hamburger-line", mobileOpen && "hamburger-line--open-mid")} />
              <span className={cn("hamburger-line", mobileOpen && "hamburger-line--open-bot")} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <motion.div
        className="navbar-mobile-drawer"
        initial={false}
        animate={{ opacity: mobileOpen ? 1 : 0, y: mobileOpen ? 0 : -16, pointerEvents: mobileOpen ? "auto" : "none" }}
        transition={{ duration: 0.2 }}
      >
        {links.map((link) => (
          <a key={link.href} href={link.href} className="navbar-mobile-link" onClick={() => setMobileOpen(false)}>
            {link.label}
          </a>
        ))}
        {cta && <a href={cta.href} className="navbar-cta navbar-cta--mobile">{cta.label}</a>}
      </motion.div>

      <style>{`
        .navbar {
          position: fixed; top: 0; inset-inline: 0; z-index: 80;
          border-bottom: 1px solid transparent;
          transition: background 0.3s, border-color 0.3s;
        }
        .navbar--transparent { background: transparent; }
        .navbar--solid { background: color-mix(in srgb, var(--color-bg) 85%, transparent); border-bottom-color: var(--color-border); }
        .navbar-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; height: 64px; display: flex; align-items: center; gap: 32px; }
        .navbar-logo { flex-shrink: 0; }
        .navbar-links { display: flex; align-items: center; gap: 4px; flex: 1; }
        @media (max-width: 767px) { .navbar-links { display: none; } }
        .navbar-link { padding: 8px 14px; border-radius: var(--radius-md, 8px); font-size: 0.875rem; color: var(--color-text-muted); text-decoration: none; transition: color 0.15s, background 0.15s; }
        .navbar-link:hover { color: var(--color-text); background: color-mix(in srgb, var(--color-text) 8%, transparent); }
        .navbar-actions { display: flex; align-items: center; gap: 12px; margin-inline-start: auto; }
        .navbar-cta { padding: 8px 20px; background: var(--color-primary); color: white; border-radius: var(--radius-md, 8px); font-size: 0.875rem; font-weight: 500; text-decoration: none; transition: opacity 0.15s; white-space: nowrap; }
        .navbar-cta:hover { opacity: 0.9; }
        .navbar-hamburger { display: none; flex-direction: column; gap: 5px; padding: 6px; background: transparent; border: none; cursor: pointer; }
        @media (max-width: 767px) { .navbar-hamburger { display: flex; } }
        .hamburger-line { width: 22px; height: 2px; background: var(--color-text); border-radius: 2px; transition: transform 0.2s, opacity 0.2s; }
        .hamburger-line--open-top { transform: translateY(7px) rotate(45deg); }
        .hamburger-line--open-mid { opacity: 0; }
        .hamburger-line--open-bot { transform: translateY(-7px) rotate(-45deg); }
        .navbar-mobile-drawer {
          position: fixed; top: 64px; inset-inline: 0; z-index: 79;
          background: var(--color-bg); border-bottom: 1px solid var(--color-border);
          padding: 16px 24px; display: flex; flex-direction: column; gap: 4px;
        }
        @media (min-width: 768px) { .navbar-mobile-drawer { display: none; } }
        .navbar-mobile-link { padding: 12px 16px; font-size: 1rem; color: var(--color-text); text-decoration: none; border-radius: var(--radius-md, 8px); transition: background 0.1s; }
        .navbar-mobile-link:hover { background: var(--color-surface-2); }
        .navbar-cta--mobile { margin-top: 8px; text-align: center; }
      `}</style>
    </>
  )
}

export { Navbar }
```

## בדיקות סיום
- [ ] Scroll → solid background
- [ ] Mobile hamburger + drawer פועלים
- [ ] CSS variables בלבד
- [ ] RTL תמיכה (inset-inline)
- [ ] prefers-reduced-motion
- [ ] מיוצא ב-src/index.ts
- [ ] Story ב-Storybook

← [[00 - Library Overview & Build Plan]]
