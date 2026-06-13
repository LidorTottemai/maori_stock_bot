# AnimatedGradient

> **קטגוריה:** special
> **תלויות:** none (CSS animation)
> **Storybook:** src/stories/special/AnimatedGradient.stories.tsx
> **קוד:** src/special/AnimatedGradient.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
Animated gradient mesh background. Multiple radial-gradient blobs שזזים לאט. יוצרים תחושת עומק ותנועה חיה ברקע. Pure CSS — ביצועים מעולים.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| colors | `string[]` | 4 CSS vars | צבעי ה-blobs |
| speed | `'slow' \| 'medium' \| 'fast'` | `'slow'` | — |
| blur | `number` | `60` | px blur על כל blob |
| opacity | `number` | `0.7` | — |
| className | `string` | — | — |
| children | `ReactNode` | — | — |

## שימוש
```tsx
import { AnimatedGradient } from "@tottemai/ui"

<section className="min-h-screen">
  <AnimatedGradient
    colors={["var(--color-primary)", "var(--color-secondary)", "var(--color-accent)", "var(--color-surface-2)"]}
    opacity={0.4}
  />
  <div className="relative z-10">Content</div>
</section>
```

## קוד מלא
```tsx
// src/special/AnimatedGradient.tsx
import * as React from "react"
import { cn } from "../cn"

const speedMap = { slow: "20s", medium: "12s", fast: "6s" }

interface AnimatedGradientProps {
  colors?: string[]
  speed?: "slow" | "medium" | "fast"
  blur?: number
  opacity?: number
  className?: string
  children?: React.ReactNode
}

const blobs = [
  { top: "10%", left: "10%", animName: "ag-blob-1" },
  { top: "20%", right: "10%", animName: "ag-blob-2" },
  { bottom: "15%", left: "20%", animName: "ag-blob-3" },
  { bottom: "10%", right: "15%", animName: "ag-blob-4" },
]

export function AnimatedGradient({
  colors = ["var(--color-primary)", "var(--color-secondary)", "var(--color-accent)", "var(--color-surface-2)"],
  speed = "slow",
  blur = 60,
  opacity = 0.7,
  className,
  children,
}: AnimatedGradientProps) {
  const dur = speedMap[speed]

  return (
    <div className={cn("ag-container", className)}>
      {blobs.slice(0, colors.length).map((blob, i) => (
        <div
          key={i}
          className={`ag-blob ag-blob-${i + 1}`}
          style={{
            background: colors[i],
            filter: `blur(${blur}px)`,
            opacity,
            animationDuration: `${parseFloat(dur) * (1 + i * 0.3)}s`,
            ...blob as React.CSSProperties,
          }}
        />
      ))}
      {children && <div className="ag-content">{children}</div>}

      <style>{`
        .ag-container { position: relative; overflow: hidden; }
        .ag-blob {
          position: absolute; width: 50%; height: 50%; border-radius: 50%;
          animation: ag-float linear infinite alternate;
        }
        .ag-blob-1 { animation-name: ag-float-1; }
        .ag-blob-2 { animation-name: ag-float-2; animation-delay: -3s; }
        .ag-blob-3 { animation-name: ag-float-3; animation-delay: -6s; }
        .ag-blob-4 { animation-name: ag-float-4; animation-delay: -9s; }
        @keyframes ag-float-1 { 0% { transform: translate(0,0); } 100% { transform: translate(15%,20%); } }
        @keyframes ag-float-2 { 0% { transform: translate(0,0); } 100% { transform: translate(-20%,15%); } }
        @keyframes ag-float-3 { 0% { transform: translate(0,0); } 100% { transform: translate(20%,-15%); } }
        @keyframes ag-float-4 { 0% { transform: translate(0,0); } 100% { transform: translate(-15%,-20%); } }
        @media (prefers-reduced-motion: reduce) { .ag-blob { animation: none; } }
        .ag-content { position: relative; z-index: 10; }
      `}</style>
    </div>
  )
}
```

## בדיקות סיום
- [ ] Blobs זזים לאט
- [ ] Colors CSS variables
- [ ] prefers-reduced-motion: ללא animation
- [ ] ביצועים: GPU compositing (blur)
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
