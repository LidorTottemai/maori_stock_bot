# Phase 3: Charts & Data Viz — ספריית גרפים

> **תלות:** Phase 1  
> **משך משוער:** כלול בPhase 1  
> **תוצר:** `src/charts/` מוכן ב-maori-ui

---

## הבחירה: Recharts

| ספרייה | יתרון | חיסרון | מתאים ל |
|--------|-------|---------|---------|
| **Recharts** ✅ | React-native, SVG, קל לtheme | custom מוגבל | 90% מהמקרים |
| Tremor | יפה מהקופסה | תלות Tailwind כבדה | dashboards |
| visx (AirBnB) | הכי גמיש | עקומת למידה גבוהה | מורכב |
| Nivo | יפה מאוד | SSR בעייתי | תצוגה בלבד |
| Victory | מגניב | bundle גדול | — |

**Recharts** = הכי קל לtheme עם CSS variables, bundle ~180KB, מעודכן ב-2024.

---

## Theming — CSS Variables בלבד

```tsx
// כל גרף מקבל צבעים מCSSvars — לא hardcoded אף פעם

// utils/chartTheme.ts
export const chartTheme = {
  primary:    "var(--color-primary)",
  secondary:  "var(--color-secondary)",
  accent:     "var(--color-accent)",
  muted:      "var(--color-text-muted)",
  bg:         "var(--color-surface)",
  text:       "var(--color-text)",
  border:     "var(--color-border)",
  grid:       "var(--color-border)",
}
```

---

## הרכיבים

### LineChart

```tsx
// src/charts/LineChart.tsx
import { LineChart as RC, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { chartTheme as t } from "../utils/chartTheme"

interface Props {
  data: { label: string; value: number }[]
  height?: number
  animate?: boolean
}

export function LineChart({ data, height = 300, animate = true }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RC data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
        <XAxis dataKey="label" tick={{ fill: t.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: t.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ backgroundColor: t.bg, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text }}
          cursor={{ stroke: t.primary, strokeWidth: 1, strokeDasharray: "4 4" }}
        />
        <Line dataKey="value" stroke={t.primary} strokeWidth={2} dot={false}
          isAnimationActive={animate} animationDuration={1000} />
      </RC>
    </ResponsiveContainer>
  )
}
```

### BarChart

```tsx
export function BarChart({ data, height = 300 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RC data={data} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
        <XAxis dataKey="label" tick={{ fill: t.muted }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: t.muted }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ backgroundColor: t.bg, border: `1px solid ${t.border}`, borderRadius: 8 }} />
        <Bar dataKey="value" fill={t.primary} radius={[6, 6, 0, 0]} isAnimationActive />
      </RC>
    </ResponsiveContainer>
  )
}
```

### PieChart

```tsx
export function PieChart({ data, height = 300 }: Props) {
  const COLORS = [t.primary, t.secondary, t.accent, t.muted]
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RC>
        <Pie data={data} dataKey="value" nameKey="label"
          cx="50%" cy="50%" innerRadius="40%" outerRadius="70%"
          paddingAngle={3} isAnimationActive>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: t.bg, border: `1px solid ${t.border}`, borderRadius: 8 }} />
        <Legend formatter={(v) => <span style={{ color: t.text }}>{v}</span>} />
      </RC>
    </ResponsiveContainer>
  )
}
```

### AreaChart

```tsx
export function AreaChart({ data, height = 300 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RC data={data}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={t.primary} stopOpacity={0.3} />
            <stop offset="95%" stopColor={t.primary} stopOpacity={0}   />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
        <XAxis dataKey="label" tick={{ fill: t.muted }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: t.muted }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ backgroundColor: t.bg, border: `1px solid ${t.border}`, borderRadius: 8 }} />
        <Area dataKey="value" stroke={t.primary} strokeWidth={2}
          fill="url(#areaGrad)" isAnimationActive />
      </RC>
    </ResponsiveContainer>
  )
}
```

### StatsCard — מספר + גרף מיני

```tsx
interface StatsCardProps {
  label: string
  value: string | number
  change?: number     // % שינוי (חיובי/שלילי)
  sparkData?: number[]
}

export function StatsCard({ label, value, change, sparkData }: StatsCardProps) {
  const isUp = (change ?? 0) >= 0
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
      <div className="mt-2 flex items-end justify-between">
        <span className="text-3xl font-bold text-[var(--color-text)]">{value}</span>
        {change !== undefined && (
          <span className={`text-sm font-medium ${isUp ? "text-green-400" : "text-red-400"}`}>
            {isUp ? "↑" : "↓"} {Math.abs(change)}%
          </span>
        )}
      </div>
      {sparkData && (
        <div className="mt-4 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLine data={sparkData.map((v, i) => ({ i, v }))} margin={{ top: 0, bottom: 0 }}>
              <Line dataKey="v" stroke={isUp ? "#22c55e" : "#ef4444"}
                strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </RechartsLine>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
```

---

## מתי גרפים משמשים באתרי תדמית?

```
✓ Stats section: "500+ לקוחות מרוצים | 8 שנות ניסיון | 99% שביעות רצון"
  → CountUp (מspring animation) + StatsCard עם sparkline

✓ About page: גדילה לאורך שנים
  → AreaChart מונפשת שמתגלה בscroll

✓ מסעדה: מנות פופולריות
  → BarChart

✗ רוב האתרים לא צריכים גרפים — CountUp מספיק לstats
```

---

## בדיקות סוף שלב

- [ ] `LineChart` מציג נתונים עם צבעים מCSS vars
- [ ] `BarChart` מאונימציה בכניסה לviewport
- [ ] `PieChart` עם legend בעברית
- [ ] `StatsCard` עם sparkline
- [ ] שינוי `--color-primary` משנה את כל הגרפים
- [ ] אין שגיאות SSR (Recharts + Next.js)
