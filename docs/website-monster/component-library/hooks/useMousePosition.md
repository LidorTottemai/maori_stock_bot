# useMousePosition

> **קטגוריה:** hooks
> **תלויות:** none
> **קוד:** src/hooks/useMousePosition.ts
> **עלות בנייה:** ~10 דקות

## מה זה
Returns `{ x, y }` של מיקום ה-mouse, מתעדכן ב-`mousemove`. אופציה `normalized` מחזיר 0-1 ביחס לגודל החלון. בסיס ל-MagneticButton, CustomCursor, Spotlight.

## Parameters / Returns
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| normalized | `boolean` | false | אם true: x,y בין 0 ל-1 |

**Returns:** `{ x: number; y: number }`

## שימוש בסיסי
```tsx
import { useMousePosition } from "@tottemai/ui"

function Component() {
  const { x, y } = useMousePosition()
  const { x: nx, y: ny } = useMousePosition({ normalized: true })

  return <div>Mouse: {x}, {y} | Normalized: {nx.toFixed(2)}, {ny.toFixed(2)}</div>
}
```

## קוד מלא
```ts
// src/hooks/useMousePosition.ts
import { useState, useEffect } from "react"

interface MousePosition { x: number; y: number }
interface Options { normalized?: boolean }

export function useMousePosition({ normalized = false }: Options = {}): MousePosition {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 })

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPosition(
        normalized
          ? { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
          : { x: e.clientX, y: e.clientY },
      )
    }
    window.addEventListener("mousemove", handleMove)
    return () => window.removeEventListener("mousemove", handleMove)
  }, [normalized])

  return position
}
```

## בדיקות סיום
- [ ] מחזיר x,y בpixels
- [ ] normalized פועל
- [ ] Cleanup ב-unmount
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
