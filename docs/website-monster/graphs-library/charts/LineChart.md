# LineChart

> **קטגוריה:** charts
> **תלויות:** recharts ^3
> **קוד:** src/charts/LineChart.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
גרף קו — קו יחיד או מרובה קווים. שימוש נפוץ: הכנסות לאורך זמן, users active, כל מדד זמני.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Single Line | קו אחד + tooltip |
| Multi Line | מספר קווים עם legend |
| Smooth Curve | `type="monotone"` |
| With Reference Line | קו יעד אופקי |
| Loading Skeleton | Skeleton placeholder |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `Record<string, unknown>[]` | required | מערך נתונים |
| lines | `{ key: string; label: string; color?: string }[]` | required | קווים להציג |
| xKey | `string` | `"name"` | key של ציר X |
| height | `number` | `300` | גובה בpixels |
| showGrid | `boolean` | `true` | |
| showLegend | `boolean` | `true` אם >1 קווים | |
| curve | `"linear" \| "monotone" \| "step"` | `"monotone"` | |
| referenceLines | `{ y: number; label: string }[]` | `[]` | |

## שימוש בסיסי
```tsx
import { LineChart } from "@tottemai/graphs"

const data = [
  { month: "ינואר", revenue: 12000, expenses: 8000 },
  { month: "פברואר", revenue: 18000, expenses: 9500 },
  { month: "מרץ", revenue: 15000, expenses: 8200 },
]

<LineChart
  data={data}
  xKey="month"
  lines={[
    { key: "revenue", label: "הכנסות" },
    { key: "expenses", label: "הוצאות" },
  ]}
  height={300}
/>
```

## קוד מלא
```tsx
// src/charts/LineChart.tsx
"use client"
import {
  LineChart as RC, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer,
} from "recharts"
import { useChartTheme } from "../hooks/useChartTheme"

interface LineConfig {
  key: string
  label: string
  color?: string
}

interface Props {
  data: Record<string, unknown>[]
  lines: LineConfig[]
  xKey?: string
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  curve?: "linear" | "monotone" | "step"
  referenceLines?: { y: number; label: string }[]
}

export function LineChart({
  data, lines, xKey = "name", height = 300,
  showGrid = true, curve = "monotone", referenceLines = [],
  showLegend,
}: Props) {
  const t = useChartTheme()
  const displayLegend = showLegend ?? lines.length > 1

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RC data={data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />}
        <XAxis
          dataKey={xKey}
          tick={{ fill: t.muted, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: t.muted, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          contentStyle={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 8,
            color: t.text,
          }}
        />
        {displayLegend && <Legend wrapperStyle={{ color: t.text, fontSize: 12 }} />}
        {referenceLines.map((rl) => (
          <ReferenceLine key={rl.y} y={rl.y} stroke={t.muted} strokeDasharray="4 4" label={{ value: rl.label, fill: t.muted, fontSize: 11 }} />
        ))}
        {lines.map((l, i) => (
          <Line
            key={l.key}
            type={curve}
            dataKey={l.key}
            name={l.label}
            stroke={l.color ?? t.series[i % t.series.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </RC>
    </ResponsiveContainer>
  )
}
```

## בדיקות סיום
- [ ] מרנדר עם data
- [ ] מרובה קווים + legend
- [ ] ReferenceLine מוצג
- [ ] Responsive בresize
- [ ] Tooltip נראה טוב
- [ ] CSS variables: שינוי primary משנה צבע
- [ ] מיוצא ב-src/index.ts

← [[../00 - Library Overview & Build Plan]]
