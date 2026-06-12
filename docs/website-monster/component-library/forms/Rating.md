# Rating

> **קטגוריה:** forms
> **תלויות:** none (custom implementation)
> **Storybook:** src/stories/Rating.stories.tsx
> **קוד:** src/forms/Rating.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
קומפוננטת דירוג כוכבים (1–5) בהטמעה מלאה בלי ספריות חיצוניות. תומכת בחצאי כוכבים (half stars), מצב קריאה בלבד (readOnly), גדלים שונים, ניווט מקלדת מלא, וכיוון RTL. הכוכבים מיושמים כ-SVG inline.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | דירוג 1–5 כוכבים |
| HalfStars | תמיכה בחצאי כוכבים |
| ReadOnly | מצב תצוגה בלבד |
| Sizes | Small / Medium / Large |
| RTL | כוכבים מימין לשמאל |
| WithLabel | עם תוית ניקוד |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | number | 0 | הדירוג הנוכחי |
| onChange | (value: number) => void | — | callback בבחירת דירוג |
| max | number | 5 | מספר כוכבים מקסימלי |
| allowHalf | boolean | false | האם לאפשר חצאי כוכבים |
| readOnly | boolean | false | מצב קריאה בלבד |
| size | "sm" \| "md" \| "lg" | "md" | גודל הכוכבים |
| className | string | — | class נוסף |
| dir | "ltr" \| "rtl" | "ltr" | כיוון |
| aria-label | string | "דירוג" | תוית נגישות |

## שימוש בסיסי
```tsx
import { Rating } from "@tottemai/ui"

// דירוג רגיל
<Rating value={3} onChange={(v) => console.log(v)} />

// חצאי כוכבים
<Rating value={3.5} onChange={(v) => console.log(v)} allowHalf />

// קריאה בלבד
<Rating value={4} readOnly />
```

## קוד מלא
```tsx
// src/forms/Rating.tsx
"use client"
import * as React from "react"

export interface RatingProps {
  value?: number
  onChange?: (value: number) => void
  max?: number
  allowHalf?: boolean
  readOnly?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
  dir?: "ltr" | "rtl"
  "aria-label"?: string
}

const SIZE_MAP = {
  sm: 16,
  md: 24,
  lg: 32,
} as const

type StarFill = "empty" | "half" | "full"

function getStarFill(index: number, value: number, allowHalf: boolean): StarFill {
  const starNumber = index + 1
  if (value >= starNumber) return "full"
  if (allowHalf && value >= starNumber - 0.5) return "half"
  return "empty"
}

interface StarIconProps {
  fill: StarFill
  size: number
  hovered?: boolean
  hoveredHalf?: boolean
}

const StarIcon: React.FC<StarIconProps> = ({ fill, size, hovered, hoveredHalf }) => {
  const isActive = fill === "full" || hovered
  const isHalf = fill === "half" || hoveredHalf

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={`half-${size}-${fill}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="50%" stopColor="var(--color-warning)" />
          <stop offset="50%" stopColor="var(--color-border)" />
        </linearGradient>
      </defs>
      <polygon
        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
        fill={
          isActive
            ? "var(--color-warning)"
            : isHalf
            ? `url(#half-${size}-${fill})`
            : "var(--color-border)"
        }
        stroke={isActive || isHalf ? "var(--color-warning)" : "var(--color-border)"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transition:
            "fill var(--transition-fast), stroke var(--transition-fast)",
        }}
      />
      {isHalf && !isActive && (
        <clipPath id={`clip-half-${size}`}>
          <rect x="0" y="0" width="12" height="24" />
        </clipPath>
      )}
      {isHalf && !isActive && (
        <polygon
          points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
          fill="var(--color-warning)"
          clipPath={`url(#clip-half-${size})`}
          aria-hidden="true"
        />
      )}
    </svg>
  )
}

