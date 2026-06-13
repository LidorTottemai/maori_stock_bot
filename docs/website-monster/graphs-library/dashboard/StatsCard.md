# StatsCard

> **קטגוריה:** dashboard
> **תלויות:** recharts ^3, @tottemai/ui (CountUp)
> **קוד:** src/dashboard/StatsCard.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
כרטיס KPI — ערך גדול + % שינוי + sparkline קטן. הרכיב הנפוץ ביותר בדשבורד.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Positive Change | חץ ירוק ↑ |
| Negative Change | חץ אדום ↓ |
| No Sparkline | ערך בלבד |
| Currency | prefix ₪ |
| Loading | Skeleton |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | `string` | required | |
| value | `number` | required | הערך הנוכחי |
| change | `number` | `undefined` | % שינוי (+12.3 / -4.1) |
| sparklineData | `number[]` | `[]` | ערכים לגרף מיני |
| prefix | `string` | `""` | `"₪"` / `"$"` |
| suffix | `string` | `""` | `"%" / "יחידות"` |
| animate | `boolean` | `true` | CountUp animation |

## שימוש בסיסי
```tsx
import { StatsCard } from "@tottemai/graphs"

<StatsCard
  title="הכנסות החודש"
  value={42500}
  change={+12.3}
  prefix="₪"
  sparklineData={[28000, 31000, 35000, 29000, 38000, 42500]}
/>
```

## קוד מלא
```tsx
// src/dashboard/StatsCard.tsx
"use client"
import { useEffect, useRef, useState } from "react"
import { AreaChart, Area, ResponsiveContainer } from "recharts"
import { useChartTheme } from "../hooks/useChartTheme"
import { cn } from "@tottemai/ui"

interface Props {
  title: string
  value: number
  change?: number
  sparklineData?: number[]
  prefix?: string
  suffix?: string
  animate?: boolean
  className?: string
}

function CountUp({ to, prefix = "", suffix = "" }: { to: number; prefix?: string; suffix?: string }) {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    let start = 0
    const duration = 1500
    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setCurrent(Math.floor(ease * to))
      if (progress < 1) requestAnimationFrame(step)
      else setCurrent(to)
    }
    requestAnimationFrame(step)
  }, [to])
  return <>{prefix}{current.toLocaleString("he-IL")}{suffix}</>
}

export function StatsCard({
  title, value, change, sparklineData = [], prefix = "", suffix = "", animate = true, className,
}: Props) {
  const t = useChartTheme()
  const isPositive = (change ?? 0) >= 0
  const sparkData = sparklineData.map((v) => ({ v }))

  return (
    <div className={cn(
      "rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6",
      className,
    )}>
      <p className="text-sm text-[var(--color-text-muted)]">{title}</p>

      <div className="mt-2 flex items-end justify-between gap-4">
        <div>
          <p className="text-3xl font-bold text-[var(--color-text)] tabular-nums">
            {animate ? <CountUp to={value} prefix={prefix} suffix={suffix} /> : `${prefix}${value.toLocaleString("he-IL")}${suffix}`}
          </p>
          {change !== undefined && (
            <span className={cn(
              "mt-1 inline-flex items-center gap-1 text-sm font-medium",
              isPositive ? "text-green-500" : "text-red-500",
            )}>
              {isPositive ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
            </span>
          )}
        </div>

        {sparkData.length > 0 && (
          <div className="h-14 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData}>
                <defs>
                  <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={t.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={t.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke={t.primary} fill="url(#sg)" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
```

## בדיקות סיום
- [ ] CountUp מאנים מ-0 לvalue
- [ ] change חיובי → ירוק, שלילי → אדום
- [ ] Sparkline מוצג
- [ ] prefix/suffix נכון (₪, %)
- [ ] Loading Skeleton variant
- [ ] מיוצא ב-src/index.ts

← [[../00 - Library Overview & Build Plan]]
