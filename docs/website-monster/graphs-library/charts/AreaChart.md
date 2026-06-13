# AreaChart

> **קטגוריה:** charts
> **תלויות:** recharts ^3
> **קוד:** src/charts/AreaChart.tsx
> **עלות בנייה:** ~15 דקות

## מה זה
גרף שטח — area עם gradient fill. נראה יפה יותר מLineChart בדפי תדמית. תומך stacked areas.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Single Area | area אחת עם gradient |
| Stacked Areas | כמה areas מוערמות |
| Gradient Fill | fill שהולך שקוף מלמטה |
| Mini (no axes) | גרסה קטנה לSparkLine |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `Record<string, unknown>[]` | required | |
| areas | `{ key: string; label: string; color?: string }[]` | required | |
| xKey | `string` | `"name"` | |
| height | `number` | `300` | |
| stacked | `boolean` | `false` | |
| gradient | `boolean` | `true` | fill עם opacity gradient |
| showAxes | `boolean` | `true` | כיבוי לversions מיני |

## שימוש בסיסי
```tsx
import { AreaChart } from "@tottemai/graphs"

<AreaChart
  data={weeklyData}
  xKey="day"
  areas={[{ key: "visits", label: "ביקורים" }]}
  gradient
/>
```

## קוד מלא
```tsx
// src/charts/AreaChart.tsx
"use client"
import {
  AreaChart as RC, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, defs, linearGradient, stop,
} from "recharts"
import { useChartTheme } from "../hooks/useChartTheme"

interface AreaConfig {
  key: string
  label: string
  color?: string
}

interface Props {
  data: Record<string, unknown>[]
  areas: AreaConfig[]
  xKey?: string
  height?: number
  stacked?: boolean
  gradient?: boolean
  showAxes?: boolean
}

export function AreaChart({
  data, areas, xKey = "name", height = 300,
  stacked = false, gradient = true, showAxes = true,
}: Props) {
  const t = useChartTheme()

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RC data={data}>
        <defs>
          {areas.map((a, i) => {
            const color = a.color ?? t.series[i % t.series.length]
            return (
              <linearGradient key={a.key} id={`grad-${a.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={gradient ? 0.3 : 0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            )
          })}
        </defs>
        {showAxes && (
          <>
            <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
            <XAxis dataKey={xKey} tick={{ fill: t.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: t.muted, fontSize: 12 }} axisLine={false} tickLine={false} width={48} />
          </>
        )}
        <Tooltip contentStyle={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text }} />
        {areas.length > 1 && <Legend wrapperStyle={{ color: t.text, fontSize: 12 }} />}
        {areas.map((a, i) => {
          const color = a.color ?? t.series[i % t.series.length]
          return (
            <Area
              key={a.key}
              type="monotone"
              dataKey={a.key}
              name={a.label}
              stroke={color}
              strokeWidth={2}
              fill={`url(#grad-${a.key})`}
              stackId={stacked ? "stack" : undefined}
            />
          )
        })}
      </RC>
    </ResponsiveContainer>
  )
}
```

## בדיקות סיום
- [ ] Gradient fill נראה טוב
- [ ] Stacked areas מוערמות נכון
- [ ] `showAxes={false}` עובד (לSparkLine)
- [ ] מיוצא ב-src/index.ts

← [[../00 - Library Overview & Build Plan]]