export const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value = 0,
      onChange,
      max = 5,
      allowHalf = false,
      readOnly = false,
      size = "md",
      className = "",
      dir = "ltr",
      "aria-label": ariaLabel = "דירוג",
    },
    ref
  ) => {
    const [hoverIndex, setHoverIndex] = React.useState<number | null>(null)
    const [hoverHalf, setHoverHalf] = React.useState(false)
    const starSize = SIZE_MAP[size]
    const isRTL = dir === "rtl"

    const handleMouseMove = (
      e: React.MouseEvent<HTMLButtonElement>,
      index: number
    ) => {
      if (readOnly || !allowHalf) return
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const isLeft = isRTL ? x > rect.width / 2 : x < rect.width / 2
      setHoverHalf(isLeft)
    }

    const getClickValue = (index: number, isHalf: boolean) => {
      if (allowHalf && isHalf) return index + 0.5
      return index + 1
    }

    const handleClick = (index: number) => {
      if (readOnly) return
      const newValue = getClickValue(index, hoverHalf)
      onChange?.(newValue)
    }

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
      if (readOnly) return
      const step = allowHalf ? 0.5 : 1
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault()
        const next = Math.min(max, value + step)
        onChange?.(isRTL ? Math.max(0, value - step) : next)
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault()
        onChange?.(isRTL ? Math.min(max, value + step) : Math.max(0, value - step))
      } else if (e.key === "Home") {
        e.preventDefault()
        onChange?.(0)
      } else if (e.key === "End") {
        e.preventDefault()
        onChange?.(max)
      }
    }

    const stars = Array.from({ length: max }, (_, i) => i)

    return (
      <div
        ref={ref}
        dir={dir}
        className={`rating-root ${className}`}
        role="group"
        aria-label={ariaLabel}
        style={{
          display: "inline-flex",
          gap: "var(--spacing-1)",
          alignItems: "center",
        }}
      >
        {stars.map((i) => {
          const starIndex = isRTL ? max - 1 - i : i
          const fill = getStarFill(starIndex, value, allowHalf)
          const isHovered =
            hoverIndex !== null &&
            (isRTL ? starIndex >= max - hoverIndex - 1 : starIndex <= hoverIndex)
          const isHoveredHalf =
            hoverIndex === starIndex && hoverHalf && allowHalf

          return (
            <button
              key={starIndex}
              type="button"
              disabled={readOnly}
              aria-label={`${starIndex + 1} כוכבים`}
              aria-pressed={value >= starIndex + 1}
              onClick={() => handleClick(starIndex)}
              onMouseEnter={() => {
                if (!readOnly) setHoverIndex(starIndex)
              }}
              onMouseLeave={() => {
                setHoverIndex(null)
                setHoverHalf(false)
              }}
              onMouseMove={(e) => handleMouseMove(e, starIndex)}
              onKeyDown={(e) => handleKeyDown(e, starIndex)}
              style={{
                background: "none",
                border: "none",
                padding: "var(--spacing-1)",
                margin: 0,
                cursor: readOnly ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "var(--radius-sm)",
                outline: "none",
                transition: "transform var(--transition-fast)",
                transform: isHovered ? "scale(1.1)" : "scale(1)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 0 2px var(--color-primary-alpha)"
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = "none"
              }}
            >
              <StarIcon
                fill={fill}
                size={starSize}
                hovered={isHovered && !isHoveredHalf}
                hoveredHalf={isHoveredHalf}
              />
            </button>
          )
        })}

        <span
          aria-live="polite"
          aria-atomic="true"
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: 0,
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0,0,0,0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          {`דירוג: ${value} מתוך ${max}`}
        </span>
      </div>
    )
  }
)

Rating.displayName = "Rating"
```

## עיקרון CSS Variables
```css
/* אין צבעים קשיחים */
fill: var(--color-warning);
stroke: var(--color-warning);
border-color: var(--color-border);
box-shadow: 0 0 0 2px var(--color-primary-alpha);
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
