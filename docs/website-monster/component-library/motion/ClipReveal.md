# ClipReveal

> **קטגוריה:** motion
> **תלויות:** framer-motion
> **Storybook:** src/stories/motion/ClipReveal.stories.tsx
> **קוד:** src/motion/ClipReveal.tsx
> **עלות בנייה:** ~30 דקות

## מה זה
חשיפת תוכן דרך `clip-path` — "וילון" שמתגלגל מלמטה. התוכן (תמונה, טקסט, כרטיס) נחשף כאילו מישהו מרים וילון. טכניקה קלאסית מעולם העיצוב הגרפי שמועברת לweb. מתאים לתמונות hero, כרטיסים ועיצובים עם visual weight חזק.

## אנימציה — איך זה עובד
```
initial:  clip-path: inset(0 0 100% 0)  ← כל התוכן מוסתר (bottom=100%)
animate:  clip-path: inset(0 0 0% 0)    ← תוכן מוצג מלא
```
- `inset(top right bottom left)` — bottom מתחיל ב-100% וקורס ל-0%
- משך: 0.8s
- ease: `[0.76, 0, 0.24, 1]` — ease-in-out חד שנותן תחושת "snap"
- `useInView` עם `once:true` + `margin:"-80px"`

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | חשיפה מלמטה, 0.8s |
| FromTop | clip-path מלמעלה: inset(100% 0 0 0)→inset(0) |
| FromLeft | clip-path משמאל: inset(0 100% 0 0)→inset(0) |
| WithImage | עוטף תמונה — הaffect קלאסי |
| Staggered | שני אלמנטים עם delay ביניהם |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | — | תוכן לחשוף (required) |
| direction | "bottom" \| "top" \| "left" \| "right" | "bottom" | כיוון החשיפה |
| duration | number | 0.8 | משך האנימציה (שניות) |
| delay | number | 0 | עיכוב לפני האנימציה (שניות) |
| ease | number[] | [0.76,0,0.24,1] | cubic-bezier curve |
| className | string | "" | CSS class על ה-wrapper |
| margin | string | "-80px" | viewport intersection margin |

## שימוש
```tsx
import { ClipReveal } from "@tottemai/ui"

{/* תמונה עם אפקט וילון */}
<ClipReveal direction="bottom" delay={0.2}>
  <img src="/hero.jpg" alt="Hero" className="w-full h-[600px] object-cover" />
</ClipReveal>

{/* כרטיס */}
<ClipReveal delay={0.4} duration={1}>
  <div className="p-8 bg-[var(--color-surface)]">
    <h3>Card Title</h3>
  </div>
</ClipReveal>
```

## קוד מלא
```tsx
"use client"
// src/motion/ClipReveal.tsx
import { motion, useInView } from "motion/react"
import { useRef, ReactNode } from "react"

type ClipDirection = "bottom" | "top" | "left" | "right"

interface ClipRevealProps {
  children: ReactNode
  direction?: ClipDirection
  duration?: number
  delay?: number
  ease?: [number, number, number, number]
  className?: string
  margin?: string
}

function getClipPath(direction: ClipDirection, hidden: boolean): string {
  if (!hidden) return "inset(0 0 0% 0)"
  switch (direction) {
    case "bottom":
      return "inset(0 0 100% 0)"
    case "top":
      return "inset(100% 0 0 0)"
    case "left":
      return "inset(0 100% 0 0)"
    case "right":
      return "inset(0 0 0 100%)"
  }
}

export function ClipReveal({
  children,
  direction = "bottom",
  duration = 0.8,
  delay = 0,
  ease = [0.76, 0, 0.24, 1],
  className = "",
  margin = "-80px",
}: ClipRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: margin as any })

  const prefersReduced =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false

  return (
    <div ref={ref} className={className} style={{ overflow: "hidden" }}>
      <motion.div
        initial={{ clipPath: getClipPath(direction, true) }}
        animate={{
          clipPath: isInView
            ? getClipPath(direction, false)
            : getClipPath(direction, true),
        }}
        transition={
          prefersReduced
            ? { duration: 0 }
            : { duration, delay, ease }
        }
      >
        {children}
      </motion.div>
    </div>
  )
}
```

## בדיקות סיום
- [ ] אנימציה פועלת בdevelopment
- [ ] prefers-reduced-motion מבטל אנימציות
- [ ] אין JS errors בconsole
- [ ] CSS variables בלבד (אין hexcodes קשיחים)
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
