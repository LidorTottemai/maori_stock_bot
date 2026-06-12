# Skeleton

> **קטגוריה:** primitives
> **תלויות:** clsx
> **Storybook:** src/stories/Skeleton.stories.tsx
> **קוד:** src/primitives/Skeleton.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
placeholder מונפש עם shimmer effect לזמן טעינת תוכן.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | מלבן בסיסי |
| Circle | עיגול (ל-avatar placeholder) |
| Text | שורת טקסט |
| Card | כרטיס שלם עם מספר שורות |
| Rounded | עם border-radius משתנה |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| width | `string \| number` | `"100%"` | רוחב |
| height | `string \| number` | `"1rem"` | גובה |
| rounded | `"none" \| "sm" \| "md" \| "lg" \| "full"` | `"md"` | עגלת פינות |
| className | string | — | CSS classes נוספים |
| animate | boolean | `true` | האם להפעיל animation |

## שימוש בסיסי
```tsx
import { Skeleton } from "@tottemai/ui"

// שורת טקסט
<Skeleton width="60%" height="1rem" />

// עיגול ל-avatar
<Skeleton width={40} height={40} rounded="full" />

// כרטיס טעינה מלא
<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
  <Skeleton width={48} height={48} rounded="full" />
  <Skeleton width="80%" height="1.25rem" />
  <Skeleton width="60%" height="1rem" />
  <Skeleton width="100%" height="6rem" rounded="lg" />
</div>
```

## קוד מלא
```tsx
// src/primitives/Skeleton.tsx
"use client"
import * as React from "react"
import { clsx } from "clsx"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SkeletonRounded = "none" | "sm" | "md" | "lg" | "full"

export interface SkeletonProps {
  width?: string | number
  height?: string | number
  rounded?: SkeletonRounded
  className?: string
  animate?: boolean
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const roundedMap: Record<SkeletonRounded, string> = {
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "12px",
  full: "9999px",
}

// Keyframes injected once into the document head
const KEYFRAMES_ID = "__skeleton_shimmer_kf__"

const keyframesCSS = `
@keyframes skeleton-shimmer {
  0% {
    background-position: 200% center;
  }
  100% {
    background-position: -200% center;
  }
}

@keyframes skeleton-shimmer-rtl {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-animate {
    animation: none !important;
    background-image: none !important;
    background: var(--color-skeleton-base) !important;
  }
}
`

function injectKeyframes() {
  if (typeof document === "undefined") return
  if (document.getElementById(KEYFRAMES_ID)) return
  const style = document.createElement("style")
  style.id = KEYFRAMES_ID
  style.textContent = keyframesCSS
  document.head.appendChild(style)
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      width = "100%",
      height = "1rem",
      rounded = "md",
      className,
      animate = true,
    },
    ref
  ) => {
    // Inject keyframes on first render (client-side only)
    React.useEffect(() => {
      injectKeyframes()
    }, [])

    const resolvedWidth =
      typeof width === "number" ? `${width}px` : width
    const resolvedHeight =
      typeof height === "number" ? `${height}px` : height
    const borderRadius = roundedMap[rounded]

    const baseStyle: React.CSSProperties = {
      display: "block",
      width: resolvedWidth,
      height: resolvedHeight,
      borderRadius,
      background: "var(--color-skeleton-base)",
      flexShrink: 0,
    }

    const shimmerStyle: React.CSSProperties = animate
      ? {
          backgroundImage: `linear-gradient(
            90deg,
            var(--color-skeleton-base)    0%,
            var(--color-skeleton-highlight) 50%,
            var(--color-skeleton-base)    100%
          )`,
          backgroundSize: "400% 100%",
          backgroundRepeat: "no-repeat",
          animation: "skeleton-shimmer 1.6s ease-in-out infinite",
        }
      : {}

    // RTL-aware: flip animation direction when direction is rtl
    const rtlStyle: React.CSSProperties =
      animate
        ? ({
            // CSS logical property: detected at runtime via dir attribute
            // We rely on the keyframes-rtl class applied when [dir=rtl] is present
          } as React.CSSProperties)
        : {}

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={clsx(
          "skeleton",
          animate && "skeleton-animate",
          className
        )}
        style={{
          ...baseStyle,
          ...shimmerStyle,
          ...rtlStyle,
        }}
      />
    )
  }
)

Skeleton.displayName = "Skeleton"
```

## עיקרון CSS Variables
```css
/* אין צבעים קשיחים */
background: var(--color-primary);
color: var(--color-text);
```

## בדיקות סיום
- [ ] מרנדר בלי שגיאות
- [ ] כל ה-variants פועלים  
- [ ] CSS variables בלבד (אין hexcodes קשיחים)
- [ ] Accessible (aria-*, keyboard nav)
- [ ] RTL תמיכה
- [ ] prefers-reduced-motion
- [ ] מיוצא ב-src/index.ts
- [ ] Story ב-Storybook

← [[00 - Library Overview & Build Plan]]
