# DonutChart

> **קטגוריה:** charts
> **תלויות:** recharts ^3
> **קוד:** src/charts/DonutChart.tsx
> **עלות בנייה:** ~15 דקות

## מה זה
גרף donut עם centerLabel בולט — נפוץ בדשבורדים. בנוי על PieChart עם `innerRadius`.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | donut + centerLabel + legend |
| Custom Center | JSX מותאם במרכז |
| No Legend | ללא legend (לwidgets קטנים) |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `{ name: string; value: number; color?: string }[]` | required | |
| centerLabel | `string` | `undefined` | טקסט גדול במרכז |
| centerSubLabel | `string` | `undefined` | טקסט קטן מתחת |
| height | `number` | `280` | |
| showLegend | `boolean` | `true` | |
| thickness | `number` | `30` | עובי הטבעת |

## שימוש בסיסי
```tsx
import { DonutChart } from "@tottemai/graphs"

<DonutChart
  data={[
    { name: "הושלמו", value: 68 },
    { name: "בתהליך", value: 22 },
    { name: "בוטלו", value: 10 },
  ]}
  centerLabel="68%"
  centerSubLabel="השלמה"
/>
```

## קוד מלא
```tsx
// src/charts/DonutChart.tsx
"use client"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useChartTheme } from "../hooks/useChartTheme"

interface DonutData { name: string; value: number; color?: string }

interface Props {
  data: DonutData[]
  centerLabel?: string
  centerSubLabel?: string
  height?: number
  showLegend?: boolean
  thickness?: number
}

export function DonutChart({
  data, centerLabel, centerSubLabel, height = 280,
  showLegend = true, thickness = 30,
}: Props) {
  const t = useChartTheme()
  const total = data.reduce((s, d) => s + d.value, 0)
  const outerR = "70%"

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={`calc(70% - ${thickness}px)`}
          outerRadius={outerR}
          paddingAngle={2}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((d, i) => (
            <Cell key={d.name} fill={d.color ?? t.series[i % t.series.length]} />
          ))}
        </Pie>
        {(centerLabel) && (
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
            <tspan x="50%" dy="-0.3em" fontSize={28} fontWeight={700} fill={t.text}>
              {centerLabel}
            </tspan>
            {centerSubLabel && (
              <tspan x="50%" dy="1.4em" fontSize={12} fill={t.muted}>
                {centerSubLabel}
              </tspan>
            )}
          </text>
        )}
        <Tooltip contentStyle={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text }} />
        {showLegend && <Legend wrapperStyle={{ color: t.text, fontSize: 12 }} />}
      </PieChart>
    </ResponsiveContainer>
  )
}
```

## בדיקות סיום
- [ ] centerLabel מוצג בצורה נכונה
- [ ] `thickness` משנה עובי הטבעת
- [ ] Hover tooltip
- [ ] מיוצא ב-src/index.ts

← [[../00 - Library Overview & Build Plan]]
