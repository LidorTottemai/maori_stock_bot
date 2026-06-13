# BubbleMap

> **קטגוריה:** special
> **תלויות:** react-simple-maps ^3, d3-scale ^4
> **קוד:** src/special/BubbleMap.tsx
> **עלות בנייה:** ~30 דקות

## מה זה
מפה גאוגרפית SVG עם עיגולים בגדלים שונים לפי ערך — bubble map. שימוש: מיקומי לקוחות/סניפים, מכירות לפי אזור, נפח פעילות גאוגרפי. תומך מפת עולם ומפת ישראל. Hover מציג tooltip עם label + ערך.

**למה react-simple-maps:**
- SVG-based → CSS variables עובדות, אפשר לסטייל
- אין API key → שולחים לכל לקוח ללא הגדרה
- TopoJSON/GeoJSON → תומך מפת עולם + ישראל
- העיגולים = SVG `<circle>` שממוקמים עם הprojection — פשוט

## Variants / Stories
| Story | תיאור |
|-------|-------|
| World Map | מפת עולם עם עיגולים בערים עולמיות |
| Israel Map | מפת ישראל עם ערים + נפח לקוחות |
| Single Color | כל העיגולים בצבע primary |
| Gradient Color | צבע משתנה לפי ערך (חלש→חזק) |
| Custom Tooltip | tooltip עם sublabel |
| Dark Mode | מפה כהה עם עיגולים בהירים |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `BubblePoint[]` | required | נקודות על המפה |
| map | `"world" \| "israel" \| string` | `"world"` | preset או URL ל-TopoJSON |
| maxBubbleRadius | `number` | `40` | רדיוס מקסימלי בpx |
| minBubbleRadius | `number` | `4` | רדיוס מינימלי |
| colorMode | `"single" \| "gradient"` | `"single"` | צבע אחד / gradient לפי ערך |
| height | `number` | `500` | גובה הmap |
| projectionConfig | `{ scale?: number; center?: [number, number] }` | תלוי במפה | zoom ומרכז |
| showTooltip | `boolean` | `true` | |
| onBubbleClick | `(point: BubblePoint) => void` | `undefined` | click handler |

```ts
interface BubblePoint {
  lat: number
  lng: number
  value: number         // קובע גודל העיגול
  label: string         // שם — מוצג ב-tooltip
  sublabel?: string     // פרטים נוספים — מוצגים ב-tooltip
  color?: string        // override לצבע של עיגול ספציפי
}
```

## שימוש בסיסי
```tsx
import { BubbleMap } from "@tottemai/graphs"

// מפת ישראל — מיקומי לקוחות
<BubbleMap
  map="israel"
  data={[
    { lat: 32.0853, lng: 34.7818, value: 450, label: "תל אביב", sublabel: "450 לקוחות" },
    { lat: 31.7683, lng: 35.2137, value: 280, label: "ירושלים", sublabel: "280 לקוחות" },
    { lat: 32.7940, lng: 34.9896, value: 190, label: "חיפה", sublabel: "190 לקוחות" },
    { lat: 31.2527, lng: 34.7915, value: 120, label: "באר שבע", sublabel: "120 לקוחות" },
    { lat: 29.5577, lng: 34.9519, value: 45,  label: "אילת", sublabel: "45 לקוחות" },
  ]}
/>

// מפת עולם — מכירות בינלאומיות
<BubbleMap
  map="world"
  colorMode="gradient"
  data={salesByCity}
/>
```

