# Spotlight

> **קטגוריה:** special
> **השראה:** Aceternity UI
> **תלויות:** framer-motion (motion/react)
> **Storybook:** src/stories/special/Spotlight.stories.tsx
> **קוד:** src/special/Spotlight.tsx
> **עלות בנייה:** ~25 דקות

## מה זה
Cursor-following spotlight על רקע כהה. `radial-gradient` שעוקב אחרי ה-mouse. יוצר תחושה ש"פנס" מוחזק מעל הדף. אפקט דרמטי בhero sections.

## אפקט — איך זה עובד
`onMouseMove` מעדכן `x, y`. CSS `radial-gradient(circle at ${x}px ${y}px, rgba(color, 0.15), transparent 40%)` על ה-container. Framer Motion `useMotionValue` + `useSpring` לsmoothness.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| fill | `string` | `"var(--color-primary)"` | צבע ה-spotlight |
| size | `number` | `300` | px radius |
| opacity | `number` | `0.15` | — |
| className | `string` | — | applied to container |
| children | `ReactNode` | — | — |

## שימוש
```tsx
import { Spotlight } from "@tottemai/ui"

<section className="relative min-h-screen bg-neutral-950 overflow-hidden">
  <Spotlight fill="var(--color-primary)" size={400}>
    <div className="relative z-10">
      <h1>Hero Title</h1>
    </div>
  </Spotlight>
</section>
```

## קוד מלא
```tsx
"use client"
// src/special/Spotlight.tsx
import * as React from "react"
import { useMotionValue, useSpring, motion } from "motion/react"
import { cn } from "../cn"

interface SpotlightProps {
  fill?: string
  size?: number
  opacity?: number
  className?: string
  children?: React.ReactNode
}

export function Spotlight({ fill = "var(--color-primary)", size = 300, opacity = 0.15, className, children }: SpotlightProps) {
  const mouseX = useMotionValue(-size)
  const mouseY = useMotionValue(-size)
  const springX = useSpring(mouseX, { stiffness: 120, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 120, damping: 20 })

  const prefersReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced) return
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }

  return (
    <div className={cn("spotlight-container", className)} onMouseMove={handleMouseMove}>
      <motion.div
        className="spotlight-light"
        style={{
          background: `radial-gradient(${size}px circle at ${springX.get()}px ${springY.get()}px, ${fill} 0%, transparent 65%)`,
          opacity: prefersReduced ? 0 : opacity,
          // Re-render on spring change
          x: springX,
          y: 0,
        }}
      />
      {children}
      <style>{`
        .spotlight-container { position: relative; }
        .spotlight-light { position: absolute; inset: 0; pointer-events: none; z-index: 1; transition: opacity 0.3s; }
        .spotlight-container > *:not(.spotlight-light) { position: relative; z-index: 2; }
      `}</style>
    </div>
  )
}
```

## בדיקות סיום
- [ ] Spotlight עוקב אחרי mouse
- [ ] Spring smoothness
- [ ] prefers-reduced-motion: ללא effect
- [ ] CSS variables בלבד
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
