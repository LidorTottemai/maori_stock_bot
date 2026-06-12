# 📊 Phase 3 — Charts & Data Viz

> **מטרה:** ספריית גרפים גנרית שמקבלת צבעים דרך CSS variables.
> **בחירה:** Recharts (SVG-based, React-native, קל לtheme)

---

## למה Recharts?

| ספרייה | יתרון | חיסרון |
|--------|-------|---------|
| **Recharts ✅** | SVG, React-native, קל לtheme | custom מוגבל |
| Tremor | מכוון dashboards | Tailwind בלבד, תלות כבדה |
| Victory | גמיש | bundle גדול |
| visx (AirBnB) | הכי גמיש | עקומת למידה גבוהה |
| Nivo | יפה מאוד | SSR בעייתי |

---

## Theming עם CSS Variables

```tsx
// src/charts/_theme.ts
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
import { chartTheme as t } from "./_theme"

export function LineChart({ data, dataKey, label }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RC data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
        <XAxis dataKey="name" tick={{ fill: t.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: t.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8 }}
          labelStyle={{ color: t.text }}
        />
        <Line type="monotone" dataKey={dataKey} stroke={t.primary} strokeWidth={2} dot={false} />
      </RC>
    </ResponsiveContainer>
  )
}
```

### BarChart, AreaChart, PieChart — אותו pattern עם chartTheme

### StatsCard — מספר + sparkline
```tsx
export function StatsCard({ title, value, change, data }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <p className="text-[var(--color-text-muted)] text-sm">{title}</p>
      <div className="flex items-end gap-4 mt-2">
        <CountUp to={value} className="text-display-lg text-[var(--color-text)]" />
        <span className={change > 0 ? "text-green-400" : "text-red-400"}>
          {change > 0 ? "↑" : "↓"} {Math.abs(change)}%
        </span>
      </div>
      <AreaChart data={data} dataKey="v" className="mt-4 h-16" />
    </div>
  )
}
```

---

## שימוש באתרי תדמית

גרפים מופיעים ב:
1. **דף stats/about** — "150 לקוחות מרוצים", "8 שנות ניסיון" → CountUp
2. **דף services** — עמודות שירותים עם מחיר
3. **admin dashboard** (לעסק עצמו) — הזמנות, הכנסות

---

## בדיקות סיום שלב 3

- [ ] LineChart מציג נתונים
- [ ] כל הצבעים משתנים עם CSS variables (בדוק עם dark/light mode)
- [ ] StatsCard עם CountUp + sparkline
- [ ] PieChart עם legend
- [ ] SSR לא קורס (use client בכל גרף)
- [ ] Recharts bundle: ≤ 200KB gzipped
