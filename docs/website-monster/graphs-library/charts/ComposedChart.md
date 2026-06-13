# ComposedChart

> **קטגוריה:** charts
> **תלויות:** recharts ^3
> **קוד:** src/charts/ComposedChart.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
גרף מורכב — bars + line על אותו ציר. שימוש קלאסי: עמודות הכנסה + קו ממוצע נע.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `Record<string, unknown>[]` | required | |
| bars | `{ key: string; label: string; color?: string }[]` | `[]` | |
| lines | `{ key: string; label: string; color?: string }[]` | `[]` | |
| areas | `{ key: string; label: string; color?: string }[]` | `[]` | |
| xKey | `string` | `"name"` | |
| height | `number` | `300` | |

## שימוש בסיסי
```tsx
import { ComposedChart } from "@tottemai/graphs"

<ComposedChart
  data={monthlyData}
  xKey="month"
  bars={[{ key: "revenue", label: "הכנסות" }]}
  lines={[{ key: "average", label: "ממוצע" }]}
/>
```

## קוד מלא
```tsx
// src/charts/ComposedChart.tsx
"use client"
import {
  ComposedChart as RC, Bar, Line, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import { useChartTheme } from "../hooks/useChartTheme"

interface SeriesConfig { key: string; label: string; color?: string }

interface Props {
  data: Record<string, unknown>[]
  bars?: SeriesConfig[]
  lines?: SeriesConfig[]
  areas?: SeriesConfig[]
  xKey?: string
  height?: number
}

export function ComposedChart({
  data, bars = [], lines = [], areas = [], xKey = "name", height = 300,
}: Props) {
  const t = useChartTheme()
  let colorIndex = 0

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RC data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
        <XAxis dataKey={xKey} tick={{ fill: t.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: t.muted, fontSize: 12 }} axisLine={false} tickLine={false} width={48} />
        <Tooltip contentStyle={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text }} />
        <Legend wrapperStyle={{ color: t.text, fontSize: 12 }} />
        {areas.map((a) => {
          const color = a.color ?? t.series[colorIndex++ % t.series.length]
          return <Area key={a.key} type="monotone" dataKey={a.key} name={a.label} fill={color} stroke={color} fillOpacity={0.15} />
        })}
        {bars.map((b) => {
          const color = b.color ?? t.series[colorIndex++ % t.series.length]
          return <Bar key={b.key} dataKey={b.key} name={b.label} fill={color} radius={[4, 4, 0, 0]} />
        })}
        {lines.map((l) => {
          const color = l.color ?? t.series[colorIndex++ % t.series.length]
          return <Line key={l.key} type="monotone" dataKey={l.key} name={l.label} stroke={color} strokeWidth={2} dot={false} />
        })}
      </RC>
    </ResponsiveContainer>
  )
}
```

## בדיקות סיום
- [ ] Bars + Line על אותו ציר
- [ ] Legend מציג כל הסדרות
- [ ] Tooltip משולב
- [ ] מיוצא ב-src/index.ts

← [[../00 - Library Overview & Build Plan]]
