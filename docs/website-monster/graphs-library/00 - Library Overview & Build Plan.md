# 📊 `@tottemai/graphs` — Library Overview & Build Plan

> **Package:** `@tottemai/graphs`
> **Repo:** `github:LidorTottemai/tottemai-graphs#main`
> **מנוע:** Recharts v3 (ראשי) + visx primitives (מיוחדים) + custom SVG
> **תלויות עמית:** `@tottemai/ui` (CSS variables, CountUp, cn)
> **סה"כ רכיבים:** 23

---

## למה Recharts v3?

| ספרייה | stars | weekly DL | CSS vars | אנימציה | bundle | SSR |
|--------|-------|-----------|----------|---------|--------|-----|
| **Recharts v3 ✅** | 25K | **50M** | עם wrapper | ✅ מובנה | ~150KB | ✅ |
| Nivo | 13K | 3.7K | ✅ מצויין | ✅ עשיר | 500KB+ | ✅ |
| visx | 20K | 39K | ✅ מלא | DIY | 15KB/pkg | ✅ |
| ECharts | 63K | גדל | config | ✅ עשיר | 1.8MB | ✅ |
| Victory | 11K | 465K | מוגבל | ✅ טוב | 190KB | ✅ |

**Recharts v3 ניצח:** הכי נפוץ + TypeScript מלא + theming פשוט עם `chartTheme` wrapper.  
**Nivo/visx** — שמורים לגרפים מיוחדים (HeatMap, TreeMap, CalendarHeatmap).

---

## שיטת התקנה

```json
// package.json
{
  "dependencies": {
    "@tottemai/graphs": "github:LidorTottemai/tottemai-graphs#main",
    "@tottemai/ui": "github:LidorTottemai/tottemai-ui#main",
    "recharts": "^3",
    "@visx/heatmap": "^3",
    "@visx/scale": "^3",
    "react-simple-maps": "^3",
    "d3-scale": "^4"
  }
}
```

```ts
// next.config.mjs
transpilePackages: ["@tottemai/graphs", "@tottemai/ui"]
```

---

## מבנה הספרייה

```
tottemai-graphs/
├── package.json
├── src/
│   ├── index.ts               ← re-export הכל
│   ├── _theme.ts              ← chartTheme מ-CSS variables
│   │
│   ├── charts/                📈 8 גרפים סטנדרטיים
│   │   ├── LineChart.tsx      קו יחיד/מרובה
│   │   ├── BarChart.tsx       אנכי + אופקי + stacked
│   │   ├── AreaChart.tsx      area + stacked area
│   │   ├── PieChart.tsx       עם legend + label
│   │   ├── DonutChart.tsx     donut + centerLabel
│   │   ├── ScatterPlot.tsx    XY scatter
│   │   ├── RadarChart.tsx     spider/radar
│   │   └── ComposedChart.tsx  bar + line משולב
│   │
│   ├── dashboard/             🗂️ 6 רכיבי דשבורד
│   │   ├── StatsCard.tsx      ערך + שינוי% + sparkline
│   │   ├── MetricCard.tsx     KPI בולט + trend arrow
│   │   ├── SparkLine.tsx      גרף קו מיני (ללא axes)
│   │   ├── KPIGrid.tsx        grid של MetricCards
│   │   ├── ProgressRing.tsx   עיגול התקדמות SVG
│   │   └── ActivityFeed.tsx   timeline של פעולות
│   │
│   ├── special/               ✨ 6 גרפים מתקדמים
│   │   ├── GaugeChart.tsx     מד מהירות SVG
│   │   ├── HeatMap.tsx        ריבועי צבע (visx)
│   │   ├── TreeMap.tsx        היררכיה (recharts)
│   │   ├── FunnelChart.tsx    funnel מכירות (recharts)
│   │   ├── CalendarHeatmap.tsx GitHub-style contributions
│   │   └── BubbleMap.tsx      מפה גאוגרפית + עיגולים (react-simple-maps)
│   │
│   └── hooks/                 🪝 3 hooks
│       ├── useChartTheme.ts   CSS vars → chartTheme object
│       ├── useChartData.ts    sort / filter / format helpers
│       └── useChartResize.ts  ResizeObserver → { width, height }
```

---

## עיקרון הצבעים — CSS Variables

