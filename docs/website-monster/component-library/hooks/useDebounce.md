# useDebounce

> **קטגוריה:** hooks
> **תלויות:** none
> **קוד:** src/hooks/useDebounce.ts
> **עלות בנייה:** ~10 דקות

## מה זה
Debounces value — מחזיר ערך שמתעדכן רק אחרי `delay` ms של שקט. שימושי לsearch inputs, resize handlers, API calls.

## Parameters / Returns
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| value | `T` | — | הvalue לdebounce |
| delay | `number` | `300` | ms |

**Returns:** `T` — הvalue לאחר debounce

## שימוש בסיסי
```tsx
import { useDebounce } from "@tottemai/ui"

function SearchInput() {
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 400)

  useEffect(() => {
    if (debouncedQuery) fetchResults(debouncedQuery)
  }, [debouncedQuery])

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />
}
```

## קוד מלא
```ts
// src/hooks/useDebounce.ts
import { useState, useEffect } from "react"

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
```

## בדיקות סיום
- [ ] מחזיר value לאחר delay
- [ ] Reset timer כשvalue משתנה
- [ ] Generic type פועל
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