## קוד מלא
```tsx
// src/special/BubbleMap.tsx
"use client"
import { useState, useCallback } from "react"
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"
import { scaleSqrt, scaleLinear } from "d3-scale"
import { useChartTheme } from "../hooks/useChartTheme"

export interface BubblePoint {
  lat: number
  lng: number
  value: number
  label: string
  sublabel?: string
  color?: string
}

interface ProjectionConfig {
  scale?: number
  center?: [number, number]
}

interface Props {
  data: BubblePoint[]
  map?: "world" | "israel" | string
  maxBubbleRadius?: number
  minBubbleRadius?: number
  colorMode?: "single" | "gradient"
  height?: number
  projectionConfig?: ProjectionConfig
  showTooltip?: boolean
  onBubbleClick?: (point: BubblePoint) => void
}

// TopoJSON/GeoJSON presets
const MAP_URLS: Record<string, string> = {
  world: "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
  israel: "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson",
}

// projectionConfig presets להתמקדות במפה
const MAP_PROJECTION: Record<string, ProjectionConfig> = {
  world: { scale: 147 },
  israel: { scale: 3000, center: [35.0, 31.5] },
}

interface TooltipState {
  point: BubblePoint
  x: number
  y: number
}

export function BubbleMap({
  data,
  map = "world",
  maxBubbleRadius = 40,
  minBubbleRadius = 4,
  colorMode = "single",
  height = 500,
  projectionConfig,
  showTooltip = true,
  onBubbleClick,
}: Props) {
  const t = useChartTheme()
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  // geoUrl: preset או URL ישיר
  const geoUrl = MAP_URLS[map] ?? map
  const projConfig = projectionConfig ?? MAP_PROJECTION[map] ?? { scale: 147 }

  // סקאלה לגודל עיגולים: שטח ∝ ערך (scaleSqrt)
  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const sizeScale = scaleSqrt()
    .domain([0, maxValue])
    .range([minBubbleRadius, maxBubbleRadius])

  // סקאלה לצבע gradient (אופציונלי)
  const colorScale = scaleLinear<string>()
    .domain([0, maxValue])
    .range(["var(--color-primary)", "var(--color-accent)"])

  const handleMouseEnter = useCallback(
    (point: BubblePoint, e: React.MouseEvent) => {
      if (!showTooltip) return
      setTooltip({ point, x: e.clientX, y: e.clientY })
    },
    [showTooltip],
  )

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (tooltip) setTooltip((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)
  }, [tooltip])

  const handleMouseLeave = useCallback(() => setTooltip(null), [])

  // מיין לפי ערך יורד — עיגולים גדולים מאחורה
  const sortedData = [...data].sort((a, b) => b.value - a.value)

  return (
    <div className="relative w-full" style={{ height }} onMouseMove={handleMouseMove}>
      <ComposableMap
        projectionConfig={projConfig}
        style={{ width: "100%", height: "100%" }}
      >
        {/* שכבת המדינות */}
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="var(--color-surface-2)"
                stroke="var(--color-border)"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none", fill: "var(--color-surface)" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {/* שכבת העיגולים */}
        {sortedData.map((point, i) => {
          const radius = sizeScale(point.value)
          const fill =
            point.color ??
            (colorMode === "gradient" ? colorScale(point.value) : "var(--color-primary)")

          return (
            <Marker
              key={`${point.label}-${i}`}
              coordinates={[point.lng, point.lat]}
            >
              <circle
                r={radius}
                fill={fill}
                fillOpacity={0.7}
                stroke="var(--color-bg)"
                strokeWidth={1}
                style={{ cursor: onBubbleClick ? "pointer" : "default", transition: "r 0.2s, fill-opacity 0.2s" }}
                onMouseEnter={(e) => handleMouseEnter(point, e)}
                onMouseLeave={handleMouseLeave}
                onClick={() => onBubbleClick?.(point)}
                onMouseOver={(e) => {
                  e.currentTarget.setAttribute("fill-opacity", "0.9")
                  e.currentTarget.setAttribute("r", String(radius * 1.1))
                }}
                onMouseOut={(e) => {
                  e.currentTarget.setAttribute("fill-opacity", "0.7")
                  e.currentTarget.setAttribute("r", String(radius))
                }}
              />
            </Marker>
          )
        })}
      </ComposableMap>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-xl"
          style={{ left: tooltip.x + 12, top: tooltip.y - 16, transform: "translateY(-100%)" }}
        >
          <p className="text-sm font-semibold text-[var(--color-text)]">{tooltip.point.label}</p>
          {tooltip.point.sublabel && (
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{tooltip.point.sublabel}</p>
          )}
          <p className="text-base font-bold text-[var(--color-primary)] mt-1">
            {tooltip.point.value.toLocaleString("he-IL")}
          </p>
        </div>
      )}
    </div>
  )
}
```

## עיקרון גודל עיגולים — `scaleSqrt`

חשוב: משתמשים ב-`scaleSqrt` ולא `scaleLinear` כי המוח האנושי תופס **שטח**, לא רדיוס:

```
value = 100 → radius = 10 → area = π·100
value = 400 → radius = 20 → area = π·400  ← נראה "פי 4 גדול" ✅ נכון
```

אם היינו משתמשים ב-`scaleLinear` על הרדיוס:
```
value = 100 → radius = 10 → area = π·100
value = 400 → radius = 40 → area = π·1600  ← נראה "פי 16 גדול" ❌ מטעה
```

## מפות מובנות

| preset | מקור | הערה |
|--------|------|------|
| `"world"` | `world-atlas@2/countries-110m.json` (jsdelivr) | Natural Earth, 110m resolution |
| `"israel"` | `datasets/geo-countries` (GitHub) | GeoJSON — מסנן רק את ישראל |

לפרויקטים שדורשים מפת ישראל מדויקת יותר (עם ערים, מחוזות) — השתמש ב-TopoJSON מ-GADM:
```ts
// URL ישיר לTopoJSON מ-GADM
map="https://your-cdn.com/israel-districts.json"
```

## בדיקות סיום
- [ ] מפת עולם מרנדרת עם גבולות מדינות
- [ ] מפת ישראל מרנדרת ממוקדת נכון
- [ ] גודל עיגולים ∝ ערך (scaleSqrt)
- [ ] Tooltip מוצג ב-hover עם label + sublabel + value
- [ ] Tooltip נעלם ב-mouseLeave
- [ ] Tooltip לא חורג מגבולות המסך
- [ ] `colorMode="gradient"` משנה צבע לפי ערך
- [ ] `onBubbleClick` מופעל ב-click
- [ ] SSR-safe (`"use client"`)
- [ ] CSS variables: שינוי `--color-primary` משנה צבע עיגולים
- [ ] מיוצא ב-src/index.ts

← [[../00 - Library Overview & Build Plan]]
