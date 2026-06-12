# Textarea

> **קטגוריה:** forms
> **תלויות:** clsx
> **Storybook:** src/stories/Textarea.stories.tsx
> **קוד:** src/forms/Textarea.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
שדה טקסט מרובה שורות עם auto-resize אופציונלי וספירת תווים.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | textarea רגיל |
| AutoResize | מתרחב אוטומטית עם תוכן |
| WithCharCount | ספירת תווים (נוכחי/מקסימום) |
| Error | מצב שגיאה |
| Disabled | מושבת |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| autoResize | boolean | false | האם להתרחב אוטומטית |
| maxLength | number | — | מגביל וממיין ספירת תווים |
| showCharCount | boolean | false | מציג ספירת תווים |
| error | boolean | false | מצב שגיאה |
| disabled | boolean | false | השבתת השדה |
| className | string | — | CSS classes נוספים |
| rows | number | 3 | מספר שורות ברירת מחדל |

## שימוש בסיסי
```tsx
import { Textarea } from "@tottemai/ui"

// Default
<Textarea placeholder="הכנס טקסט..." />

// Auto-resize
<Textarea autoResize placeholder="מתרחב אוטומטית..." />

// With character count
<Textarea showCharCount maxLength={200} placeholder="עד 200 תווים" />

// Error state
<Textarea error placeholder="שדה חובה" />
```

## קוד מלא
```tsx
// src/forms/Textarea.tsx
"use client"
import * as React from "react"
import clsx from "clsx"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean
  showCharCount?: boolean
  error?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      autoResize = false,
      showCharCount = false,
      maxLength,
      error = false,
      disabled = false,
      rows = 3,
      className,
      onChange,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const innerRef = React.useRef<HTMLTextAreaElement | null>(null)

    const [charCount, setCharCount] = React.useState(() => {
      if (value !== undefined) return String(value).length
      if (defaultValue !== undefined) return String(defaultValue).length
      return 0
    })

    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        innerRef.current = node
        if (typeof ref === "function") {
          ref(node)
        } else if (ref) {
          ;(ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node
        }
      },
      [ref]
    )

    const handleAutoResize = React.useCallback((el: HTMLTextAreaElement) => {
      if (!autoResize) return
      el.style.height = "auto"
      el.style.height = `${el.scrollHeight}px`
    }, [autoResize])

    // Initial auto-resize on mount
    React.useEffect(() => {
      if (innerRef.current && autoResize) {
        handleAutoResize(innerRef.current)
      }
    }, [autoResize, handleAutoResize])

    // Sync controlled value changes for auto-resize
    React.useEffect(() => {
      if (innerRef.current && autoResize && value !== undefined) {
        handleAutoResize(innerRef.current)
      }
    }, [value, autoResize, handleAutoResize])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      setCharCount(newValue.length)
      if (autoResize) {
        handleAutoResize(e.target)
      }
      onChange?.(e)
    }

    const isNearLimit = maxLength !== undefined && charCount >= Math.floor(maxLength * 0.9)
    const isAtLimit = maxLength !== undefined && charCount >= maxLength

    // Compute min-height from rows (approximate 1.5rem line height + padding)
    const minHeight = `calc(${rows} * 1.5rem + 1rem)`

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", width: "100%" }}>
        <textarea
          ref={setRefs}
          disabled={disabled}
          maxLength={maxLength}
          rows={rows}
          dir="auto"
          aria-invalid={error ? "true" : undefined}
          aria-describedby={showCharCount ? "char-count" : undefined}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          className={clsx("textarea", className)}
          style={{
            width: "100%",
            minHeight,
            paddingBlock: "0.5rem",
            paddingInline: "0.75rem",
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
            resize: autoResize ? "none" : "vertical",
            overflowY: autoResize ? "hidden" : "auto",
            fontFamily: "inherit",
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
          {...props}
        />

        {showCharCount && (
          <span
            id="char-count"
            aria-live="polite"
            aria-atomic="true"
            style={{
              alignSelf: "flex-end",
              fontSize: "0.75rem",
              lineHeight: "1",
              color: isAtLimit || (error && isNearLimit)
                ? "var(--color-destructive)"
                : isNearLimit
                ? "var(--color-input-border-error)"
                : "var(--color-input-placeholder)",
              transition: "color 150ms ease",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {charCount}
            {maxLength !== undefined && `/${maxLength}`}
          </span>
        )}
      </div>
    )
  }
)

Textarea.displayName = "Textarea"

export { Textarea }
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
/* ספירת תווים — קרוב לגבול */
color: var(--color-destructive);
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
