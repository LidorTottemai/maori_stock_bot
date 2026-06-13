# ProgressRing

> **קטגוריה:** dashboard
> **תלויות:** none (SVG מותאם)
> **קוד:** src/dashboard/ProgressRing.tsx
> **עלות בנייה:** ~15 דקות

## מה זה
עיגול התקדמות SVG — אחוז כמספר במרכז + stroke animation. שימוש: יעדי מכירות, השלמת פרופיל, ניצול קיבולת.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `number` | required | 0–100 |
| size | `number` | `120` | קוטר בpixels |
| strokeWidth | `number` | `10` | עובי הטבעת |
| color | `string` | `var(--color-primary)` | |
| label | `string` | `undefined` | טקסט מתחת לאחוז |
| animate | `boolean` | `true` | stroke-dashoffset animation |

## שימוש בסיסי
```tsx
import { ProgressRing } from "@tottemai/graphs"

<ProgressRing value={68} label="הושלמו" />
```

## קוד מלא
```tsx
// src/dashboard/ProgressRing.tsx
"use client"
import { useEffect, useRef } from "react"

interface Props {
  value: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
  animate?: boolean
}

export function ProgressRing({
  value, size = 120, strokeWidth = 10, color = "var(--color-primary)", label, animate = true,
}: Props) {
  const clampedValue = Math.min(100, Math.max(0, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clampedValue / 100) * circumference
  const circleRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    if (!animate || !circleRef.current) return
    circleRef.current.style.transition = "stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)"
    circleRef.current.style.strokeDashoffset = `${offset}`
  }, [offset, animate])

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        <circle
          ref={circleRef}
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animate ? circumference : offset}
        />
        <text
          x={size / 2} y={size / 2}
          textAnchor="middle" dominantBaseline="middle"
          style={{ transform: "rotate(90deg)", transformOrigin: `${size / 2}px ${size / 2}px` }}
          fontSize={size * 0.22}
          fontWeight={700}
          fill="var(--color-text)"
        >
          {clampedValue}%
        </text>
      </svg>
      {label && <span className="text-sm text-[var(--color-text-muted)]">{label}</span>}
    </div>
  )
}
```

## בדיקות סיום
- [ ] stroke animation עם transition
- [ ] value=0 ו-100 נראים נכון
- [ ] label מתחת לעיגול
- [ ] size שונה פועל
- [ ] מיוצא ב-src/index.ts

← [[../00 - Library Overview & Build Plan]]
