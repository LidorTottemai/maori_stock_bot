# Input

> **קטגוריה:** forms
> **תלויות:** none (native input)
> **Storybook:** src/stories/Input.stories.tsx
> **קוד:** src/forms/Input.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
שדה קלט טקסט בסיסי עם תמיכה מלאה ב-icons משמאל/ימין, מצב שגיאה עם הודעה, disabled, סוגי input שונים (כולל password עם toggle חשיפה), ו-RTL מלא. משתמש ב-React.forwardRef לגישה ישירה ל-DOM element. כל המידות, צבעים ורדיוסים מגיעים דרך CSS variables בלבד.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | שדה קלט רגיל עם placeholder |
| WithIconLeft | אייקון בצד שמאל (חיפוש, דוא"ל) — מועבר לימין ב-RTL |
| WithIconRight | אייקון בצד ימין (ניקוי, אישור) |
| WithBothIcons | אייקון בשני הצדדים |
| ErrorBool | border אדום בלי הודעה |
| ErrorString | border אדום + הודעת שגיאה מתחת |
| Disabled | שדה מושבת (cursor: not-allowed) |
| Password | סוג password עם כפתור toggle הצג/הסתר |
| Sizes | sm / md / lg |
| RTL | ממשק ימין-לשמאל מלא |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | `string` | `"text"` | סוג ה-input (text, email, password, number וכו') |
| placeholder | `string` | `undefined` | טקסט placeholder |
| value | `string` | `undefined` | ערך נשלט |
| onChange | `(e: React.ChangeEvent<HTMLInputElement>) => void` | `undefined` | callback לשינוי ערך |
| disabled | `boolean` | `false` | מנטרל את ה-input |
| error | `boolean \| string` | `false` | מצב שגיאה — `true` לסגנון בלבד, `string` להודעה מתחת |
| iconLeft | `React.ReactNode` | `undefined` | אייקון בצד inline-start |
| iconRight | `React.ReactNode` | `undefined` | אייקון בצד inline-end |
| size | `"sm" \| "md" \| "lg"` | `"md"` | גודל הקומפוננטה |
| wrapperClassName | `string` | `undefined` | class נוסף לעטיפה החיצונית |
| className | `string` | `undefined` | class נוסף לאלמנט ה-input עצמו |
| id | `string` | `undefined` | id לקישור עם label |
| name | `string` | `undefined` | שם השדה בטפסים |
| required | `boolean` | `false` | האם שדה חובה |
| autoComplete | `string` | `undefined` | autocomplete hint לדפדפן |

## שימוש בסיסי
```tsx
import { Input } from "@tottemai/ui"

// פשוט
<Input placeholder="הכנס טקסט..." />

// עם אייקון ושגיאה
<Input
  type="email"
  placeholder="your@email.com"
  iconLeft={<MailIcon />}
  error="כתובת מייל לא תקינה"
/>

// password עם toggle
<Input type="password" placeholder="סיסמה" />

// RTL
<div dir="rtl">
  <Input placeholder="חפש..." iconLeft={<SearchIcon />} />
</div>
```

## קוד מלא
```tsx
// src/forms/Input.tsx
"use client"
import * as React from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

export type InputSize = "sm" | "md" | "lg"

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** אייקון בצד inline-start (מתחלף אוטומטית ב-RTL) */
  iconLeft?: React.ReactNode
  /** אייקון בצד inline-end */
  iconRight?: React.ReactNode
  /** מצב שגיאה: boolean לסגנון בלבד, string מציג הודעה מתחת */
  error?: boolean | string
  /** גודל הקומפוננטה */
  size?: InputSize
  /** class נוסף לעטיפה החיצונית */
  wrapperClassName?: string
}

// ─── Size maps ────────────────────────────────────────────────────────────────

const INPUT_HEIGHT: Record<InputSize, string> = {
  sm: "32px",
  md: "40px",
  lg: "48px",
}

const INPUT_FONT: Record<InputSize, string> = {
  sm: "0.8125rem",
  md: "0.875rem",
  lg: "1rem",
}

const INPUT_PADDING_INLINE: Record<InputSize, string> = {
  sm: "10px",
  md: "12px",
  lg: "16px",
}

// icon slot width = inset + icon size
const ICON_SLOT: Record<InputSize, string> = {
  sm: "30px",
  md: "36px",
  lg: "42px",
}

const ICON_INSET: Record<InputSize, string> = {
  sm: "7px",
  md: "9px",
  lg: "12px",
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      type = "text",
      iconLeft,
      iconRight,
      error,
      size = "md",
      disabled = false,
      wrapperClassName,
      className,
      onFocus,
      onBlur,
      style,
      id: idProp,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref
  ) {
    const generatedId = React.useId()
    const inputId = idProp ?? generatedId
    const errorId = `${inputId}-error`

    const [focused, setFocused] = React.useState(false)
    const [showPassword, setShowPassword] = React.useState(false)

    const isPassword = type === "password"
    const resolvedType = isPassword ? (showPassword ? "text" : "password") : type
    const hasError = Boolean(error)
    const errorMessage = typeof error === "string" ? error : undefined

    const showIconLeft = Boolean(iconLeft)
    const showIconRight = Boolean(iconRight) && !isPassword
    const showPasswordToggle = isPassword

    const paddingStart = showIconLeft
      ? `calc(${INPUT_PADDING_INLINE[size]} + ${ICON_SLOT[size]})`
      : INPUT_PADDING_INLINE[size]
    const paddingEnd =
      showIconRight || showPasswordToggle
        ? `calc(${INPUT_PADDING_INLINE[size]} + ${ICON_SLOT[size]})`
        : INPUT_PADDING_INLINE[size]

    const focusBorderColor = hasError
      ? "var(--color-input-border-error)"
      : "var(--color-ring)"
    const focusShadow = hasError
      ? "0 0 0 3px var(--color-error-ring, color-mix(in srgb, var(--color-input-border-error) 25%, transparent))"
      : "0 0 0 3px var(--color-focus-ring, color-mix(in srgb, var(--color-ring) 25%, transparent))"

    const describedBy = [ariaDescribedBy, errorMessage ? errorId : ""]
      .filter(Boolean)
      .join(" ") || undefined

    const inputStyle: React.CSSProperties = {
      width: "100%",
      boxSizing: "border-box",
      height: INPUT_HEIGHT[size],
      paddingInlineStart: paddingStart,
      paddingInlineEnd: paddingEnd,
      paddingBlock: "0",
      fontSize: INPUT_FONT[size],
      fontFamily: "inherit",
      lineHeight: "1.5",
      backgroundColor: disabled
        ? "var(--color-input-disabled-bg)"
        : "var(--color-input-bg)",
      color: disabled
        ? "var(--color-text-disabled, var(--color-input-placeholder))"
        : "var(--color-input-text)",
      border: "1px solid",
      borderColor: hasError
        ? "var(--color-input-border-error)"
        : "var(--color-input-border)",
      borderRadius: "var(--radius-md, 6px)",
      outline: "none",
      transition: "border-color 150ms ease, box-shadow 150ms ease",
      cursor: disabled ? "not-allowed" : "text",
      opacity: disabled ? 0.6 : 1,
      ...(focused && {
        borderColor: focusBorderColor,
        boxShadow: focusShadow,
      }),
      ...style,
    }

    const iconBaseStyle: React.CSSProperties = {
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      display: "flex",
      alignItems: "center",
      pointerEvents: "none",
      userSelect: "none",
      color: hasError
        ? "var(--color-input-border-error)"
        : "var(--color-input-placeholder)",
    }

    return (
      <div className={wrapperClassName} style={{ width: "100%" }}>
        <div style={{ position: "relative", display: "inline-flex", width: "100%" }}>

          {/* Icon Left (inline-start) — visually flips in RTL via logical CSS */}
          {showIconLeft && (
            <span
              aria-hidden="true"
              style={{
                ...iconBaseStyle,
                insetInlineStart: ICON_INSET[size],
              }}
            >
              {iconLeft}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            disabled={disabled}
            aria-invalid={hasError ? "true" : undefined}
            aria-describedby={describedBy}
            dir="auto"
            className={className}
            style={inputStyle}
            onFocus={(e) => {
              setFocused(true)
              onFocus?.(e)
            }}
            onBlur={(e) => {
              setFocused(false)
              onBlur?.(e)
            }}
            {...props}
          />

          {/* Password visibility toggle */}
          {showPasswordToggle && (
            <button
              type="button"
              tabIndex={-1}
              aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
              onClick={() => !disabled && setShowPassword((p) => !p)}
              style={{
                position: "absolute",
                insetInlineEnd: ICON_INSET[size],
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                alignItems: "center",
                background: "none",
                border: "none",
                padding: "2px",
                cursor: disabled ? "not-allowed" : "pointer",
                color: "var(--color-input-placeholder)",
                borderRadius: "var(--radius-sm, 3px)",
                pointerEvents: disabled ? "none" : "auto",
              }}
            >
              {showPassword ? (
                <svg
                  width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                  aria-hidden="true" focusable="false"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                  aria-hidden="true" focusable="false"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}

          {/* Icon Right (inline-end) */}
          {showIconRight && (
            <span
              aria-hidden="true"
              style={{
                ...iconBaseStyle,
                insetInlineEnd: ICON_INSET[size],
              }}
            >
              {iconRight}
            </span>
          )}
        </div>

        {/* Error message — announced via role="alert" */}
        {errorMessage && (
          <span
            id={errorId}
            role="alert"
            aria-live="polite"
            style={{
              display: "block",
              marginTop: "4px",
              fontSize: "0.75rem",
              lineHeight: "1.4",
              color: "var(--color-input-border-error)",
            }}
          >
            {errorMessage}
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

/* מצב שגיאה */
border-color: var(--color-input-border-error);
box-shadow: 0 0 0 3px var(--color-error-ring);

/* focus ring */
border-color: var(--color-ring);
box-shadow: 0 0 0 3px var(--color-focus-ring);

/* disabled */
background: var(--color-input-disabled-bg);
color: var(--color-text-disabled);
opacity: 0.6;

/* placeholder / icon color */
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
