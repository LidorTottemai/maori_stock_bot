# WavyBackground

> **קטגוריה:** special
> **השראה:** Aceternity UI
> **תלויות:** framer-motion (motion/react)
> **Storybook:** src/stories/special/WavyBackground.stories.tsx
> **קוד:** src/special/WavyBackground.tsx
> **עלות בנייה:** ~30 דקות

## מה זה
רקע עם גלים SVG אנימטיים. Multiple paths בגבהים שונים, offsets שונים → מראה "אוקיאני". content מונח מעל.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| colors | `string[]` | `["var(--color-primary)", "var(--color-secondary)"]` | — |
| speed | `'slow' \| 'medium' \| 'fast'` | `'medium'` | — |
| amplitude | `number` | `20` | wave height px |
| children | `ReactNode` | — | — |
| className | `string` | — | — |

## שימוש
```tsx
<WavyBackground colors={["var(--color-primary)", "var(--color-secondary)"]} amplitude={30}>
  <h1 className="text-white text-center">Hero Content</h1>
</WavyBackground>
```

## קוד מלא
```tsx
"use client"
// src/special/WavyBackground.tsx
import * as React from "react"
import { cn } from "../cn"

const speeds = { slow: "8s", medium: "5s", fast: "3s" }

interface WavyBackgroundProps {
  colors?: string[]
  speed?: "slow" | "medium" | "fast"
  amplitude?: number
  className?: string
  children?: React.ReactNode
}

export function WavyBackground({
  colors = ["var(--color-primary)", "var(--color-secondary)"],
  speed = "medium",
  amplitude = 20,
  className,
  children,
}: WavyBackgroundProps) {
  const dur = speeds[speed]

  const wavePath = (phase: number, amp: number) =>
    `M0,${50 + amp} C150,${50 - amp * phase} 350,${50 + amp * phase} 500,${50 - amp} S750,${50 + amp * phase} 1000,${50 - amp} V100 H0 Z`

  return (
    <div className={cn("wavy-bg", className)}>
      <svg className="wavy-svg" viewBox="0 0 1000 100" preserveAspectRatio="none">
        {colors.map((color, i) => (
          <path key={i} d={wavePath(1 + i * 0.5, amplitude)} fill={color} opacity={0.6 - i * 0.15}>
            <animateTransform
              attributeName="transform"
              type="translate"
              from={`${i % 2 === 0 ? 0 : -50} 0`}
              to={`${i % 2 === 0 ? 50 : 0} 0`}
              dur={`${parseFloat(dur) * (1 + i * 0.3)}s`}
              repeatCount="indefinite"
              additive="sum"
            />
          </path>
        ))}
      </svg>
      <div className="wavy-content">{children}</div>
      <style>{`
        .wavy-bg { position: relative; overflow: hidden; }
        .wavy-svg { position: absolute; bottom: 0; left: 0; right: 0; width: 100%; height: 40%; }
        .wavy-content { position: relative; z-index: 10; }
        @media (prefers-reduced-motion: reduce) {
          .wavy-svg animateTransform { display: none; }
        }
      `}</style>
    </div>
  )
}
```

## בדיקות סיום
- [ ] Waves אנימציה רצה
- [ ] Multiple colors מוצגים
- [ ] prefers-reduced-motion
- [ ] CSS variables בלבד
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
