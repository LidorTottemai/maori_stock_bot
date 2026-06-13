# useChartData

> **קטגוריה:** hooks
> **תלויות:** none
> **קוד:** src/hooks/useChartData.ts
> **עלות בנייה:** ~15 דקות

## מה זה
Helpers לעיבוד נתונים לפני הגרף — sort, filter, group, aggregate, format. מייתר boilerplate בכל קומפוננטה.

## API
```ts
function useChartData<T extends Record<string, unknown>>(
  rawData: T[],
  options?: {
    sortBy?: keyof T
    sortDir?: "asc" | "desc"
    limit?: number
    filterFn?: (item: T) => boolean
    groupBy?: keyof T
    aggregateKey?: keyof T
  }
): T[]

// Helpers נפרדים
function groupAndSum<T>(data: T[], groupKey: keyof T, sumKey: keyof T): { name: string; value: number }[]
function movingAverage(data: number[], window: number): number[]
function normalizeToPercent(data: number[]): number[]
function formatCurrency(value: number, currency?: string): string
function formatShortNumber(value: number): string  // 1200 → "1.2K"
```

## שימוש בסיסי
```tsx
import { useChartData, groupAndSum, formatShortNumber } from "@tottemai/graphs"

function RevenueChart({ rawOrders }) {
  // מקבץ לפי חודש וסוכם הכנסה
  const data = groupAndSum(rawOrders, "month", "amount")

  // ממוין ומוגבל ל-12 חודשים אחרונים
  const processed = useChartData(data, { sortBy: "name", limit: 12 })

  return <LineChart data={processed} lines={[{ key: "value", label: "הכנסה" }]} />
}
```

## קוד מלא
```ts
// src/hooks/useChartData.ts
import { useMemo } from "react"

interface Options<T> {
  sortBy?: keyof T
  sortDir?: "asc" | "desc"
  limit?: number
  filterFn?: (item: T) => boolean
  groupBy?: keyof T
  aggregateKey?: keyof T
}

export function useChartData<T extends Record<string, unknown>>(
  rawData: T[],
  options: Options<T> = {},
): T[] {
  return useMemo(() => {
    let result = [...rawData]
    if (options.filterFn) result = result.filter(options.filterFn)
    if (options.sortBy) {
      result.sort((a, b) => {
        const av = a[options.sortBy!], bv = b[options.sortBy!]
        const cmp = av < bv ? -1 : av > bv ? 1 : 0
        return options.sortDir === "desc" ? -cmp : cmp
      })
    }
    if (options.limit) result = result.slice(0, options.limit)
    return result
  }, [rawData, options.sortBy, options.sortDir, options.limit, options.filterFn])
}

export function groupAndSum<T extends Record<string, unknown>>(
  data: T[],
  groupKey: keyof T,
  sumKey: keyof T,
): { name: string; value: number }[] {
  const map = new Map<string, number>()
  data.forEach((item) => {
    const key = String(item[groupKey])
    map.set(key, (map.get(key) ?? 0) + Number(item[sumKey]))
  })
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
}

export function movingAverage(data: number[], window: number): number[] {
  return data.map((_, i) => {
    const slice = data.slice(Math.max(0, i - window + 1), i + 1)
    return slice.reduce((s, v) => s + v, 0) / slice.length
  })
}

export function normalizeToPercent(data: number[]): number[] {
  const total = data.reduce((s, v) => s + v, 0)
  return total === 0 ? data.map(() => 0) : data.map((v) => Math.round((v / total) * 100))
}

export function formatCurrency(value: number, currency = "₪"): string {
  return `${currency}${value.toLocaleString("he-IL")}`
}

export function formatShortNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return String(value)
}
```

## בדיקות סיום
- [ ] sortBy + sortDir עובד
- [ ] filterFn מסנן נכון
- [ ] groupAndSum מקבץ
- [ ] movingAverage מחשב נכון
- [ ] formatShortNumber: 1200→"1.2K", 1500000→"1.5M"
- [ ] מיוצא ב-src/index.ts

← [[../00 - Library Overview & Build Plan]]
