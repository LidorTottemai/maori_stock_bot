# MobileMenu

> **קטגוריה:** layout
> **תלויות:** framer-motion (motion/react)
> **Storybook:** src/stories/layout/MobileMenu.stories.tsx
> **קוד:** src/layout/MobileMenu.tsx
> **עלות בנייה:** ~25 דקות

## מה זה
Full-screen slide-in mobile navigation drawer. Animated overlay + menu sliding from side. נסגר בלחיצה על overlay, Escape, ושינוי route. שימושי כ-standalone מ-Navbar.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| From right | slide מימין (RTL default) |
| From left | slide משמאל |
| Full screen | overlay מלא |
| With sub-items | accordion links |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| open | `boolean` | — | — |
| onClose | `() => void` | — | — |
| links | `{ label: string; href: string }[]` | — | — |
| cta | `{ label: string; href: string }` | — | — |
| logo | `ReactNode` | — | — |
| from | `'left' \| 'right'` | `'right'` | כיוון slide |

## שימוש בסיסי
```tsx
import { MobileMenu } from "@tottemai/ui"

<MobileMenu
  open={menuOpen}
  onClose={() => setMenuOpen(false)}
  links={navLinks}
  cta={{ label: "קבע תור", href: "/booking" }}
/>
```

## קוד מלא
```tsx
"use client"
// src/layout/MobileMenu.tsx
import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "../cn"

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  links?: { label: string; href: string }[]
  cta?: { label: string; href: string }
  logo?: React.ReactNode
  from?: "left" | "right"
}

function MobileMenu({ open, onClose, links = [], cta, logo, from = "right" }: MobileMenuProps) {
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [onClose])

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  const xStart = from === "right" ? "100%" : "-100%"

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="mmenu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.nav
            className={cn("mmenu-panel", from === "right" ? "mmenu-panel--right" : "mmenu-panel--left")}
            initial={{ x: xStart }}
            animate={{ x: 0 }}
            exit={{ x: xStart }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            aria-label="Mobile navigation"
          >
            <div className="mmenu-header">
              {logo && <div className="mmenu-logo">{logo}</div>}
              <button className="mmenu-close" aria-label="סגור תפריט" onClick={onClose}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <ul className="mmenu-links">
              {links.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 + 0.1 }}
                >
                  <a href={link.href} className="mmenu-link" onClick={onClose}>{link.label}</a>
                </motion.li>
              ))}
            </ul>
            {cta && (
              <div className="mmenu-cta-wrapper">
                <a href={cta.href} className="mmenu-cta" onClick={onClose}>{cta.label}</a>
              </div>
            )}
          </motion.nav>
        </>
      )}
      <style>{`
        .mmenu-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 90; }
        .mmenu-panel {
          position: fixed; top: 0; bottom: 0; width: min(320px, 85vw); z-index: 91;
          background: var(--color-bg); padding: 0; display: flex; flex-direction: column;
          box-shadow: 0 0 40px rgba(0,0,0,0.3);
        }
        .mmenu-panel--right { right: 0; }
        .mmenu-panel--left { left: 0; }
        .mmenu-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--color-border); }
        .mmenu-close { background: transparent; border: none; cursor: pointer; color: var(--color-text); padding: 4px; border-radius: var(--radius-sm, 4px); }
        .mmenu-close:hover { background: var(--color-surface-2); }
        .mmenu-links { list-style: none; padding: 20px 16px; margin: 0; flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .mmenu-link { display: block; padding: 14px 16px; font-size: 1.0625rem; color: var(--color-text); text-decoration: none; border-radius: var(--radius-md, 8px); transition: background 0.1s; }
        .mmenu-link:hover { background: var(--color-surface-2); }
        .mmenu-cta-wrapper { padding: 0 24px 32px; }
        .mmenu-cta { display: block; text-align: center; padding: 14px; background: var(--color-primary); color: white; border-radius: var(--radius-md, 8px); font-size: 1rem; font-weight: 600; text-decoration: none; transition: opacity 0.15s; }
        .mmenu-cta:hover { opacity: 0.9; }
      `}</style>
    </AnimatePresence>
  )
}

export { MobileMenu }
```

## בדיקות סיום
- [ ] Slide animation פועל
- [ ] Overlay סוגר
- [ ] Escape סוגר
- [ ] Body scroll lock
- [ ] CSS variables בלבד
- [ ] RTL תמיכה
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
