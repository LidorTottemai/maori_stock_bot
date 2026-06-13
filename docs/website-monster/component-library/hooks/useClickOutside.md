# useClickOutside

> **קטגוריה:** hooks
> **תלויות:** none
> **קוד:** src/hooks/useClickOutside.ts
> **עלות בנייה:** ~10 דקות

## מה זה
Fires callback כשלוחצים מחוץ ל-ref element. שימושי לסגירת dropdowns, modals, color pickers.

## Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| ref | `RefObject<Element>` | ref לelement |
| callback | `() => void` | fires on outside click |
| enabled | `boolean` | `true` — כדי לנטרל כשclosed |

## שימוש בסיסי
```tsx
import { useClickOutside } from "@tottemai/ui"

function Dropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false), open)

  return (
    <div ref={ref}>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && <div className="dropdown">content</div>}
    </div>
  )
}
```

## קוד מלא
```ts
// src/hooks/useClickOutside.ts
import { RefObject, useEffect } from "react"

export function useClickOutside<T extends Element>(
  ref: RefObject<T>,
  callback: () => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return

    const handleClick = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return
      callback()
    }

    document.addEventListener("mousedown", handleClick)
    document.addEventListener("touchstart", handleClick)

    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("touchstart", handleClick)
    }
  }, [ref, callback, enabled])
}
```

## בדיקות סיום
- [ ] Fires ב-click outside
- [ ] לא fires ב-click inside
- [ ] enabled=false לא fires
- [ ] Touch events פועלים
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
