# useBreakpoint

> **קטגוריה:** hooks
> **תלויות:** none
> **קוד:** src/hooks/useBreakpoint.ts
> **עלות בנייה:** ~15 דקות

## מה זה
Returns breakpoint נוכחי ו-boolean helpers. מבוסס על Tailwind breakpoints. SSR-safe.

## Returns
```ts
{
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  isMobile: boolean   // < md
  isTablet: boolean   // md
  isDesktop: boolean  // >= lg
  isXs: boolean
  isSm: boolean
  isMd: boolean
  isLg: boolean
  isXl: boolean
  is2xl: boolean
}
```

## שימוש בסיסי
```tsx
import { useBreakpoint } from "@tottemai/ui"

function ResponsiveComponent() {
  const { isMobile, isDesktop, breakpoint } = useBreakpoint()

  if (isMobile) return <MobileView />
  return <DesktopView />
}
```

## קוד מלא
```ts
// src/hooks/useBreakpoint.ts
import { useState, useEffect } from "react"

const breakpoints = { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 }
type Breakpoint = keyof typeof breakpoints

function getBreakpoint(width: number): Breakpoint {
  if (width >= 1536) return "2xl"
  if (width >= 1280) return "xl"
  if (width >= 1024) return "lg"
  if (width >= 768) return "md"
  if (width >= 640) return "sm"
  return "xs"
}

export function useBreakpoint() {
  const [width, setWidth] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1024))

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener("resize", handler, { passive: true })
    return () => window.removeEventListener("resize", handler)
  }, [])

  const bp = getBreakpoint(width)

  return {
    breakpoint: bp,
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    isXs: bp === "xs",
    isSm: bp === "sm",
    isMd: bp === "md",
    isLg: bp === "lg",
    isXl: bp === "xl",
    is2xl: bp === "2xl",
  }
}
```

## בדיקות סיום
- [ ] Returns נכון ב-SSR
- [ ] מתעדכן ב-resize
- [ ] Passive resize listener
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
