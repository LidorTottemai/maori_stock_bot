# PieChart

> **קטגוריה:** charts
> **תלויות:** recharts ^3
> **קוד:** src/charts/PieChart.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
גרף עוגה עם legend ו-custom labels. שימוש: התפלגות קטגוריות, שיעורי שירותים.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | עוגה + legend מצד ימין |
| With Labels | אחוזים על הפרוסות |
| Active Slice | hover מגדיל פרוסה |
| Custom Colors | מערך צבעים |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `{ name: string; value: number; color?: string }[]` | required | |
| height | `number` | `300` | |
| showLabels | `boolean` | `false` | אחוזים על הפרוסות |
| showLegend | `boolean` | `true` | |
| innerRadius | `number` | `0` | >0 הופך לDonut |
| paddingAngle | `number` | `2` | רווח בין פרוסות |

## שימוש בסיסי
```tsx
import { PieChart } from "@tottemai/graphs"

<PieChart
  data={[
    { name: "עיסוי", value: 45 },
    { name: "פציאל", value: 32 },
    { name: "מניקור", value: 23 },
  ]}
  showLabels
/>
```

## קוד מלא
```tsx
// src/charts/PieChart.tsx
"use client"
import { PieChart as RC, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useChartTheme } from "../hooks/useChartTheme"

interface PieData {
  name: string
  value: number
  color?: string
}

interface Props {
  data: PieData[]
  height?: number
  showLabels?: boolean
  showLegend?: boolean
  innerRadius?: number
  paddingAngle?: number
}

function renderLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  const RADIAN = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return percent > 0.05 ? (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null
}

export function PieChart({
  data, height = 300, showLabels = false, showLegend = true,
  innerRadius = 0, paddingAngle = 2,
}: Props) {
  const t = useChartTheme()

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RC>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius="70%"
          paddingAngle={paddingAngle}
          dataKey="value"
          labelLine={false}
          label={showLabels ? renderLabel : undefined}
        >
          {data.map((entry, i) => (
            <Cell
              key={entry.name}
              fill={entry.color ?? t.series[i % t.series.length]}
              stroke="none"
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text }}
        />
        {showLegend && <Legend wrapperStyle={{ color: t.text, fontSize: 12 }} />}
      </RC>
    </ResponsiveContainer>
  )
}
```

## בדיקות סיום
- [ ] פרוסות מרנדרות עם צבעי series
- [ ] Labels אחוזים מוצגים
- [ ] Hover active slice
- [ ] `innerRadius > 0` הופך לDonut
- [ ] מיוצא ב-src/index.ts

← [[../00 - Library Overview & Build Plan]]
