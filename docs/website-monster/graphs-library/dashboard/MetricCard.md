# MetricCard

> **קטגוריה:** dashboard
> **תלויות:** none
> **קוד:** src/dashboard/MetricCard.tsx
> **עלות בנייה:** ~10 דקות

## מה זה
כרטיס KPI מינימלי — ערך + label + icon + trend. ללא גרף. מתאים לgrid של מספרים בולטים.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | `string` | required | |
| value | `string \| number` | required | |
| icon | `React.ReactNode` | `undefined` | icon בפינה |
| trend | `"up" \| "down" \| "neutral"` | `"neutral"` | חץ צבעוני |
| trendLabel | `string` | `undefined` | "לעומת חודש שעבר" |
| accent | `boolean` | `false` | border צבעוני |

## שימוש בסיסי
```tsx
import { MetricCard } from "@tottemai/graphs"
import { Users } from "lucide-react"

<MetricCard
  title="לקוחות פעילים"
  value="1,248"
  icon={<Users size={20} />}
  trend="up"
  trendLabel="+8% החודש"
/>
```

## קוד מלא
```tsx
// src/dashboard/MetricCard.tsx
import { cn } from "@tottemai/ui"

const trendConfig = {
  up:      { arrow: "↑", color: "text-green-500" },
  down:    { arrow: "↓", color: "text-red-500" },
  neutral: { arrow: "→", color: "text-[var(--color-text-muted)]" },
}

interface Props {
  title: string
  value: string | number
  icon?: React.ReactNode
  trend?: "up" | "down" | "neutral"
  trendLabel?: string
  accent?: boolean
  className?: string
}

export function MetricCard({ title, value, icon, trend = "neutral", trendLabel, accent, className }: Props) {
  const { arrow, color } = trendConfig[trend]

  return (
    <div className={cn(
      "rounded-2xl border bg-[var(--color-surface)] p-6",
      accent ? "border-[var(--color-primary)]" : "border-[var(--color-border)]",
      className,
    )}>
      <div className="flex items-start justify-between">
        <p className="text-sm text-[var(--color-text-muted)]">{title}</p>
        {icon && <span className="text-[var(--color-text-muted)]">{icon}</span>}
      </div>
      <p className="mt-2 text-3xl font-bold text-[var(--color-text)]">{value}</p>
      {trendLabel && (
        <p className={cn("mt-1 text-sm font-medium", color)}>
          {arrow} {trendLabel}
        </p>
      )}
    </div>
  )
}
```

## בדיקות סיום
- [ ] icon מוצג בפינה
- [ ] trend up/down/neutral בצבעים נכונים
- [ ] accent border
- [ ] RTL תמיכה
- [ ] מיוצא ב-src/index.ts

← [[../00 - Library Overview & Build Plan]]
