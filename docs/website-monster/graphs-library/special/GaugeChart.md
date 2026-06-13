# GaugeChart

> **קטגוריה:** special
> **תלויות:** none (SVG מותאם)
> **קוד:** src/special/GaugeChart.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
מד מהירות / speedometer SVG — קשת חצי עיגול עם מחוג. שימוש: ניצול קיבולת, ציון NPS, מדד ביצועים.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `number` | required | הערך הנוכחי |
| min | `number` | `0` | |
| max | `number` | `100` | |
| label | `string` | `undefined` | מתחת לערך |
| size | `number` | `200` | קוטר |
| zones | `{ from: number; to: number; color: string }[]` | `undefined` | אזורי צבע |

## שימוש בסיסי
```tsx
import { GaugeChart } from "@tottemai/graphs"

<GaugeChart
  value={72}
  label="NPS Score"
  zones={[
    { from: 0, to: 50, color: "#ef4444" },
    { from: 50, to: 75, color: "#f59e0b" },
    { from: 75, to: 100, color: "#22c55e" },
  ]}
/>
```

## קוד מלא
```tsx
// src/special/GaugeChart.tsx
"use client"
import { useEffect, useRef } from "react"

interface Zone { from: number; to: number; color: string }

interface Props {
  value: number
  min?: number
  max?: number
  label?: string
  size?: number
  zones?: Zone[]
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s = polarToCartesian(cx, cy, r, startDeg)
  const e = polarToCartesian(cx, cy, r, endDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
}

export function GaugeChart({ value, min = 0, max = 100, label, size = 200, zones }: Props) {
  const clamp = Math.min(max, Math.max(min, value))
  const pct = (clamp - min) / (max - min)
  const needleDeg = -135 + pct * 270  // -135° to +135°
  const cx = size / 2, cy = size / 2
  const r = size * 0.38
  const sw = size * 0.08

  const defaultZones: Zone[] = zones ?? [
    { from: min, to: min + (max - min) / 3, color: "#ef4444" },
    { from: min + (max - min) / 3, to: min + (max - min) * 2 / 3, color: "#f59e0b" },
    { from: min + (max - min) * 2 / 3, to: max, color: "#22c55e" },
  ]

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <svg width={size} height={size * 0.6}>
        {/* אזורי צבע */}
        {defaultZones.map((z, i) => {
          const startPct = (z.from - min) / (max - min)
          const endPct = (z.to - min) / (max - min)
          const startDeg = -135 + startPct * 270
          const endDeg = -135 + endPct * 270
          return (
            <path
              key={i}
              d={arcPath(cx, cy, r, startDeg, endDeg)}
              fill="none"
              stroke={z.color}
              strokeWidth={sw}
              strokeLinecap="butt"
              opacity={0.8}
            />
          )
        })}
        {/* מחוג */}
        <line
          x1={cx} y1={cy}
          x2={cx + r * 0.7 * Math.cos(((needleDeg - 90) * Math.PI) / 180)}
          y2={cy + r * 0.7 * Math.sin(((needleDeg - 90) * Math.PI) / 180)}
          stroke="var(--color-text)"
          strokeWidth={2}
          strokeLinecap="round"
          style={{ transition: "all 1s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
        <circle cx={cx} cy={cy} r={sw * 0.5} fill="var(--color-text)" />
        {/* ערך */}
        <text x={cx} y={cy + r * 0.35} textAnchor="middle" fontSize={size * 0.16} fontWeight={700} fill="var(--color-text)">
          {value}
        </text>
      </svg>
      {label && <p className="text-sm text-[var(--color-text-muted)]">{label}</p>}
    </div>
  )
}
```

## בדיקות סיום
- [ ] מחוג בעמדה נכונה
- [ ] אזורי צבע מוצגים
- [ ] needle animation בשינוי value
- [ ] size שונה פועל
- [ ] מיוצא ב-src/index.ts

← [[../00 - Library Overview & Build Plan]]
