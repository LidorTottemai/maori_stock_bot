# useScrollVelocity

> **קטגוריה:** hooks
> **תלויות:** none
> **קוד:** src/hooks/useScrollVelocity.ts
> **עלות בנייה:** ~15 דקות

## מה זה
Returns מהירות ה-scroll הנוכחית (px/s). שימושי להתאמת עוצמת parallax לפי מהירות הscroll, לsquash & stretch אנימציות.

## Parameters / Returns
**Returns:** `number` — velocity בpx/s (חיובי = scroll למטה, שלילי = למעלה)

## שימוש בסיסי
```tsx
import { useScrollVelocity } from "@tottemai/ui"

function ParallaxImage() {
  const velocity = useScrollVelocity()
  const skew = Math.min(Math.abs(velocity) * 0.01, 5)

  return <img style={{ transform: `skewY(${skew}deg)` }} src="/image.jpg" />
}
```

## קוד מלא
```ts
// src/hooks/useScrollVelocity.ts
import { useState, useEffect, useRef } from "react"

export function useScrollVelocity(): number {
  const [velocity, setVelocity] = useState(0)
  const lastScrollY = useRef(0)
  const lastTime = useRef(Date.now())
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const handleScroll = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const now = Date.now()
        const dt = now - lastTime.current
        const dy = window.scrollY - lastScrollY.current

        if (dt > 0) setVelocity((dy / dt) * 1000)

        lastScrollY.current = window.scrollY
        lastTime.current = now

        // decay velocity after 100ms of no scroll
        setTimeout(() => setVelocity(0), 100)
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => { window.removeEventListener("scroll", handleScroll); cancelAnimationFrame(rafRef.current) }
  }, [])

  return velocity
}
```

## בדיקות סיום
- [ ] Returns velocity בscroll
- [ ] Decay ל-0 כשעוצר
- [ ] Passive listener (ביצועים)
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
