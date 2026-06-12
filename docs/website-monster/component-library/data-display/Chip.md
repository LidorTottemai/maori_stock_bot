# Chip

> **קטגוריה:** data-display
> **תלויות:** react, clsx
> **Storybook:** src/stories/Chip.stories.tsx
> **קוד:** src/data-display/Chip.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
תג/צ'יפ שניתן לסגירה עם אייקון, וריאנטים: default/outlined/filled. מתאים לתיוג, פילטרים, מצבים ובחירות מרובות. תומך בצבעים סמנטיים, גדלים שונים וסגירה במקלדת.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | צ'יפ בסיסי ללא גבול |
| Outlined | עם מסגרת ורקע שקוף |
| Filled | עם מילוי צבע מלא |
| With Icon | צ'יפ עם אייקון לפני הטקסט |
| Dismissible | צ'יפ עם כפתור X לסגירה |
| All Variants | כל הצבעים והגדלים בשורה |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | `string` | required | הטקסט המוצג בצ'יפ |
| variant | `'default' \| 'outlined' \| 'filled'` | `'default'` | סגנון הצ'יפ |
| icon | `ReactNode` | — | אייקון לפני הטקסט |
| onDismiss | `() => void` | — | קריאה בסגירת הצ'יפ |
| color | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'error'` | `'primary'` | צבע הצ'יפ |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | גודל הצ'יפ |
| disabled | `boolean` | `false` | האם הצ'יפ מנוטרל |
| className | `string` | — | קלאס CSS נוסף |

## שימוש בסיסי
```tsx
import { Chip } from "@tottemai/ui"

export default function Demo() {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Chip label="React"    color="primary"   variant="filled" />
      <Chip label="TypeScript" color="secondary" variant="outlined" />
      <Chip
        label="מחיק"
        color="error"
        variant="filled"
        onDismiss={() => console.log("הוסר")}
      />
    </div>
  )
}
```

## קוד מלא
```tsx
// src/data-display/Chip.tsx
import React, { useRef } from "react"
import clsx from "clsx"

export type ChipColor = "primary" | "secondary" | "success" | "warning" | "error"
export type ChipVariant = "default" | "outlined" | "filled"
export type ChipSize = "sm" | "md" | "lg"

export interface ChipProps {
  label: string
  variant?: ChipVariant
  icon?: React.ReactNode
  onDismiss?: () => void
  color?: ChipColor
  size?: ChipSize
  disabled?: boolean
  className?: string
}

// ── CSS variable maps ─────────────────────────────────────────────────────────

const colorVarMap: Record<ChipColor, { base: string; contrast: string; subtle: string }> = {
  primary: {
    base: "var(--color-primary, #3b82f6)",
    contrast: "var(--color-primary-contrast, #fff)",
    subtle: "var(--color-primary-subtle, #eff6ff)",
  },
  secondary: {
    base: "var(--color-secondary, #8b5cf6)",
    contrast: "var(--color-secondary-contrast, #fff)",
    subtle: "var(--color-secondary-subtle, #f5f3ff)",
  },
  success: {
    base: "var(--color-success, #22c55e)",
    contrast: "var(--color-success-contrast, #fff)",
    subtle: "var(--color-success-subtle, #f0fdf4)",
  },
  warning: {
    base: "var(--color-warning, #f59e0b)",
    contrast: "var(--color-warning-contrast, #fff)",
    subtle: "var(--color-warning-subtle, #fffbeb)",
  },
  error: {
    base: "var(--color-error, #ef4444)",
    contrast: "var(--color-error-contrast, #fff)",
    subtle: "var(--color-error-subtle, #fef2f2)",
  },
}

const sizeMap: Record<ChipSize, { fontSize: string; paddingX: string; paddingY: string; height: string; iconSize: string }> = {
  sm: {
    fontSize: "var(--font-size-xs, 0.75rem)",
    paddingX: "var(--spacing-2, 8px)",
    paddingY: "var(--spacing-0-5, 2px)",
    height: "var(--spacing-6, 24px)",
    iconSize: "12px",
  },
  md: {
    fontSize: "var(--font-size-sm, 0.875rem)",
    paddingX: "var(--spacing-3, 12px)",
    paddingY: "var(--spacing-1, 4px)",
    height: "var(--spacing-7, 28px)",
    iconSize: "14px",
  },
  lg: {
    fontSize: "var(--font-size-base, 1rem)",
    paddingX: "var(--spacing-4, 16px)",
    paddingY: "var(--spacing-2, 8px)",
    height: "var(--spacing-9, 36px)",
    iconSize: "16px",
  },
}

