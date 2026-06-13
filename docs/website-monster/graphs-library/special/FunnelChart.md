# FunnelChart

> **קטגוריה:** special
> **תלויות:** recharts ^3
> **קוד:** src/special/FunnelChart.tsx
> **עלות בנייה:** ~15 דקות

## מה זה
גרף funnel — מראה כמה נשאר בכל שלב של תהליך. שימוש: funnel מכירות, שלבי הרשמה, conversion.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `{ name: string; value: number; color?: string }[]` | required | |
| height | `number` | `300` | |
| showPercent | `boolean` | `true` | % מהשלב הראשון |

## שימוש בסיסי
```tsx
import { FunnelChart } from "@tottemai/graphs"

<FunnelChart
  data={[
    { name: "ביקורים", value: 1000 },
    { name: "פנו אלינו", value: 420 },
    { name: "קיבלו הצעה", value: 180 },
    { name: "סגרו עסקה", value: 85 },
  ]}
/>
```

## קוד מלא
```tsx
// src/special/FunnelChart.tsx
"use client"
import { FunnelChart as RC, Funnel, Tooltip, LabelList, ResponsiveContainer, Cell } from "recharts"
import { useChartTheme } from "../hooks/useChartTheme"

interface FunnelDatum { name: string; value: number; color?: string }

interface Props {
  data: FunnelDatum[]
  height?: number
  showPercent?: boolean
}

export function FunnelChart({ data, height = 300, showPercent = true }: Props) {
  const t = useChartTheme()
  const maxVal = data[0]?.value ?? 1

  const enriched = data.map((d, i) => ({
    ...d,
    fill: d.color ?? t.series[i % t.series.length],
    pct: Math.round((d.value / maxVal) * 100),
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RC>
        <Tooltip
          contentStyle={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text }}
          formatter={(value: number, name: string, props: any) => [
            `${value.toLocaleString("he-IL")}${showPercent ? ` (${props.payload.pct}%)` : ""}`,
            name,
          ]}
        />
        <Funnel dataKey="value" data={enriched} isAnimationActive>
          {enriched.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
          <LabelList
            position="center"
            content={({ x, y, width, height, value, index }: any) => (
              <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={13} fontWeight={600}>
                {enriched[index]?.name}
                {showPercent ? ` ${enriched[index]?.pct}%` : ""}
              </text>
            )}
          />
        </Funnel>
      </RC>
    </ResponsiveContainer>
  )
}
```

## בדיקות סיום
- [ ] שלבים מתצמצמים כלפי מטה
- [ ] % מהשלב הראשון מוצג
- [ ] Tooltip
- [ ] מיוצא ב-src/index.ts

← [[../00 - Library Overview & Build Plan]]
