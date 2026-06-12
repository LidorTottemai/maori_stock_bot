# Spinner

> **קטגוריה:** primitives
> **תלויות:** clsx
> **Storybook:** src/stories/Spinner.stories.tsx
> **קוד:** src/primitives/Spinner.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
מחוון טעינה מסתובב עם גדלים מרובים וצבע דרך CSS variables.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Small | גודל sm (16px) |
| Medium | גודל md (24px) |
| Large | גודל lg (32px) |
| WithLabel | spinner עם טקסט לידו |
| Centered | ממורכז בתוך container |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | "sm" \| "md" \| "lg" | "md" | גודל הספינר |
| label | string | "טוען..." | טקסט נגישות (aria-label), מוסתר ויזואלית |
| className | string | — | CSS classes נוספים |

## שימוש בסיסי
```tsx
import { Spinner } from "@tottemai/ui"

// ברירת מחדל
<Spinner />

// גדלים
<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />

// עם aria-label מותאם
<Spinner label="מעלה קובץ..." />

// ממורכז
<div style={{ display: "flex", justifyContent: "center" }}>
  <Spinner size="lg" />
</div>
```

## קוד מלא
```tsx
// src/primitives/Spinner.tsx
"use client"
import * as React from "react"
import { clsx } from "clsx"

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
} as const

const strokeWidthMap = {
  sm: 2,
  md: 2.5,
  lg: 3,
} as const

const spinnerKeyframes = `
@keyframes spinner-rotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .spinner-svg {
    animation-duration: 2s;
    animation-timing-function: steps(8, end);
  }
}
`

let stylesInjected = false

function injectStyles() {
  if (typeof document === "undefined" || stylesInjected) return
  const style = document.createElement("style")
  style.setAttribute("data-spinner", "")
  style.textContent = spinnerKeyframes
  document.head.appendChild(style)
  stylesInjected = true
}

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: "sm" | "md" | "lg"
  label?: string
  className?: string
}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  (
    { size = "md", label = "טוען...", className, style, ...props },
    ref
  ) => {
    React.useEffect(() => {
      injectStyles()
    }, [])

    const px = sizeMap[size]
    const strokeWidth = strokeWidthMap[size]
    const radius = (px - strokeWidth * 2) / 2
    const circumference = 2 * Math.PI * radius
    // arc covers ~75% of the circle
    const dashArray = circumference
    const dashOffset = circumference * 0.25

    return (
      <svg
        ref={ref}
        role="status"
        aria-label={label}
        aria-live="polite"
        width={px}
        height={px}
        viewBox={`0 0 ${px} ${px}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={clsx("spinner-svg", `spinner-svg--${size}`, className)}
        style={{
          animation: "spinner-rotate 0.75s linear infinite",
          display: "inline-block",
          flexShrink: 0,
          ...style,
        }}
        {...props}
      >
        {/* Track — full circle, muted color */}
        <circle
          cx={px / 2}
          cy={px / 2}
          r={radius}
          stroke="var(--color-muted)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Arc — spinning portion, primary color */}
        <circle
          cx={px / 2}
          cy={px / 2}
          r={radius}
          stroke="var(--color-primary)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
        />
      </svg>
    )
  }
)

Spinner.displayName = "Spinner"

export { Spinner }
```

## עיקרון CSS Variables
```css
/* אין צבעים קשיחים */
background: var(--color-primary);
color: var(--color-muted);
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
