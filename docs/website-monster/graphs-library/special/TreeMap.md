# TreeMap

> **קטגוריה:** special
> **תלויות:** recharts ^3
> **קוד:** src/special/TreeMap.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
מפת עצים — היררכיה בריבועים לפי גודל. שימוש: התפלגות הכנסות לפי קטגוריה, שיתוף שוק.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `TreeMapDatum[]` | required | |
| height | `number` | `350` | |
| showValues | `boolean` | `true` | ערכים בתוך הריבועים |

```ts
interface TreeMapDatum {
  name: string
  value: number
  children?: TreeMapDatum[]
  color?: string
}
```

## שימוש בסיסי
```tsx
import { TreeMap } from "@tottemai/graphs"

<TreeMap
  data={[
    { name: "עיסוי", value: 45000 },
    { name: "פציאל", value: 32000 },
    { name: "מניקור", value: 18000 },
    { name: "קוסמטיקה", value: 12000 },
  ]}
/>
```

## קוד מלא
```tsx
// src/special/TreeMap.tsx
"use client"
import { Treemap, ResponsiveContainer, Tooltip } from "recharts"
import { useChartTheme } from "../hooks/useChartTheme"

interface TreeMapDatum { name: string; value: number; children?: TreeMapDatum[]; color?: string }

interface Props {
  data: TreeMapDatum[]
  height?: number
  showValues?: boolean
}

function CustomContent({ root, depth, x, y, width, height, name, value, colors }: any) {
  if (width < 30 || height < 20) return null
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={4}
        fill={colors[depth % colors.length]} stroke="var(--color-bg)" strokeWidth={2} />
      {width > 60 && height > 30 && (
        <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle"
          fontSize={Math.min(14, width / 8)} fill="white" fontWeight={600}>
          {name}
        </text>
      )}
      {showValues && width > 60 && height > 40 && (
        <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle"
          fontSize={Math.min(12, width / 10)} fill="rgba(255,255,255,0.75)">
          {value?.toLocaleString("he-IL")}
        </text>
      )}
    </g>
  )
}

export function TreeMap({ data, height = 350, showValues = true }: Props) {
  const t = useChartTheme()
  const colors = t.series

  return (
    <ResponsiveContainer width="100%" height={height}>
      <Treemap
        data={data}
        dataKey="value"
        aspectRatio={4 / 3}
        content={<CustomContent colors={colors} showValues={showValues} />}
      >
        <Tooltip contentStyle={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text }} />
      </Treemap>
    </ResponsiveContainer>
  )
}
```

## בדיקות סיום
- [ ] ריבועים לפי גודל value
- [ ] שמות + ערכים בתוך ריבועים גדולים
- [ ] Tooltip
- [ ] צבעי series
- [ ] מיוצא ב-src/index.ts

← [[../00 - Library Overview & Build Plan]]