```ts
// src/_theme.ts
export function useChartTheme() {
  return {
    primary:   "var(--color-primary)",
    secondary: "var(--color-secondary)",
    accent:    "var(--color-accent)",
    muted:     "var(--color-text-muted)",
    surface:   "var(--color-surface)",
    border:    "var(--color-border)",
    text:      "var(--color-text)",
    // סדרות מרובות — גרסאות בהירות יותר של primary/secondary
    series: [
      "var(--color-primary)",
      "var(--color-secondary)",
      "var(--color-accent)",
      "oklch(from var(--color-primary) l c calc(h + 60))",
      "oklch(from var(--color-secondary) l c calc(h + 60))",
    ],
  }
}
```

---

## אינדקס רכיבים

### charts/
| קובץ | תיאור | תלויות |
|------|-------|--------|
| [[charts/LineChart]] | קו + מרובה קווים | recharts |
| [[charts/BarChart]] | אנכי / אופקי / stacked | recharts |
| [[charts/AreaChart]] | area + stacked | recharts |
| [[charts/PieChart]] | עוגה עם legend | recharts |
| [[charts/DonutChart]] | donut + centerLabel | recharts |
| [[charts/ScatterPlot]] | XY scatter | recharts |
| [[charts/RadarChart]] | spider chart | recharts |
| [[charts/ComposedChart]] | bar + line משולב | recharts |

### dashboard/
| קובץ | תיאור | תלויות |
|------|-------|--------|
| [[dashboard/StatsCard]] | ערך + % שינוי + sparkline | recharts, @tottemai/ui/CountUp |
| [[dashboard/MetricCard]] | KPI בולט + חץ trend | none |
| [[dashboard/SparkLine]] | גרף מיני ללא axes | recharts |
| [[dashboard/KPIGrid]] | grid של MetricCards | MetricCard |
| [[dashboard/ProgressRing]] | עיגול % SVG | none |
| [[dashboard/ActivityFeed]] | timeline פעולות | @tottemai/ui/Timeline |

### special/
| קובץ | תיאור | תלויות |
|------|-------|--------|
| [[special/GaugeChart]] | מד מהירות SVG | none |
| [[special/HeatMap]] | ריבועי אינטנסיביות | @visx/heatmap |
| [[special/TreeMap]] | היררכיה בריבועים | recharts |
| [[special/FunnelChart]] | funnel מכירות | recharts |
| [[special/CalendarHeatmap]] | contribution calendar | custom SVG |
| [[special/BubbleMap]] | מפה גאוגרפית + עיגולי נתונים | react-simple-maps, d3-scale |

### hooks/
| קובץ | תיאור |
|------|-------|
| [[hooks/useChartTheme]] | CSS vars → object שמשמש לכל הגרפים |
| [[hooks/useChartData]] | sort/filter/normalize/format helpers |
| [[hooks/useChartResize]] | ResizeObserver → { width, height } |

---

## CSS variables נדרשים (מ-@tottemai/ui)

```css
/* כל משתני הצבע כבר מוגדרים ב-@tottemai/ui globals.css */
--color-primary, --color-secondary, --color-accent
--color-surface, --color-border
--color-text, --color-text-muted
```

---

## שימוש בסיסי

```tsx
import { LineChart, StatsCard, DonutChart } from "@tottemai/graphs"

// בדף admin dashboard
<StatsCard title="הכנסות החודש" value={42500} change={+12.3} currency="₪" />
<LineChart data={revenueData} lines={[{ key: "revenue", label: "הכנסה" }]} />
<DonutChart data={categoryData} centerLabel="סה״כ" />
```

---

## בדיקות סיום

- [ ] כל 8 גרפי charts מרנדרים עם data
- [ ] CSS variables: החלפת `--color-primary` משנה צבע בכל הגרפים
- [ ] SSR: אין crash ב-`use server` context (כל גרף מסומן `"use client"`)
- [ ] Responsive: `ResponsiveContainer` פועל בכל breakpoints
- [ ] Dark/Light mode: הגרפים נראים טוב בשני המצבים
- [ ] StatsCard עם CountUp + sparkline פועל
- [ ] CalendarHeatmap מציג נתונים שנתיים
- [ ] BubbleMap: עיגולים על מפת עולם + ישראל, tooltip בhover
- [ ] מיוצא ב-src/index.ts

← [[../00 - Vision & Architecture]]
