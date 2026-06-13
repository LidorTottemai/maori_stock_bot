# HeatMap

> **קטגוריה:** special
> **תלויות:** @visx/heatmap, @visx/scale
> **קוד:** src/special/HeatMap.tsx
> **עלות בנייה:** ~25 דקות

## מה זה
מפת חום — grid של ריבועים צבועים לפי אינטנסיביות. שימוש: עומס לפי שעה/יום, ביצועי מוצרים.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `HeatMapDatum[][]` | required | מטריצה: שורות × עמודות |
| rowLabels | `string[]` | required | ימי שבוע / חודשים |
| colLabels | `string[]` | required | שעות / קטגוריות |
| colorRange | `[string, string]` | `["var(--color-surface-2)", "var(--color-primary)"]` | |
| height | `number` | `200` | |
| cellGap | `number` | `2` | רווח בין תאים |

```ts
interface HeatMapDatum { value: number }
```

## שימוש בסיסי
```tsx
import { HeatMap } from "@tottemai/graphs"

// עומס לפי שעה ויום
const data = days.map(day =>
  hours.map(hour => ({ value: bookings[day][hour] ?? 0 }))
)

<HeatMap
  data={data}
  rowLabels={["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"]}
  colLabels={["09", "10", "11", "12", "13", "14", "15", "16", "17"]}
/>
```

## קוד מלא
```tsx
// src/special/HeatMap.tsx
"use client"
import { HeatmapRect } from "@visx/heatmap"
import { scaleLinear } from "@visx/scale"
import { Tooltip, useTooltip } from "@visx/tooltip"
import { useChartTheme } from "../hooks/useChartTheme"
import { useChartResize } from "../hooks/useChartResize"
import { useRef } from "react"

interface HeatMapDatum { value: number }

interface Props {
  data: HeatMapDatum[][]
  rowLabels: string[]
  colLabels: string[]
  colorRange?: [string, string]
  height?: number
  cellGap?: number
}

export function HeatMap({
  data, rowLabels, colLabels, height = 200, cellGap = 2,
}: Props) {
  const t = useChartTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const { width } = useChartResize(containerRef)
  const { tooltipData, tooltipLeft, tooltipTop, showTooltip, hideTooltip } = useTooltip<{ row: string; col: string; value: number }>()

  const numCols = data[0]?.length ?? 0
  const numRows = data.length
  const cellSize = Math.floor((width - numCols * cellGap) / numCols)
  const allValues = data.flat().map((d) => d.value)
  const maxVal = Math.max(...allValues)

  const colorScale = scaleLinear<string>({
    domain: [0, maxVal],
    range: ["var(--color-surface-2)", "var(--color-primary)"],
  })

  const binData = data.map((row, ri) => ({
    bin: ri,
    bins: row.map((d, ci) => ({ bin: ci, count: d.value })),
  }))

  return (
    <div ref={containerRef} className="relative w-full">
      <svg width={width} height={height}>
        <HeatmapRect
          data={binData}
          xScale={(d) => d * (cellSize + cellGap)}
          yScale={(d) => d * (cellSize + cellGap)}
          colorScale={colorScale}
          binWidth={cellSize}
          binHeight={cellSize}
          gap={cellGap}
        >
          {(heatmap) =>
            heatmap.map((heatmapBins) =>
              heatmapBins.map((bin) => (
                <rect
                  key={`${bin.row}-${bin.column}`}
                  x={bin.x}
                  y={bin.y}
                  width={bin.width}
                  height={bin.height}
                  rx={2}
                  fill={bin.color ?? t.surface}
                  onMouseEnter={() =>
                    showTooltip({
                      tooltipData: { row: rowLabels[bin.row], col: colLabels[bin.column], value: bin.count ?? 0 },
                      tooltipLeft: bin.x,
                      tooltipTop: bin.y,
                    })
                  }
                  onMouseLeave={hideTooltip}
                />
              )),
            )
          }
        </HeatmapRect>
      </svg>
      {tooltipData && (
        <Tooltip left={tooltipLeft} top={tooltipTop} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 6, color: t.text, fontSize: 12 }}>
          {tooltipData.row} / {tooltipData.col}: <strong>{tooltipData.value}</strong>
        </Tooltip>
      )}
    </div>
  )
}
```

## בדיקות סיום
- [ ] Grid מרנדר עם צבעים נכונים
- [ ] Tooltip בhover
- [ ] colorScale: 0 = שקוף, max = primary
- [ ] Responsive בresize
- [ ] מיוצא ב-src/index.ts

← [[../00 - Library Overview & Build Plan]]
