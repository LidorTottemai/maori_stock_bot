# CountUp

> **קטגוריה:** motion
> **תלויות:** framer-motion (motion/react)
> **Storybook:** src/stories/motion/CountUp.stories.tsx
> **קוד:** src/motion/CountUp.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
מספרים שעולים ב-animation. `useMotionValue` + `animate()` של Framer Motion. Triggered ב-`useInView`. שימושי ל-"stats" sections: 1,234 לקוחות / 98% שביעות רצון.

## אנימציה — איך זה עובד
`useMotionValue(from)` → `animate(motionValue, to, { duration, ease })`. `useTransform` עם formatter function. `useInView` trigger — מתחיל רק כשנגלה ב-viewport.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| from | `number` | `0` | — |
| to | `number` | — | — |
| duration | `number` | `2` | seconds |
| prefix | `string` | — | לפני המספר |
| suffix | `string` | — | אחרי המספר |
| decimals | `number` | `0` | ספרות אחרי נקודה |
| separator | `string` | `","` | thousands separator |
| className | `string` | — | — |

## שימוש
```tsx
import { CountUp } from "@tottemai/ui"

<div className="stats-grid">
  <CountUp to={1234} suffix="+" prefix="" duration={2} />
  <CountUp to={98} suffix="%" duration={1.5} />
  <CountUp to={4.9} decimals={1} suffix="★" duration={1.8} />
</div>
```

## קוד מלא
```tsx
"use client"
// src/motion/CountUp.tsx
import * as React from "react"
import { useMotionValue, useTransform, animate, useInView } from "motion/react"
import { cn } from "../cn"

interface CountUpProps {
  from?: number
  to: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
  separator?: string
  className?: string
}

export function CountUp({ from = 0, to, duration = 2, prefix = "", suffix = "", decimals = 0, separator = ",", className }: CountUpProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(from)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const [displayed, setDisplayed] = React.useState(formatNumber(from, decimals, separator))

  React.useEffect(() => {
    if (!isInView) return
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) { setDisplayed(formatNumber(to, decimals, separator)); return }

    const controls = animate(motionValue, to, {
      duration,
      ease: [0.25, 0.46, 0.45, 0.94],
      onUpdate: (v) => setDisplayed(formatNumber(v, decimals, separator)),
    })
    return () => controls.stop()
  }, [isInView, to, from, duration, decimals, separator, motionValue])

  return (
    <span ref={ref} className={cn("count-up", className)}>
      {prefix}{displayed}{suffix}
    </span>
  )
}

function formatNumber(n: number, decimals: number, separator: string): string {
  const fixed = n.toFixed(decimals)
  const [int, dec] = fixed.split(".")
  const formatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
  return dec !== undefined ? `${formatted}.${dec}` : formatted
}
```

## בדיקות סיום
- [ ] עולה ל-to value
- [ ] Trigger בכניסה לviewport
- [ ] Separator עובד (1,234)
- [ ] prefers-reduced-motion: מציג מיד את הסוף
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
