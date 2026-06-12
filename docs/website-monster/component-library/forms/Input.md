# Input

> **קטגוריה:** forms
> **תלויות:** clsx
> **Storybook:** src/stories/Input.stories.tsx
> **קוד:** src/forms/Input.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
שדה קלט טקסט עם תמיכה ב-icons, מצב שגיאה, disabled ו-RTL מלא.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | שדה קלט רגיל |
| WithLeftIcon | שדה עם icon בצד שמאל (RTL: ימין) |
| WithRightIcon | שדה עם icon בצד ימין (RTL: שמאל) |
| Error | שדה עם הודעת שגיאה |
| Disabled | שדה מושבת |
| Password | שדה סיסמה עם toggle visibility |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | string | "text" | סוג ה-input |
| error | boolean | false | מצב שגיאה (border אדום) |
| iconLeft | React.ReactNode | — | אייקון בצד שמאל |
| iconRight | React.ReactNode | — | אייקון בצד ימין |
| disabled | boolean | false | השבתת השדה |
| className | string | — | CSS classes נוספים |

## שימוש בסיסי
```tsx
import { Input } from "@tottemai/ui"

// Default
<Input placeholder="הכנס טקסט..." />

// With left icon
<Input iconLeft={<SearchIcon />} placeholder="חיפוש..." />

// Error state
<Input error placeholder="שדה חובה" />

// Password with toggle
<Input type="password" placeholder="סיסמה" />
```

## קוד מלא
```tsx
// src/forms/Input.tsx
"use client"
import * as React from "react"
import clsx from "clsx"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = "text",
      error = false,
      iconLeft,
      iconRight,
      disabled = false,
      className,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const isPassword = type === "password"
    const resolvedType = isPassword ? (showPassword ? "text" : "password") : type

    return (
      <div className={clsx("input-wrapper", className)} style={{ position: "relative", display: "inline-flex", width: "100%" }}>
        {iconLeft && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              insetInlineStart: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              color: "var(--color-input-placeholder)",
            }}
          >
            {iconLeft}
          </span>
        )}

        <input
          ref={ref}
          type={resolvedType}
          disabled={disabled}
          dir="auto"
          aria-invalid={error ? "true" : undefined}
          style={{
            width: "100%",
            paddingBlock: "0.5rem",
            paddingInlineStart: iconLeft ? "2.5rem" : "0.75rem",
            paddingInlineEnd: iconRight || isPassword ? "2.5rem" : "0.75rem",
            backgroundColor: disabled
              ? "var(--color-input-disabled-bg)"
              : "var(--color-input-bg)",
            color: "var(--color-input-text)",
            border: "1px solid",
            borderColor: error
              ? "var(--color-input-border-error)"
              : "var(--color-input-border)",
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
            lineHeight: "1.5",
            outline: "none",
            transition: "border-color 150ms ease, box-shadow 150ms ease",
            cursor: disabled ? "not-allowed" : "text",
            opacity: disabled ? 0.6 : 1,
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = `0 0 0 2px var(--color-ring)`
            e.currentTarget.style.borderColor = error
              ? "var(--color-input-border-error)"
              : "var(--color-input-border)"
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = "none"
            props.onBlur?.(e)
          }}
          placeholder={props.placeholder}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
            onClick={() => setShowPassword((prev) => !prev)}
            style={{
              position: "absolute",
              insetInlineEnd: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              color: "var(--color-input-placeholder)",
            }}
          >
            {showPassword ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}

        {!isPassword && iconRight && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              insetInlineEnd: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              color: "var(--color-input-placeholder)",
            }}
          >
            {iconRight}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input }
```

## עיקרון CSS Variables
```css
/* אין צבעים קשיחים */
background: var(--color-input-bg);
color: var(--color-input-text);
border-color: var(--color-input-border);
/* שגיאה */
border-color: var(--color-input-border-error);
/* disabled */
background: var(--color-input-disabled-bg);
/* focus ring */
box-shadow: 0 0 0 2px var(--color-ring);
/* placeholder */
color: var(--color-input-placeholder);
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