// ── component ─────────────────────────────────────────────────────────────────

export function Chip({
  label,
  variant = "default",
  icon,
  onDismiss,
  color = "primary",
  size = "md",
  disabled = false,
  className,
}: ChipProps) {
  const chipRef = useRef<HTMLSpanElement>(null)
  const cv = colorVarMap[color]
  const sv = sizeMap[size]

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--spacing-1, 4px)",
    height: sv.height,
    paddingInline: sv.paddingX,
    paddingBlock: sv.paddingY,
    borderRadius: "var(--radius-full, 9999px)",
    fontSize: sv.fontSize,
    fontWeight: "var(--font-weight-medium, 500)" as React.CSSProperties["fontWeight"],
    lineHeight: 1,
    whiteSpace: "nowrap",
    userSelect: "none",
    opacity: disabled ? 0.45 : 1,
    pointerEvents: disabled ? "none" : "auto",
    transition: "background-color var(--duration-fast, 100ms) ease, border-color var(--duration-fast, 100ms) ease",
    outline: "none",
    cursor: "default",
    direction: "auto" as React.CSSProperties["direction"],
    ...(variant === "default"
      ? {
          backgroundColor: cv.subtle,
          color: cv.base,
          border: "1px solid transparent",
        }
      : variant === "outlined"
      ? {
          backgroundColor: "transparent",
          color: cv.base,
          border: `1px solid ${cv.base}`,
        }
      : {
          // filled
          backgroundColor: cv.base,
          color: cv.contrast,
          border: "1px solid transparent",
        }),
  }

  const iconStyle: React.CSSProperties = {
    width: sv.iconSize,
    height: sv.iconSize,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  }

  const dismissStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: sv.iconSize,
    height: sv.iconSize,
    marginInlineStart: "var(--spacing-0-5, 2px)",
    marginInlineEnd: `calc(${sv.paddingX} * -0.4)`,
    borderRadius: "50%",
    border: "none",
    backgroundColor: "transparent",
    color: "inherit",
    cursor: "pointer",
    padding: 0,
    lineHeight: 1,
    flexShrink: 0,
    opacity: 0.7,
    fontFamily: "inherit",
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (onDismiss && (e.key === "Delete" || e.key === "Backspace")) {
      e.preventDefault()
      onDismiss()
    }
  }

  return (
    <span
      ref={chipRef}
      role="status"
      aria-label={label}
      tabIndex={onDismiss && !disabled ? 0 : undefined}
      style={baseStyle}
      className={clsx("tui-chip", `tui-chip--${variant}`, `tui-chip--${color}`, `tui-chip--${size}`, className)}
      onKeyDown={onDismiss ? handleKeyDown : undefined}
    >
      {icon && (
        <span style={iconStyle} aria-hidden="true">
          {icon}
        </span>
      )}

      <span>{label}</span>

      {onDismiss && (
        <button
          type="button"
          aria-label={`הסר ${label}`}
          style={dismissStyle}
          tabIndex={-1}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation()
            onDismiss()
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.opacity = "1"
            ;(e.currentTarget as HTMLElement).style.backgroundColor =
              variant === "filled"
                ? "rgba(255,255,255,0.2)"
                : "var(--color-surface-hover, rgba(0,0,0,0.08))"
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.opacity = "0.7"
            ;(e.currentTarget as HTMLElement).style.backgroundColor = "transparent"
          }}
        >
          <svg
            width={sv.iconSize}
            height={sv.iconSize}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      )}
    </span>
  )
}

export default Chip
```

## בדיקות סיום
- [ ] מרנדר בלי שגיאות
- [ ] כל ה-variants פועלים
- [ ] CSS variables בלבד
- [ ] Accessible (aria-*, keyboard nav)
- [ ] RTL תמיכה
- [ ] מיוצא ב-src/index.ts
- [ ] Story ב-Storybook

← [[00 - Library Overview & Build Plan]]
