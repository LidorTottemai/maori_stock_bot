# Alert

> **קטגוריה:** feedback
> **תלויות:** react, clsx
> **Storybook:** src/stories/Alert.stories.tsx
> **קוד:** src/feedback/Alert.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
קומפוננטת התראה סטטית המוצגת בתוך הדף. תומכת בארבעה וריאנטים: info/success/warning/error, עם אייקון מובנה לכל וריאנט, אפשרות סגירה (dismiss), כותרת ותיאור. מתאימה להצגת הודעות מערכת, אזהרות וחיווי מצב. תומכת ב-RTL.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Info | וריאנט ברירת מחדל, צבע כחול, אייקון מידע |
| Success | וריאנט הצלחה, צבע ירוק, אייקון וי |
| Warning | וריאנט אזהרה, צבע צהוב/כתום, אייקון משולש |
| Error | וריאנט שגיאה, צבע אדום, אייקון X |
| Dismissible | התראה עם כפתור סגירה |
| With Title | התראה עם כותרת ותיאור |
| Without Icon | התראה ללא אייקון |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | סגנון ההתראה |
| title | `string` | — | כותרת אופציונלית |
| description | `string \| ReactNode` | — | תוכן ההתראה |
| icon | `ReactNode` | — | אייקון מותאם אישית (מחליף את ברירת המחדל) |
| dismissible | `boolean` | `false` | האם להציג כפתור סגירה |
| onDismiss | `() => void` | — | callback בעת סגירה |
| className | `string` | — | class נוסף לעיצוב חיצוני |

## שימוש בסיסי
```tsx
import { Alert } from "@tottemai/ui"

// פשוט
<Alert variant="info" description="שים לב: המערכת תעלה לאוויר בקרוב." />

// עם כותרת וסגירה
<Alert
  variant="success"
  title="הפעולה הצליחה"
  description="הנתונים נשמרו בהצלחה."
  dismissible
  onDismiss={() => console.log("dismissed")}
/>

// שגיאה
<Alert
  variant="error"
  title="שגיאה בטעינה"
  description="לא ניתן לטעון את הנתונים. נסה שוב מאוחר יותר."
/>
```

## קוד מלא
```tsx
// src/feedback/Alert.tsx
import React, { useState } from "react"
import clsx from "clsx"

export type AlertVariant = "info" | "success" | "warning" | "error"

export interface AlertProps {
  variant?: AlertVariant
  title?: string
  description?: React.ReactNode
  icon?: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}

const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)

const SuccessIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const WarningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const ErrorIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
)

const DismissIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const defaultIcons: Record<AlertVariant, React.ReactNode> = {
  info: <InfoIcon />,
  success: <SuccessIcon />,
  warning: <WarningIcon />,
  error: <ErrorIcon />,
}

const variantStyles: Record<AlertVariant, React.CSSProperties> = {
  info: {
    backgroundColor: "var(--color-info-subtle, #eff6ff)",
    borderColor: "var(--color-info-border, #bfdbfe)",
    color: "var(--color-info-fg, #1d4ed8)",
  },
  success: {
    backgroundColor: "var(--color-success-subtle, #f0fdf4)",
    borderColor: "var(--color-success-border, #bbf7d0)",
    color: "var(--color-success-fg, #15803d)",
  },
  warning: {
    backgroundColor: "var(--color-warning-subtle, #fffbeb)",
    borderColor: "var(--color-warning-border, #fde68a)",
    color: "var(--color-warning-fg, #b45309)",
  },
  error: {
    backgroundColor: "var(--color-error-subtle, #fef2f2)",
    borderColor: "var(--color-error-border, #fecaca)",
    color: "var(--color-error-fg, #b91c1c)",
  },
}

const variantRoles: Record<AlertVariant, React.AriaRole> = {
  info: "note",
  success: "status",
  warning: "note",
  error: "alert",
}

export function Alert({
  variant = "info",
  title,
  description,
  icon,
  dismissible = false,
  onDismiss,
  className,
}: AlertProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  const renderedIcon = icon !== undefined ? icon : defaultIcons[variant]

  return (
    <div
      role={variantRoles[variant]}
      aria-live="polite"
      style={{
        display: "flex",
        gap: "var(--spacing-3, 0.75rem)",
        padding: "var(--spacing-4, 1rem)",
        borderRadius: "var(--radius-md, 0.5rem)",
        border: "1px solid",
        ...variantStyles[variant],
      }}
      className={clsx("alert", `alert--${variant}`, className)}
    >
      {renderedIcon && (
        <span
          style={{
            flexShrink: 0,
            marginTop: "var(--spacing-0-5, 0.125rem)",
          }}
        >
          {renderedIcon}
        </span>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <p
            style={{
              margin: 0,
              fontWeight: "var(--font-weight-semibold, 600)",
              fontSize: "var(--font-size-sm, 0.875rem)",
              lineHeight: "var(--line-height-tight, 1.25)",
              marginBottom: description
                ? "var(--spacing-1, 0.25rem)"
                : undefined,
            }}
          >
            {title}
          </p>
        )}
        {description && (
          <div
            style={{
              margin: 0,
              fontSize: "var(--font-size-sm, 0.875rem)",
              lineHeight: "var(--line-height-normal, 1.5)",
              opacity: 0.9,
            }}
          >
            {description}
          </div>
        )}
      </div>

      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="סגור התראה"
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "var(--size-6, 1.5rem)",
            height: "var(--size-6, 1.5rem)",
            padding: 0,
            border: "none",
            borderRadius: "var(--radius-sm, 0.25rem)",
            backgroundColor: "transparent",
            color: "currentColor",
            cursor: "pointer",
            opacity: 0.7,
            transition: "opacity var(--duration-fast, 150ms) ease",
            marginTop: "calc(var(--spacing-0-5, 0.125rem) * -1)",
            marginInlineStart: "auto",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.opacity = "1")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.opacity = "0.7")
          }
          onFocus={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.opacity = "1")
          }
          onBlur={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.opacity = "0.7")
          }
        >
          <DismissIcon />
        </button>
      )}
    </div>
  )
}

export default Alert
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
