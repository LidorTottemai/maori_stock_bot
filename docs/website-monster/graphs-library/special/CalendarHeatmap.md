# CalendarHeatmap

> **קטגוריה:** special
> **תלויות:** date-fns (כבר בפרויקט)
> **קוד:** src/special/CalendarHeatmap.tsx
> **עלות בנייה:** ~30 דקות

## מה זה
לוח שנה GitHub-style — שנה שלמה של ריבועים צבועים לפי פעילות. שימוש: ימי הזמנות, פעילות משתמשים, logs.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `{ date: string; value: number }[]` | required | `date: "YYYY-MM-DD"` |
| year | `number` | `new Date().getFullYear()` | |
| colorRange | `string[]` | `["--color-surface-2", "--color-primary"]` | 5 גוונים |
| showMonthLabels | `boolean` | `true` | |
| showDayLabels | `boolean` | `true` | א-ש |
| cellSize | `number` | `12` | |
| cellGap | `number` | `2` | |

## שימוש בסיסי
```tsx
import { CalendarHeatmap } from "@tottemai/graphs"

<CalendarHeatmap
  data={bookingsPerDay}  // [{ date: "2025-03-15", value: 8 }, ...]
  year={2025}
/>
```

## קוד מלא
```tsx
// src/special/CalendarHeatmap.tsx
"use client"
import { useMemo, useState } from "react"
import {
  eachDayOfInterval, startOfYear, endOfYear,
  startOfWeek, format, getDay,
} from "date-fns"
import { he } from "date-fns/locale"
import { useChartTheme } from "../hooks/useChartTheme"
import { cn } from "@tottemai/ui"

interface Props {
  data: { date: string; value: number }[]
  year?: number
  showMonthLabels?: boolean
  showDayLabels?: boolean
  cellSize?: number
  cellGap?: number
}

const DAY_LABELS = ["א׳", "", "ג׳", "", "ה׳", "", "ש׳"]
const LEVELS = 5

function getColorLevel(value: number, max: number): number {
  if (value === 0) return 0
  return Math.ceil((value / max) * (LEVELS - 1))
}

export function CalendarHeatmap({
  data, year = new Date().getFullYear(),
  showMonthLabels = true, showDayLabels = true,
  cellSize = 12, cellGap = 2,
}: Props) {
  const t = useChartTheme()
  const [tooltip, setTooltip] = useState<{ date: string; value: number; x: number; y: number } | null>(null)

  const valueMap = useMemo(() => {
    const m: Record<string, number> = {}
    data.forEach(({ date, value }) => { m[date] = value })
    return m
  }, [data])

  const maxValue = useMemo(() => Math.max(0, ...data.map((d) => d.value)), [data])

  const days = eachDayOfInterval({ start: startOfYear(new Date(year, 0)), end: endOfYear(new Date(year, 0)) })

  // padding: start from Sunday of the week containing Jan 1
  const firstDay = days[0]
  const startDayOfWeek = getDay(firstDay)  // 0=Sun
  const paddedDays = Array(startDayOfWeek).fill(null).concat(days)

  const weeks: (Date | null)[][] = []
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7))
  }

  const step = cellSize + cellGap
  const svgWidth = weeks.length * step + (showDayLabels ? 24 : 0)
  const svgHeight = 7 * step + (showMonthLabels ? 18 : 0)

  const colors = [
    "var(--color-surface-2)",
    `color-mix(in oklch, var(--color-primary) 25%, var(--color-surface-2))`,
    `color-mix(in oklch, var(--color-primary) 50%, var(--color-surface-2))`,
    `color-mix(in oklch, var(--color-primary) 75%, var(--color-surface-2))`,
    "var(--color-primary)",
  ]

  const offsetX = showDayLabels ? 24 : 0
  const offsetY = showMonthLabels ? 18 : 0

  return (
    <div className="relative overflow-x-auto">
      <svg width={svgWidth} height={svgHeight}>
        {showDayLabels && DAY_LABELS.map((label, i) => (
          label ? (
            <text key={i} x={0} y={offsetY + i * step + cellSize * 0.75}
              fontSize={9} fill={t.muted} textAnchor="start">
              {label}
            </text>
          ) : null
        ))}

        {showMonthLabels && weeks.map((week, wi) => {
          const firstDate = week.find(Boolean) as Date | undefined
          if (!firstDate || firstDate.getDate() > 7) return null
          return (
            <text key={wi} x={offsetX + wi * step} y={12}
              fontSize={9} fill={t.muted}>
              {format(firstDate, "MMM", { locale: he })}
            </text>
          )
        })}

        {weeks.map((week, wi) =>
          week.map((day, di) => {
            if (!day) return null
            const dateStr = format(day, "yyyy-MM-dd")
            const value = valueMap[dateStr] ?? 0
            const level = getColorLevel(value, maxValue)
            return (
              <rect
                key={dateStr}
                x={offsetX + wi * step}
                y={offsetY + di * step}
                width={cellSize}
                height={cellSize}
                rx={2}
                fill={colors[level]}
                onMouseEnter={(e) => setTooltip({ date: dateStr, value, x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setTooltip(null)}
              />
            )
          }),
        )}
      </svg>

      {tooltip && (
        <div className="pointer-events-none fixed z-50 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-text)] shadow-lg"
          style={{ left: tooltip.x + 8, top: tooltip.y - 36 }}>
          <strong>{tooltip.date}</strong>: {tooltip.value} הזמנות
        </div>
      )}
    </div>
  )
}
```

## בדיקות סיום
- [ ] שנה שלמה מוצגת
- [ ] ריבועים ריקים ≠ ריבועים עם value=0
- [ ] Tooltip עם תאריך + ערך
- [ ] חודשים בעברית
- [ ] ימי שבוע (א-ש)
- [ ] Horizontal scroll במובייל
- [ ] מיוצא ב-src/index.ts

← [[../00 - Library Overview & Build Plan]]
