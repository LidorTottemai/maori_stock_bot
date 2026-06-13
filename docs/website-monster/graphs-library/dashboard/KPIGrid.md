# KPIGrid

> **קטגוריה:** dashboard
> **תלויות:** MetricCard (מאותה ספרייה)
> **קוד:** src/dashboard/KPIGrid.tsx
> **עלות בנייה:** ~10 דקות

## מה זה
Grid אוטומטי של MetricCards — מקבל רשימה ומציג ב-responsive grid. הכניסה לכל כרטיס מאנימה עם stagger.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| metrics | `MetricCardProps[]` | required | רשימת KPIs |
| cols | `2 \| 3 \| 4` | `4` | עמודות בdesktop |
| animate | `boolean` | `true` | stagger reveal |

## שימוש בסיסי
```tsx
import { KPIGrid } from "@tottemai/graphs"

<KPIGrid
  cols={4}
  metrics={[
    { title: "הזמנות החודש", value: 148, trend: "up", trendLabel: "+12%" },
    { title: "לקוחות חדשים", value: 34, trend: "up", trendLabel: "+5%" },
    { title: "ביטולים", value: 8, trend: "down", trendLabel: "-2%" },
    { title: "הכנסה ממוצעת", value: "₪286", trend: "neutral" },
  ]}
/>
```

## קוד מלא
```tsx
// src/dashboard/KPIGrid.tsx
"use client"
import { motion } from "motion/react"
import { MetricCard } from "./MetricCard"
import type { ComponentProps } from "react"

type MetricCardProps = ComponentProps<typeof MetricCard>

interface Props {
  metrics: MetricCardProps[]
  cols?: 2 | 3 | 4
  animate?: boolean
}

const colsClass = { 2: "grid-cols-1 sm:grid-cols-2", 3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", 4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" }

export function KPIGrid({ metrics, cols = 4, animate = true }: Props) {
  return (
    <div className={`grid gap-4 ${colsClass[cols]}`}>
      {metrics.map((m, i) =>
        animate ? (
          <motion.div
            key={m.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
          >
            <MetricCard {...m} />
          </motion.div>
        ) : (
          <MetricCard key={m.title} {...m} />
        ),
      )}
    </div>
  )
}
```

## בדיקות סיום
- [ ] cols=2/3/4 פועלים
- [ ] Stagger animation
- [ ] Responsive בmobile
- [ ] מיוצא ב-src/index.ts

← [[../00 - Library Overview & Build Plan]]
