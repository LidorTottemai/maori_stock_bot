# AlertDialog

> **קטגוריה:** feedback
> **תלויות:** @radix-ui/react-alert-dialog, react, clsx
> **Storybook:** src/stories/AlertDialog.stories.tsx
> **קוד:** src/feedback/AlertDialog.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
דיאלוג אישור חוסם המבוסס על Radix UI AlertDialog. מיועד לפעולות שדורשות אישור מפורש מהמשתמש לפני ביצוע, כמו מחיקה או שינוי הרסני. חוסם אינטרקציה עם שאר הדף, תומך בפעולות הרסניות, מצב טעינה, ו-RTL מלא.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | דיאלוג אישור סטנדרטי |
| Destructive Action | כפתור אישור בצבע אדום לפעולה הרסנית |
| With Custom Title | כותרת ותיאור מותאמים אישית |
| Cancel Only | רק כפתור ביטול, ללא אישור |
| Loading State | כפתור אישור במצב טעינה |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | `string` | — | כותרת הדיאלוג (חובה) |
| description | `string` | — | תיאור/הסבר לפעולה |
| confirmLabel | `string` | `'אישור'` | טקסט כפתור אישור |
| cancelLabel | `string` | `'ביטול'` | טקסט כפתור ביטול |
| onConfirm | `() => void` | — | callback בעת אישור (חובה) |
| onCancel | `() => void` | — | callback בעת ביטול |
| destructive | `boolean` | `false` | סגנון הרסני לכפתור האישור |
| loading | `boolean` | `false` | מצב טעינה לכפתור האישור |
| className | `string` | — | class נוסף ל-Content |

## שימוש בסיסי
```tsx
import { AlertDialog, AlertDialogTrigger, AlertDialogContent } from "@tottemai/ui"

// דיאלוג מחיקה הרסני
<AlertDialog>
  <AlertDialogTrigger asChild>
    <button>מחק משתמש</button>
  </AlertDialogTrigger>
  <AlertDialogContent
    title="מחיקת משתמש"
    description="פעולה זו אינה הפיכה. כל הנתונים של המשתמש יימחקו לצמיתות."
    confirmLabel="מחק"
    cancelLabel="ביטול"
    destructive
    onConfirm={() => deleteUser(userId)}
    onCancel={() => console.log("cancelled")}
  />
</AlertDialog>

// דיאלוג עם טעינה
<AlertDialog>
  <AlertDialogTrigger asChild>
    <button>שלח</button>
  </AlertDialogTrigger>
  <AlertDialogContent
    title="אישור שליחה"
    description="האם אתה בטוח שברצונך לשלוח?"
    onConfirm={handleConfirm}
    loading={isSubmitting}
  />
</AlertDialog>
```

