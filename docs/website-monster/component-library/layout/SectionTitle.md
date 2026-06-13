# SectionTitle

> **קטגוריה:** layout
> **תלויות:** framer-motion (motion/react)
> **Storybook:** src/stories/layout/SectionTitle.stories.tsx
> **קוד:** src/layout/SectionTitle.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
כותרת סקציה סטנדרטית: badge (אופציונלי) + heading + subtext. כולל reveal animation בscroll. מרכזי/שמאל. שימוש חוזר בכל סקציה בדף.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Centered | כותרת במרכז |
| Left aligned | כותרת שמאל (RTL: ימין) |
| With badge | chip מעל הכותרת |
| With subtext | תיאור מתחת |
| Animated | reveal בscroll |
| Large | hero-size heading |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| badge | `string` | — | text ב-chip מעל |
| title | `string` | — | הכותרת הראשית |
| subtitle | `string` | — | תיאור מתחת |
| align | `'center' \| 'start'` | `'center'` | — |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | — |
| animate | `boolean` | true | scroll reveal |
| className | `string` | — | — |

## שימוש בסיסי
```tsx
import { SectionTitle } from "@tottemai/ui"

<SectionTitle
  badge="השירותים שלנו"
  title="מה אנחנו מציעים"
  subtitle="מגוון טיפולים מקצועיים לגוף ולנפש"
/>
```

## קוד מלא
```tsx
"use client"
// src/layout/SectionTitle.tsx
import * as React from "react"
import { motion } from "motion/react"
import { cn } from "../cn"

interface SectionTitleProps {
  badge?: string
  title: string
  subtitle?: string
  align?: "center" | "start"
  size?: "sm" | "md" | "lg"
  animate?: boolean
  className?: string
}

const sizeStyles = {
  sm: { title: "section-title-sm", subtitle: "section-subtitle-sm" },
  md: { title: "section-title-md", subtitle: "section-subtitle-md" },
  lg: { title: "section-title-lg", subtitle: "section-subtitle-lg" },
}

function SectionTitle({ badge, title, subtitle, align = "center", size = "md", animate = true, className }: SectionTitleProps) {
  const s = sizeStyles[size]
  const Wrapper = animate ? motion.div : "div"
  const wrapperProps = animate
    ? { initial: { opacity: 0, y: 32 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-60px" }, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } }
    : {}

  return (
    <Wrapper
      className={cn("section-title-wrapper", `section-title-wrapper--${align}`, className)}
      {...(wrapperProps as Record<string, unknown>)}
    >
      {badge && <span className="section-badge">{badge}</span>}
      <h2 className={cn("section-title", s.title)}>{title}</h2>
      {subtitle && <p className={cn("section-subtitle", s.subtitle)}>{subtitle}</p>}

      <style>{`
        .section-title-wrapper { display: flex; flex-direction: column; gap: 12px; }
        .section-title-wrapper--center { align-items: center; text-align: center; }
        .section-title-wrapper--start { align-items: flex-start; }
        .section-badge {
          display: inline-flex; padding: 4px 14px;
          background: color-mix(in srgb, var(--color-primary) 12%, transparent);
          color: var(--color-primary); border-radius: 9999px;
          font-size: 0.8125rem; font-weight: 600; letter-spacing: 0.04em;
        }
        .section-title { color: var(--color-text); font-weight: 700; margin: 0; }
        .section-title-sm { font-size: clamp(1.25rem, 3vw, 1.75rem); letter-spacing: -0.02em; }
        .section-title-md { font-size: clamp(1.75rem, 4vw, 2.75rem); letter-spacing: -0.03em; line-height: 1.15; }
        .section-title-lg { font-size: clamp(2.25rem, 6vw, 4rem); letter-spacing: -0.04em; line-height: 1.1; }
        .section-subtitle { color: var(--color-text-muted); max-width: 560px; margin: 0; }
        .section-subtitle-sm { font-size: 0.875rem; line-height: 1.6; }
        .section-subtitle-md { font-size: 1rem; line-height: 1.7; }
        .section-subtitle-lg { font-size: 1.125rem; line-height: 1.7; }
        .section-title-wrapper--center .section-subtitle { align-self: center; text-align: center; }
      `}</style>
    </Wrapper>
  )
}

export { SectionTitle }
```

## בדיקות סיום
- [ ] Badge / title / subtitle מוצגים
- [ ] Scroll reveal animate
- [ ] Center + Start alignment
- [ ] CSS variables בלבד
- [ ] RTL תמיכה
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
