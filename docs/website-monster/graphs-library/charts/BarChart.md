# BarChart

> **קטגוריה:** charts
> **תלויות:** recharts ^3
> **קוד:** src/charts/BarChart.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
גרף עמודות — אנכי, אופקי, או stacked. שימוש: השוואת קטגוריות, הצגת נפח לפי חודש/שירות.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Vertical | עמודות אנכיות רגילות |
| Horizontal | `layout="horizontal"` — שימושי לשמות ארוכים |
| Stacked | `stacked={true}` — עמודות מוערמות |
| Grouped | מספר bars לכל X |
| Rounded Corners | `radius={[4,4,0,0]}` |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `Record<string, unknown>[]` | required | |
| bars | `{ key: string; label: string; color?: string }[]` | required | |
| xKey | `string` | `"name"` | |
| height | `number` | `300` | |
| layout | `"vertical" \| "horizontal"` | `"vertical"` | |
| stacked | `boolean` | `false` | |
| showGrid | `boolean` | `true` | |
| barSize | `number` | `32` | רוחב כל עמודה |
| radius | `number` | `4` | עיגול פינות |

## שימוש בסיסי
```tsx
import { BarChart } from "@tottemai/graphs"

<BarChart
  data={[
    { service: "עיסוי", bookings: 45 },
    { service: "פציאל", bookings: 32 },
    { service: "מניקור", bookings: 28 },
  ]}
  xKey="service"
  bars={[{ key: "bookings", label: "הזמנות" }]}
  layout="horizontal"
/>
```

## קוד מלא
```tsx
// src/charts/BarChart.tsx
"use client"
import {
  BarChart as RC, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, Cell, ResponsiveContainer,
} from "recharts"
import { useChartTheme } from "../hooks/useChartTheme"

interface BarConfig {
  key: string
  label: string
  color?: string
}

interface Props {
  data: Record<string, unknown>[]
  bars: BarConfig[]
  xKey?: string
  height?: number
  layout?: "vertical" | "horizontal"
  stacked?: boolean
  showGrid?: boolean
  barSize?: number
  radius?: number
}

export function BarChart({
  data, bars, xKey = "name", height = 300,
  layout = "vertical", stacked = false,
  showGrid = true, barSize = 32, radius = 4,
}: Props) {
  const t = useChartTheme()
  const isHorizontal = layout === "horizontal"

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RC data={data} layout={layout}>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={t.border}
            vertical={!isHorizontal}
            horizontal={isHorizontal}
          />
        )}
        <XAxis
          dataKey={isHorizontal ? undefined : xKey}
          type={isHorizontal ? "number" : "category"}
          tick={{ fill: t.muted, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          dataKey={isHorizontal ? xKey : undefined}
          type={isHorizontal ? "category" : "number"}
          tick={{ fill: t.muted, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={isHorizontal ? 80 : 48}
        />
        <Tooltip
          contentStyle={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text }}
        />
        {bars.length > 1 && <Legend wrapperStyle={{ color: t.text, fontSize: 12 }} />}
        {bars.map((b, i) => (
          <Bar
            key={b.key}
            dataKey={b.key}
            name={b.label}
            fill={b.color ?? t.series[i % t.series.length]}
            stackId={stacked ? "stack" : undefined}
            barSize={barSize}
            radius={i === bars.length - 1 || !stacked ? [radius, radius, 0, 0] : [0, 0, 0, 0]}
          />
        ))}
      </RC>
    </ResponsiveContainer>
  )
}
```

## בדיקות סיום
- [ ] Vertical + Horizontal פועלים
- [ ] Stacked מוצג נכון
- [ ] Grouped (מספר bars) עם legend
- [ ] barSize ו-radius עובדים
- [ ] RTL: שמות בעברית מוצגים
- [ ] מיוצא ב-src/index.ts

← [[../00 - Library Overview & Build Plan]]
