# SparkLine

> **קטגוריה:** dashboard
> **תלויות:** recharts ^3
> **קוד:** src/dashboard/SparkLine.tsx
> **עלות בנייה:** ~10 דקות

## מה זה
גרף קו מיני ללא axes, labels, או tooltip. מכוון להטמעה בתוך כרטיסים. בנוי על AreaChart עם `showAxes={false}`.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `number[]` | required | רשימת ערכים |
| color | `string` | `var(--color-primary)` | צבע הקו |
| height | `number` | `48` | |
| width | `number \| string` | `"100%"` | |
| type | `"line" \| "area"` | `"area"` | |

## שימוש בסיסי
```tsx
import { SparkLine } from "@tottemai/graphs"

<SparkLine data={[12, 18, 14, 22, 19, 28]} height={48} />
```

## קוד מלא
```tsx
// src/dashboard/SparkLine.tsx
"use client"
import { AreaChart, Area, LineChart, Line, ResponsiveContainer } from "recharts"
import { useChartTheme } from "../hooks/useChartTheme"

interface Props {
  data: number[]
  color?: string
  height?: number
  width?: number | string
  type?: "line" | "area"
}

export function SparkLine({ data, color, height = 48, width = "100%", type = "area" }: Props) {
  const t = useChartTheme()
  const fill = color ?? t.primary
  const chartData = data.map((v) => ({ v }))

  if (type === "line") {
    return (
      <ResponsiveContainer width={width} height={height}>
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="v" stroke={fill} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width={width} height={height}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="sl-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={fill} stopOpacity={0.3} />
            <stop offset="95%" stopColor={fill} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={fill} fill="url(#sl-grad)" strokeWidth={1.5} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
```

## בדיקות סיום
- [ ] מרנדר ללא axes
- [ ] `type="line"` ו-`type="area"` פועלים
- [ ] מתאים בצורה בתוך StatsCard
- [ ] מיוצא ב-src/index.ts

← [[../00 - Library Overview & Build Plan]]
