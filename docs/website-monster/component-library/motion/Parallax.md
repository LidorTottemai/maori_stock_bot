# Parallax

> **קטגוריה:** motion
> **תלויות:** gsap, @gsap/react
> **Storybook:** src/stories/motion/Parallax.stories.tsx
> **קוד:** src/motion/Parallax.tsx
> **עלות בנייה:** ~25 דקות

## מה זה
אלמנטים שזזים במהירות שונה מה-scroll — יוצרים עומק. GSAP ScrollTrigger עם `scrub`. Props: `speed` שולט עד כמה האלמנט זז ביחס לscroll.

## אנימציה — איך זה עובד
`gsap.to(element, { yPercent: speed * -30, scrollTrigger: { trigger, scrub: 1.5, start: "top bottom", end: "bottom top" } })`. speed < 1 = איטי, speed > 1 = מהיר, speed < 0 = הפוך.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| speed | `number` | `1` | 0.5=slow, 1=normal, 2=fast, -1=reverse |
| direction | `'y' \| 'x'` | `'y'` | — |
| distance | `number` | `30` | yPercent movement |
| children | `ReactNode` | — | — |
| className | `string` | — | — |

## שימוש
```tsx
import { Parallax } from "@tottemai/ui"

// תמונת hero שזזה לאט
<Parallax speed={0.5}>
  <img src="/hero.jpg" className="scale-110" />
</Parallax>

// טקסט שזזה מהר
<Parallax speed={1.5}>
  <h2>Moving Text</h2>
</Parallax>
```

## קוד מלא
```tsx
"use client"
// src/motion/Parallax.tsx
import * as React from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { cn } from "../cn"

gsap.registerPlugin(ScrollTrigger)

interface ParallaxProps {
  speed?: number
  direction?: "y" | "x"
  distance?: number
  className?: string
  children?: React.ReactNode
}

export function Parallax({ speed = 1, direction = "y", distance = 30, className, children }: ParallaxProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!ref.current) return
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) return

    const movement = distance * speed
    const prop = direction === "y" ? "yPercent" : "xPercent"

    gsap.fromTo(
      ref.current,
      { [prop]: movement },
      {
        [prop]: -movement,
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      },
    )
  }, { scope: ref })

  return (
    <div ref={ref} className={cn("parallax", className)}>
      {children}
    </div>
  )
}
```

## בדיקות סיום
- [ ] Element זז בscroll
- [ ] speed > 1 = מהיר יותר מscroll
- [ ] speed < 0 = כיוון הפוך
- [ ] prefers-reduced-motion: לא זז
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
