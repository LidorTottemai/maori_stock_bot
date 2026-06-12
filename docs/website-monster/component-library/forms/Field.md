# Field

> **קטגוריה:** forms
> **תלויות:** clsx
> **Storybook:** src/stories/Field.stories.tsx
> **קוד:** src/forms/Field.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
קומפוננט compound המאחד Label + Input/Textarea + HelperText + ErrorMessage לתבנית שדה טופס מלאה.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | שדה רגיל עם label |
| WithHelper | שדה עם טקסט עזר |
| WithError | שדה עם הודעת שגיאה |
| Required | שדה חובה |
| FullForm | טופס מלא עם מספר שדות |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| **Field (root)** | | | |
| children | React.ReactNode | — | תוכן השדה |
| **Field.Label** | | | |
| required | boolean | false | חובה |
| children | React.ReactNode | — | טקסט |
| **Field.Control** | | | |
| children | React.ReactNode | — | Input, Textarea, Select וכד׳ |
| **Field.HelperText** | | | |
| children | React.ReactNode | — | טקסט עזר |
| **Field.ErrorMessage** | | | |
| children | React.ReactNode | — | הודעת שגיאה (מוצגת רק אם יש תוכן) |

## שימוש בסיסי
```tsx
import { Field } from "@tottemai/ui"

// שדה רגיל
<Field>
  <Field.Label>שם מלא</Field.Label>
  <Field.Control>
    <input type="text" placeholder="הכנס שם..." />
  </Field.Control>
</Field>

// שדה עם עזר ושגיאה
<Field>
  <Field.Label required>אימייל</Field.Label>
  <Field.Control>
    <input type="email" />
  </Field.Control>
  <Field.HelperText>נשלח אישור לכתובת זו</Field.HelperText>
  <Field.ErrorMessage>כתובת אימייל לא תקינה</Field.ErrorMessage>
</Field>

// טופס מלא
<form>
  <Field>
    <Field.Label required>שם פרטי</Field.Label>
    <Field.Control>
      <input type="text" />
    </Field.Control>
    <Field.HelperText>כפי שמופיע בתעודת הזהות</Field.HelperText>
  </Field>

  <Field>
    <Field.Label required>סיסמה</Field.Label>
    <Field.Control>
      <input type="password" />
    </Field.Control>
    <Field.ErrorMessage>הסיסמה חייבת להכיל לפחות 8 תווים</Field.ErrorMessage>
  </Field>
</form>
```

## קוד מלא
```tsx
// src/forms/Field.tsx
"use client"
import * as React from "react"
import clsx from "clsx"

// ─── Context ────────────────────────────────────────────────────────────────

interface FieldContextValue {
  fieldId: string
  helperId: string
  errorId: string
}

const FieldContext = React.createContext<FieldContextValue | null>(null)

function useFieldContext(): FieldContextValue {
  const ctx = React.useContext(FieldContext)
  if (!ctx) {
    throw new Error("Field sub-components must be used inside <Field>")
  }
  return ctx
}

// ─── Field (root) ───────────────────────────────────────────────────────────

export interface FieldProps {
  children?: React.ReactNode
  className?: string
}

function FieldRoot({ children, className }: FieldProps) {
  const uid = React.useId()
  const fieldId = `field-${uid}`
  const helperId = `helper-${uid}`
  const errorId = `error-${uid}`

  return (
    <FieldContext.Provider value={{ fieldId, helperId, errorId }}>
      <div
        className={clsx("field-root", className)}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem",
        }}
      >
        {children}
      </div>
    </FieldContext.Provider>
  )
}

FieldRoot.displayName = "Field"

// ─── Field.Label ────────────────────────────────────────────────────────────

export interface FieldLabelProps {
  required?: boolean
  children?: React.ReactNode
  className?: string
}

function FieldLabel({ required = false, children, className }: FieldLabelProps) {
  const { fieldId } = useFieldContext()

  return (
    <label
      htmlFor={fieldId}
      className={clsx("field-label", className)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        fontSize: "var(--font-size-sm)",
        fontWeight: "var(--font-weight-medium)",
        color: "var(--color-label)",
        cursor: "default",
        userSelect: "none",
      }}
    >
      {children}
      {required && (
        <span
          aria-hidden="true"
          style={{
            color: "var(--color-destructive)",
            marginInlineStart: "0.125rem",
            lineHeight: 1,
          }}
        >
          *
        </span>
      )}
    </label>
  )
}

FieldLabel.displayName = "Field.Label"

// ─── Field.Control ──────────────────────────────────────────────────────────

export interface FieldControlProps {
  children?: React.ReactNode
  className?: string
}

function FieldControl({ children, className }: FieldControlProps) {
  const { fieldId, helperId, errorId } = useFieldContext()

  // Clone the single child to inject accessibility attributes
  const child = React.Children.only(children) as React.ReactElement<
    React.HTMLAttributes<HTMLElement> & { id?: string; "aria-describedby"?: string; "aria-errormessage"?: string }
  >

  return React.cloneElement(child, {
    id: child.props.id ?? fieldId,
    "aria-describedby": [
      child.props["aria-describedby"],
      helperId,
    ]
      .filter(Boolean)
      .join(" ") || undefined,
    "aria-errormessage": child.props["aria-errormessage"] ?? errorId,
    className: clsx((child.props as { className?: string }).className, "field-control", className),
  })
}

FieldControl.displayName = "Field.Control"

// ─── Field.HelperText ───────────────────────────────────────────────────────

export interface FieldHelperTextProps {
  children?: React.ReactNode
  className?: string
}

function FieldHelperText({ children, className }: FieldHelperTextProps) {
  const { helperId } = useFieldContext()

  if (!children) return null

  return (
    <p
      id={helperId}
      className={clsx("field-helper-text", className)}
      style={{
        margin: 0,
        fontSize: "var(--font-size-xs, 0.75rem)",
        color: "var(--color-helper-text)",
        lineHeight: "var(--line-height-normal, 1.5)",
      }}
    >
      {children}
    </p>
  )
}

FieldHelperText.displayName = "Field.HelperText"

// ─── Field.ErrorMessage ─────────────────────────────────────────────────────

export interface FieldErrorMessageProps {
  children?: React.ReactNode
  className?: string
}

function FieldErrorMessage({ children, className }: FieldErrorMessageProps) {
  const { errorId } = useFieldContext()

  if (!children) return null

  return (
    <p
      id={errorId}
      role="alert"
      aria-live="polite"
      className={clsx("field-error-message", className)}
      style={{
        margin: 0,
        fontSize: "var(--font-size-xs, 0.75rem)",
        color: "var(--color-destructive)",
        lineHeight: "var(--line-height-normal, 1.5)",
      }}
    >
      {children}
    </p>
  )
}

FieldErrorMessage.displayName = "Field.ErrorMessage"

// ─── Compound export ────────────────────────────────────────────────────────

export const Field = Object.assign(FieldRoot, {
  Label: FieldLabel,
  Control: FieldControl,
  HelperText: FieldHelperText,
  ErrorMessage: FieldErrorMessage,
})
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
