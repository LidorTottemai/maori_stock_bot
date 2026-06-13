# BentoGrid

> **קטגוריה:** special
> **השראה:** Magic UI / Aceternity UI
> **תלויות:** framer-motion
> **Storybook:** src/stories/special/BentoGrid.stories.tsx
> **קוד:** src/special/BentoGrid.tsx
> **עלות בנייה:** ~45 דקות

## מה זה
BentoGrid הוא קומפוננט לתצוגת כרטיסיות בפריסת גריד בסגנון "bento box" — פריסה שהפכה פופולרית באתרי מוצר מודרניים (Apple, Linear, Vercel). כל כרטיסייה (BentoCard) יכולה להכיל רקע מונפש, אייקון, כותרת ותיאור שמחליק למעלה בעת hover. הגריד גמיש ומאפשר כרטיסיות ברוחב שונה (col-span).

## אפקט — איך זה עובד
BentoGrid עצמו הוא wrapper של CSS Grid עם `grid-template-columns: repeat(N, 1fr)`. כל BentoCard מכיל שכבת רקע (background prop) עם position:absolute שממלאת את כל הכרטיסייה, ועל גביה האייקון והטקסט. בעת hover, Framer Motion מפעיל אנימציה על ה-description div: הוא עובר מ-`translateY(100%)` ל-`translateY(0)` תוך 300ms עם easing חלק. השם (name) תמיד מוצג, בעוד התיאור נחשף רק בעת hover. קישור (href) הופך את כל הכרטיסייה לניתנת ללחיצה.

## Props API

### BentoGrid
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| cols | number | 3 | מספר העמודות בגריד |
| gap | number | 4 | מרווח בין הכרטיסיות (מוכפל ב-4px) |
| className | string | — | CSS class נוסף לעטיפה |
| children | ReactNode | — | כרטיסיות BentoCard |

### BentoCard
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| name | string | **חובה** | כותרת הכרטיסייה |
| description | string | **חובה** | תיאור שנחשף ב-hover |
| icon | ReactNode | — | אייקון בפינה העליונה |
| background | ReactNode | — | תוכן רקע אבסולוטי |
| className | string | — | CSS class נוסף (לשינוי col-span וכד') |
| href | string | — | קישור יעד לכרטיסייה |

## שימוש
```tsx
import { BentoGrid, BentoCard } from "@tottemai/ui"

export default function Demo() {
  return (
    <BentoGrid cols={3} gap={4}>
      <BentoCard
        name="ניתוח שוק בזמן אמת"
        description="קבל תובנות מבוססות AI על מניות, מגמות ואינדיקטורים טכניים ישירות בדשבורד שלך."
        icon={<ChartIcon className="h-6 w-6" />}
        background={<AnimatedChart />}
        className="col-span-2"
        href="/features/analysis"
      />
      <BentoCard
        name="התראות חכמות"
        description="הגדר התראות מותאמות אישית לכל אירוע בשוק שחשוב לך."
        icon={<BellIcon className="h-6 w-6" />}
        background={<PulseBackground />}
        href="/features/alerts"
      />
      <BentoCard
        name="פורטפוליו"
        description="עקוב אחר כל ההשקעות שלך במקום אחד עם גרפים ודוחות מתקדמים."
        icon={<WalletIcon className="h-6 w-6" />}
        background={<GradientBlob />}
        href="/features/portfolio"
      />
    </BentoGrid>
  )
}
```

## קוד מלא
```tsx
"use client"
// src/special/BentoGrid.tsx

import React, { ReactNode } from "react"
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion"
import { useState } from "react"

// ---------------------------------------------------------------------------
// Utility: cn() — lightweight className merger (no clsx dependency required)
// ---------------------------------------------------------------------------
function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ")
}

// ---------------------------------------------------------------------------
// BentoGrid
// ---------------------------------------------------------------------------
export interface BentoGridProps {
  cols?: number
  gap?: number
  className?: string
  children?: ReactNode
}

export function BentoGrid({
  cols = 3,
  gap = 4,
  className,
  children,
}: BentoGridProps) {
  return (
    <div
      className={cn("bento-grid", className)}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: `${gap * 4}px`,
      }}
    >
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// BentoCard
// ---------------------------------------------------------------------------
export interface BentoCardProps {
  name: string
  description: string
  icon?: ReactNode
  background?: ReactNode
  className?: string
  href?: string
}

export function BentoCard({
  name,
  description,
  icon,
  background,
  className,
  href,
}: BentoCardProps) {
  const [hovered, setHovered] = useState(false)

  const cardContent = (
    <motion.div
      className={cn("bento-card", className)}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "var(--radius-xl, 16px)",
        background: "var(--color-card, #18181b)",
        border: "1px solid var(--color-border, rgba(255,255,255,0.08))",
        padding: "24px",
        cursor: href ? "pointer" : "default",
        minHeight: "200px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{
        borderColor: "var(--color-primary, rgba(255,255,255,0.2))",
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Background layer — fills the card behind everything */}
      {background && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            overflow: "hidden",
            borderRadius: "inherit",
            transition: "opacity 0.3s ease",
            opacity: hovered ? 1 : 0.7,
          }}
        >
          {background}
        </div>
      )}

      {/* Gradient overlay so text stays readable over the background */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
          borderRadius: "inherit",
          pointerEvents: "none",
        }}
      />

      {/* Icon — top-left, always visible */}
      {icon && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            zIndex: 2,
            color: "var(--color-primary, #fff)",
            opacity: hovered ? 0.6 : 1,
            transition: "opacity 0.3s ease",
          }}
        >
          {icon}
        </div>
      )}

      {/* Text content — sits at the bottom */}
      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Name: always visible */}
        <motion.p
          style={{
            margin: 0,
            fontSize: "1.125rem",
            fontWeight: 600,
            color: "var(--color-foreground, #fff)",
            lineHeight: 1.3,
          }}
          animate={{ y: hovered ? -4 : 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {name}
        </motion.p>

        {/* Description: slides up from below on hover */}
        <div style={{ overflow: "hidden", marginTop: "6px" }}>
          <motion.p
            style={{
              margin: 0,
              fontSize: "0.875rem",
              color: "var(--color-muted-foreground, rgba(255,255,255,0.65))",
              lineHeight: 1.5,
            }}
            initial={{ y: "100%", opacity: 0 }}
            animate={
              hovered
                ? { y: "0%", opacity: 1 }
                : { y: "100%", opacity: 0 }
            }
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          >
            {description}
          </motion.p>
        </div>
      </div>
    </motion.div>
  )

  if (href) {
    return (
      <a
        href={href}
        style={{ textDecoration: "none", display: "contents" }}
        aria-label={name}
      >
        {cardContent}
      </a>
    )
  }

  return cardContent
}

// ---------------------------------------------------------------------------
// Default export (named exports above are the primary API)
// ---------------------------------------------------------------------------
export default BentoGrid
```

## בדיקות סיום
- [ ] אפקט נראה ב-Chrome ו-Safari
- [ ] ביצועים: לא גורם ל-layout thrashing
- [ ] prefers-reduced-motion: מבטל אנימציה, מציג content בלבד
- [ ] CSS variables בלבד
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
