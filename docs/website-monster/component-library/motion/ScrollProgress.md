# ScrollProgress

> **קטגוריה:** motion
> **תלויות:** framer-motion (motion/react)
> **Storybook:** src/stories/motion/ScrollProgress.stories.tsx
> **קוד:** src/motion/ScrollProgress.tsx
> **עלות בנייה:** ~15 דקות

## מה זה
פס התקדמות scroll בראש הדף. מתמלא ככל שגוללים למטה. `useScroll` + `useSpring` של Framer Motion → `scaleX` על div קבוע.

## אנימציה — איך זה עובד
`useScroll()` מחזיר `scrollYProgress` (0 עד 1). `useSpring` מוסיף smooth lag. `scaleX` על `transformOrigin: "left"` (או right ב-RTL).

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| height | `number` | `3` | px |
| color | `string` | `"var(--color-primary)"` | — |
| zIndex | `number` | `100` | — |
| position | `'top' \| 'bottom'` | `'top'` | — |
| springConfig | `object` | `{stiffness:100,damping:30}` | — |

## שימוש
```tsx
import { ScrollProgress } from "@tottemai/ui"

// בתוך layout.tsx:
<ScrollProgress />
<Navbar />
{children}
```

## קוד מלא
```tsx
"use client"
// src/motion/ScrollProgress.tsx
import { useScroll, useSpring, motion } from "motion/react"
import { isRtl } from "../utils/rtl"

interface ScrollProgressProps {
  height?: number
  color?: string
  zIndex?: number
  position?: "top" | "bottom"
  springConfig?: { stiffness?: number; damping?: number; restDelta?: number }
}

export function ScrollProgress({
  height = 3,
  color = "var(--color-primary)",
  zIndex = 100,
  position = "top",
  springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 },
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, springConfig)
  const rtl = typeof window !== "undefined" && isRtl()

  return (
    <motion.div
      style={{
        scaleX,
        position: "fixed",
        [position]: 0,
        left: 0,
        right: 0,
        height,
        background: color,
        zIndex,
        transformOrigin: rtl ? "right" : "left",
      }}
    />
  )
}

// utils/rtl.ts helper:
// export const isRtl = () => document.documentElement.dir === "rtl"
```

## בדיקות סיום
- [ ] Bar גדל בscroll
- [ ] Spring animation נכון
- [ ] RTL transformOrigin
- [ ] prefers-reduced-motion
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