## קוד מלא
```tsx
// src/feedback/AlertDialog.tsx
import React from "react"
import * as RadixAlertDialog from "@radix-ui/react-alert-dialog"
import clsx from "clsx"

// ─── Re-exports of Radix primitives ───────────────────────────────────────────
export const AlertDialog = RadixAlertDialog.Root
export const AlertDialogTrigger = RadixAlertDialog.Trigger
export const AlertDialogPortal = RadixAlertDialog.Portal

// ─── Overlay ──────────────────────────────────────────────────────────────────
export const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof RadixAlertDialog.Overlay>,
  React.ComponentPropsWithoutRef<typeof RadixAlertDialog.Overlay>
>(({ className, ...props }, ref) => (
  <RadixAlertDialog.Overlay
    ref={ref}
    className={clsx("alert-dialog-overlay", className)}
    style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "var(--color-overlay, rgba(0, 0, 0, 0.5))",
      backdropFilter: "blur(2px)",
      zIndex: "var(--z-overlay, 50)",
      animation: "alertDialogOverlayIn var(--duration-normal, 200ms) ease",
    }}
    {...props}
  />
))
AlertDialogOverlay.displayName = "AlertDialogOverlay"

// ─── Loading spinner ──────────────────────────────────────────────────────────
const Spinner = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{
      animation: "spin var(--duration-slow, 1s) linear infinite",
    }}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

// ─── Content props ────────────────────────────────────────────────────────────
export interface AlertDialogContentProps {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel?: () => void
  destructive?: boolean
  loading?: boolean
  className?: string
}

// ─── Content ──────────────────────────────────────────────────────────────────
export function AlertDialogContent({
  title,
  description,
  confirmLabel = "אישור",
  cancelLabel = "ביטול",
  onConfirm,
  onCancel,
  destructive = false,
  loading = false,
  className,
}: AlertDialogContentProps) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <RadixAlertDialog.Content
        className={clsx("alert-dialog-content", className)}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(90vw, var(--size-dialog-sm, 28rem))",
          backgroundColor: "var(--color-surface, #ffffff)",
          borderRadius: "var(--radius-lg, 0.75rem)",
          padding: "var(--spacing-6, 1.5rem)",
          boxShadow: "var(--shadow-xl, 0 20px 60px rgba(0,0,0,0.15))",
          zIndex: "var(--z-modal, 51)",
          animation: "alertDialogContentIn var(--duration-normal, 200ms) ease",
          outline: "none",
        }}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {/* Title */}
        <RadixAlertDialog.Title
          style={{
            margin: 0,
            fontSize: "var(--font-size-lg, 1.125rem)",
            fontWeight: "var(--font-weight-semibold, 600)",
            color: "var(--color-text-primary, #0f172a)",
            lineHeight: "var(--line-height-tight, 1.25)",
            marginBottom: description
              ? "var(--spacing-2, 0.5rem)"
              : "var(--spacing-6, 1.5rem)",
          }}
        >
          {title}
        </RadixAlertDialog.Title>

        {/* Description */}
        {description && (
          <RadixAlertDialog.Description
            style={{
              margin: 0,
              fontSize: "var(--font-size-sm, 0.875rem)",
              color: "var(--color-text-secondary, #64748b)",
              lineHeight: "var(--line-height-normal, 1.5)",
              marginBottom: "var(--spacing-6, 1.5rem)",
            }}
          >
            {description}
          </RadixAlertDialog.Description>
        )}

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: "var(--spacing-3, 0.75rem)",
            justifyContent: "flex-end",
            flexDirection: "row-reverse",
          }}
        >
          {/* Confirm button */}
          <RadixAlertDialog.Action asChild>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              aria-busy={loading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--spacing-2, 0.5rem)",
                paddingInline: "var(--spacing-4, 1rem)",
                paddingBlock: "var(--spacing-2, 0.5rem)",
                borderRadius: "var(--radius-md, 0.5rem)",
                border: "none",
                fontSize: "var(--font-size-sm, 0.875rem)",
                fontWeight: "var(--font-weight-medium, 500)",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "opacity var(--duration-fast, 150ms) ease, background-color var(--duration-fast, 150ms) ease",
                backgroundColor: destructive
                  ? "var(--color-error, #dc2626)"
                  : "var(--color-primary, #2563eb)",
                color: "var(--color-on-primary, #ffffff)",
              }}
            >
              {loading && <Spinner />}
              {confirmLabel}
            </button>
          </RadixAlertDialog.Action>

          {/* Cancel button */}
          <RadixAlertDialog.Cancel asChild>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                paddingInline: "var(--spacing-4, 1rem)",
                paddingBlock: "var(--spacing-2, 0.5rem)",
                borderRadius: "var(--radius-md, 0.5rem)",
                border: "1px solid var(--color-border, #e2e8f0)",
                fontSize: "var(--font-size-sm, 0.875rem)",
                fontWeight: "var(--font-weight-medium, 500)",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "opacity var(--duration-fast, 150ms) ease, background-color var(--duration-fast, 150ms) ease",
                backgroundColor: "var(--color-surface, #ffffff)",
                color: "var(--color-text-primary, #0f172a)",
              }}
            >
              {cancelLabel}
            </button>
          </RadixAlertDialog.Cancel>
        </div>
      </RadixAlertDialog.Content>
    </AlertDialogPortal>
  )
}

/*
  Required global keyframe animations (add to your global CSS):

  @keyframes alertDialogOverlayIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes alertDialogContentIn {
    from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
    to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
*/
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
