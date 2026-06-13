# HorizontalScroll

> **קטגוריה:** motion
> **תלויות:** gsap, @gsap/react
> **Storybook:** src/stories/motion/HorizontalScroll.stories.tsx
> **קוד:** src/motion/HorizontalScroll.tsx
> **עלות בנייה:** ~35 דקות

## מה זה
גלריה אופקית בתוך scroll אנכי. ה-section מתחבר (pin) בזמן הscroll האנכי ממיר לscroll אופקי. GSAP ScrollTrigger עם `pin: true`, `scrub`, `snap`.

## אנימציה — איך זה עובד
`gsap.to(gallery, { xPercent: -100 * (items - 1), scrollTrigger: { pin: true, scrub: 1, snap: 1/(items-1) } })`. Section גבוה כ-`100vh * items` כדי ליצור scroll space. Gallery מוסרת לאופקי.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | `ReactNode[]` | — | slides (חובה array) |
| snap | `boolean` | true | snap לslide |
| scrub | `number` | `1` | GSAP scrub value |
| className | `string` | — | class על כל slide |

## שימוש
```tsx
import { HorizontalScroll } from "@tottemai/ui"

<HorizontalScroll>
  <section className="h-screen bg-red-500 w-screen flex items-center justify-center">
    <h2>Slide 1</h2>
  </section>
  <section className="h-screen bg-blue-500 w-screen flex items-center justify-center">
    <h2>Slide 2</h2>
  </section>
  <section className="h-screen bg-green-500 w-screen flex items-center justify-center">
    <h2>Slide 3</h2>
  </section>
</HorizontalScroll>
```

## קוד מלא
```tsx
"use client"
// src/motion/HorizontalScroll.tsx
import * as React from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { cn } from "../cn"

gsap.registerPlugin(ScrollTrigger)

interface HorizontalScrollProps {
  children: React.ReactNode
  snap?: boolean
  scrub?: number
  className?: string
}

export function HorizontalScroll({ children, snap = true, scrub = 1, className }: HorizontalScrollProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const galleryRef = React.useRef<HTMLDivElement>(null)
  const items = React.Children.count(children)

  useGSAP(() => {
    if (!containerRef.current || !galleryRef.current) return
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) return

    gsap.to(galleryRef.current, {
      xPercent: -100 * (items - 1),
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        scrub,
        snap: snap ? 1 / (items - 1) : undefined,
        end: () => `+=${containerRef.current!.offsetWidth * (items - 1)}`,
      },
    })
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className={cn("hscroll-container", className)}>
      <div ref={galleryRef} className="hscroll-gallery">
        {React.Children.map(children, (child, i) => (
          <div key={i} className="hscroll-slide">{child}</div>
        ))}
      </div>
      <style>{`
        .hscroll-container { overflow: hidden; width: 100%; }
        .hscroll-gallery { display: flex; flex-wrap: nowrap; }
        .hscroll-slide { width: 100vw; flex-shrink: 0; }
      `}</style>
    </div>
  )
}
```

## בדיקות סיום
- [ ] Pin פועל בscroll
- [ ] Snap לslides
- [ ] prefers-reduced-motion: ללא effect
- [ ] Responsive (100vw per slide)
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
