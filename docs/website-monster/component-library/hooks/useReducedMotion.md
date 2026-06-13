# useReducedMotion

> **קטגוריה:** hooks
> **תלויות:** none
> **קוד:** src/hooks/useReducedMotion.ts
> **עלות בנייה:** ~10 דקות

## מה זה
Returns `boolean` — האם המשתמש הגדיר `prefers-reduced-motion: reduce`. חובה בכל component עם animation. Reactive — מתעדכן אם המשתמש משנה הגדרה.

## Returns
`boolean` — `true` = לא להציג animations.

## שימוש בסיסי
```tsx
import { useReducedMotion } from "@tottemai/ui"

function AnimatedCard() {
  const prefersReduced = useReducedMotion()

  return (
    <motion.div
      animate={prefersReduced ? {} : { y: [0, -10, 0] }}
      transition={prefersReduced ? {} : { repeat: Infinity, duration: 2 }}
    >
      Content
    </motion.div>
  )
}
```

## קוד מלא
```ts
// src/hooks/useReducedMotion.ts
import { useState, useEffect } from "react"

export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  })

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)

    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  return prefersReduced
}
```

## בדיקות סיום
- [ ] Returns נכון ב-SSR (false)
- [ ] Reactive לשינוי הגדרה
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
