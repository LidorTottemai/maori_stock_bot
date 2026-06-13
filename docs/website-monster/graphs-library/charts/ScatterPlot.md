# ScatterPlot

> **קטגוריה:** charts
> **תלויות:** recharts ^3
> **קוד:** src/charts/ScatterPlot.tsx
> **עלות בנייה:** ~15 דקות

## מה זה
גרף פיזור XY — מציג קורלציה בין שני משתנים. שימוש: מחיר מול פופולריות, זמן מול הכנסה.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `{ x: number; y: number; label?: string }[]` | required | |
| xLabel | `string` | `"X"` | |
| yLabel | `string` | `"Y"` | |
| height | `number` | `300` | |
| dotSize | `number` | `60` | גודל הנקודות |
| color | `string` | `var(--color-primary)` | |

## שימוש בסיסי
```tsx
import { ScatterPlot } from "@tottemai/graphs"

<ScatterPlot
  data={products.map(p => ({ x: p.price, y: p.sales, label: p.name }))}
  xLabel="מחיר (₪)"
  yLabel="מכירות"
/>
```

## קוד מלא
```tsx
// src/charts/ScatterPlot.tsx
"use client"
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ZAxis,
} from "recharts"
import { useChartTheme } from "../hooks/useChartTheme"

interface Props {
  data: { x: number; y: number; label?: string }[]
  xLabel?: string
  yLabel?: string
  height?: number
  dotSize?: number
  color?: string
}

export function ScatterPlot({ data, xLabel = "X", yLabel = "Y", height = 300, dotSize = 60, color }: Props) {
  const t = useChartTheme()
  const fill = color ?? t.primary

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
        <XAxis
          dataKey="x"
          name={xLabel}
          type="number"
          tick={{ fill: t.muted, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          label={{ value: xLabel, position: "insideBottom", offset: -5, fill: t.muted, fontSize: 12 }}
        />
        <YAxis
          dataKey="y"
          name={yLabel}
          type="number"
          tick={{ fill: t.muted, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <ZAxis range={[dotSize, dotSize]} />
        <Tooltip
          cursor={{ strokeDasharray: "3 3", stroke: t.border }}
          contentStyle={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text }}
          formatter={(value, name) => [value, name === "x" ? xLabel : yLabel]}
        />
        <Scatter data={data} fill={fill} fillOpacity={0.7} />
      </ScatterChart>
    </ResponsiveContainer>
  )
}
```

## בדיקות סיום
- [ ] נקודות מרנדרות
- [ ] Tooltip מציג x/y ו-label
- [ ] dotSize משנה גודל
- [ ] מיוצא ב-src/index.ts

← [[../00 - Library Overview & Build Plan]]
