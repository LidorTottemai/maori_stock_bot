# useChartResize

> **קטגוריה:** hooks
> **תלויות:** none
> **קוד:** src/hooks/useChartResize.ts
> **עלות בנייה:** ~10 דקות

## מה זה
`ResizeObserver` על container ref → מחזיר `{ width, height }`. משמש לגרפים שצריכים את המידות הריאליות (visx, SVG מותאם) במקום `ResponsiveContainer` של Recharts.

## Parameters / Returns
| Parameter | Type | Description |
|-----------|------|-------------|
| ref | `RefObject<HTMLElement>` | ref לcontainer |

**Returns:** `{ width: number; height: number }`

## קוד מלא
```ts
// src/hooks/useChartResize.ts
import { RefObject, useState, useEffect } from "react"

export function useChartResize(ref: RefObject<HTMLElement>): { width: number; height: number } {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!ref.current) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width: Math.floor(width), height: Math.floor(height) })
    })
    observer.observe(ref.current)
    // initial measurement
    const { width, height } = ref.current.getBoundingClientRect()
    setSize({ width: Math.floor(width), height: Math.floor(height) })
    return () => observer.disconnect()
  }, [ref])

  return size
}
```

## שימוש בסיסי
```tsx
import { useChartResize } from "@tottemai/graphs"
import { useRef } from "react"

function MyChart() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { width, height } = useChartResize(containerRef)

  return (
    <div ref={containerRef} className="w-full h-64">
      <svg width={width} height={height}>
        {/* גרף SVG מותאם */}
      </svg>
    </div>
  )
}
```

## בדיקות סיום
- [ ] מחזיר מידות נכונות בלוד ראשון
- [ ] מתעדכן ב-resize
- [ ] observer מתנתק ב-cleanup
- [ ] מיוצא ב-src/index.ts

← [[../00 - Library Overview & Build Plan]]
