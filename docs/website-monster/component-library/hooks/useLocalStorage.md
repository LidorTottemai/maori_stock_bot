# useLocalStorage

> **קטגוריה:** hooks
> **תלויות:** none
> **קוד:** src/hooks/useLocalStorage.ts
> **עלות בנייה:** ~15 דקות

## מה זה
`useState` שמסתנכרן עם `localStorage`. SSR-safe — לא crash בserver. מעדכן cross-tab דרך `storage` event. שימושי להעדפות משתמש, cart, dark mode.

## Parameters / Returns
| Parameter | Type | Description |
|-----------|------|-------------|
| key | `string` | localStorage key |
| initialValue | `T` | ברירת מחדל |

**Returns:** `[value: T, setValue: (v: T | ((prev: T) => T)) => void, remove: () => void]`

## שימוש בסיסי
```tsx
import { useLocalStorage } from "@tottemai/ui"

function ThemeToggle() {
  const [theme, setTheme, removeTheme] = useLocalStorage("theme", "dark")

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Current: {theme}
    </button>
  )
}
```

## קוד מלא
```ts
// src/hooks/useLocalStorage.ts
import { useState, useEffect, useCallback } from "react"

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`useLocalStorage: error setting key "${key}"`, error)
    }
  }, [key, storedValue])

  const remove = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== "undefined") window.localStorage.removeItem(key)
    } catch {
      // ignore
    }
  }, [key, initialValue])

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try { setStoredValue(JSON.parse(e.newValue) as T) } catch { /* ignore */ }
      }
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [key])

  return [storedValue, setValue, remove]
}
```

## בדיקות סיום
- [ ] SSR לא crash
- [ ] Persists לאחר refresh
- [ ] Cross-tab sync
- [ ] remove() מוחק
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
