# RadarChart

> **קטגוריה:** charts
> **תלויות:** recharts ^3
> **קוד:** src/charts/RadarChart.tsx
> **עלות בנייה:** ~15 דקות

## מה זה
גרף עכביש/radar — מציג מספר מימדים על ציר מעגלי. שימוש: השוואת שירותים, ציוני ביצועים.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `Record<string, number \| string>[]` | required | |
| metrics | `string[]` | required | שמות הצירים |
| series | `{ key: string; label: string; color?: string }[]` | required | |
| height | `number` | `300` | |
| filled | `boolean` | `true` | fill עם opacity |

## שימוש בסיסי
```tsx
import { RadarChart } from "@tottemai/graphs"

<RadarChart
  data={[{ metric: "מהירות", A: 80, B: 65 }, ...]}
  metrics={["מהירות", "איכות", "מחיר", "שירות", "ניסיון"]}
  series={[
    { key: "A", label: "מוצר A" },
    { key: "B", label: "מוצר B" },
  ]}
/>
```

## קוד מלא
```tsx
// src/charts/RadarChart.tsx
"use client"
import {
  RadarChart as RC, Radar, PolarGrid, PolarAngleAxis,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import { useChartTheme } from "../hooks/useChartTheme"

interface SeriesConfig { key: string; label: string; color?: string }

interface Props {
  data: Record<string, number | string>[]
  metrics: string[]
  series: SeriesConfig[]
  height?: number
  filled?: boolean
}

export function RadarChart({ data, metrics, series, height = 300, filled = true }: Props) {
  const t = useChartTheme()

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RC data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke={t.border} />
        <PolarAngleAxis dataKey="metric" tick={{ fill: t.muted, fontSize: 12 }} />
        <Tooltip contentStyle={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text }} />
        <Legend wrapperStyle={{ color: t.text, fontSize: 12 }} />
        {series.map((s, i) => {
          const color = s.color ?? t.series[i % t.series.length]
          return (
            <Radar
              key={s.key}
              name={s.label}
              dataKey={s.key}
              stroke={color}
              fill={filled ? color : "none"}
              fillOpacity={filled ? 0.15 : 0}
              strokeWidth={2}
            />
          )
        })}
      </RC>
    </ResponsiveContainer>
  )
}
```

## בדיקות סיום
- [ ] ציר מעגלי מוצג
- [ ] מספר series ב-legend
- [ ] `filled={false}` מציג רק קווים
- [ ] מיוצא ב-src/index.ts

← [[../00 - Library Overview & Build Plan]]
