# Marquee

> **קטגוריה:** motion
> **תלויות:** none (CSS animation)
> **Storybook:** src/stories/motion/Marquee.stories.tsx
> **קוד:** src/motion/Marquee.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
Infinite scrolling strip — לוגואים, ציטוטים, תגיות. CSS animation אינסופית. מכפיל את התוכן לsimless loop. Pause on hover. RTL-aware direction.

## אנימציה — איך זה עובד
`overflow: hidden` על wrapper. Inner div עם `display: flex` + `animation: marquee linear infinite`. הdiv מכיל את הitems פעמיים → `translateX(0)` ל-`translateX(-50%)`. Seamless.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| speed | `'slow' \| 'medium' \| 'fast'` | `'medium'` | — |
| direction | `'left' \| 'right'` | `'left'` | — |
| pauseOnHover | `boolean` | true | — |
| gap | `string` | `'32px'` | — |
| children | `ReactNode` | — | items |
| className | `string` | — | — |

## שימוש
```tsx
import { Marquee } from "@tottemai/ui"

// רצועת לוגואים של לקוחות
<Marquee pauseOnHover>
  <img src="/logos/logo1.svg" className="h-8 opacity-60" />
  <img src="/logos/logo2.svg" className="h-8 opacity-60" />
  <img src="/logos/logo3.svg" className="h-8 opacity-60" />
  <img src="/logos/logo4.svg" className="h-8 opacity-60" />
</Marquee>
```

## קוד מלא
```tsx
"use client"
// src/motion/Marquee.tsx
import * as React from "react"
import { cn } from "../cn"

const speeds = { slow: "40s", medium: "25s", fast: "12s" }

interface MarqueeProps {
  speed?: "slow" | "medium" | "fast"
  direction?: "left" | "right"
  pauseOnHover?: boolean
  gap?: string
  className?: string
  children?: React.ReactNode
}

export function Marquee({ speed = "medium", direction = "left", pauseOnHover = true, gap = "32px", className, children }: MarqueeProps) {
  const duration = speeds[speed]
  const animDir = direction === "right" ? "reverse" : "normal"
  const id = React.useId().replace(/:/g, "")

  return (
    <div className={cn("marquee-outer", className)} style={{ overflow: "hidden" }}>
      <div
        className={cn("marquee-inner", pauseOnHover && "marquee-pause-hover")}
        style={{ animationDuration: duration, animationDirection: animDir }}
      >
        <div className="marquee-track" style={{ gap }}>
          {children}
        </div>
        <div className="marquee-track" aria-hidden style={{ gap }}>
          {children}
        </div>
      </div>

      <style>{`
        .marquee-outer { width: 100%; }
        .marquee-inner {
          display: flex; width: max-content;
          animation: marquee-scroll linear infinite;
        }
        .marquee-pause-hover:hover { animation-play-state: paused; }
        .marquee-track { display: flex; align-items: center; flex-shrink: 0; }
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-inner { animation: none; }
        }
      `}</style>
    </div>
  )
}
```

## בדיקות סיום
- [ ] Loop seamless
- [ ] Pause on hover פועל
- [ ] prefers-reduced-motion: עוצר
- [ ] RTL direction
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
