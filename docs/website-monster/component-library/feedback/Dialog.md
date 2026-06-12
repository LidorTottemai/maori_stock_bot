# Dialog

> **קטגוריה:** feedback
> **תלויות:** @radix-ui/react-dialog, react, clsx
> **Storybook:** src/stories/Dialog.stories.tsx
> **קוד:** src/feedback/Dialog.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
מודאל כללי המבוסס על Radix UI Dialog. כולל header עם כותרת ותיאור, אזור תוכן גלילי, footer לפעולות, וחמישה גדלים: sm/md/lg/xl/fullscreen. מנהל focus trap אוטומטי, סגירה ב-Escape, ותמיכה מלאה ב-RTL.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default (md) | גודל בינוני, ברירת מחדל |
| Small | דיאלוג קטן לאישורים פשוטים |
| Large | דיאלוג רחב לתוכן מורכב |
| XL | דיאלוג גדול מאוד לפורמים ארוכים |
| Fullscreen | דיאלוג על כל המסך |
| Without Footer | ללא footer, תוכן בלבד |
| Scrollable Content | תוכן גלילי כאשר הדיאלוג גדול מהמסך |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'fullscreen'` | `'md'` | גודל הדיאלוג |
| title | `string` | — | כותרת בה-header |
| description | `string` | — | תיאור מתחת לכותרת |
| footer | `ReactNode` | — | תוכן ה-footer (כפתורים וכד') |
| closeButton | `boolean` | `true` | האם להציג כפתור X לסגירה |
| className | `string` | — | class נוסף ל-Content |
| children | `ReactNode` | — | תוכן גוף הדיאלוג |

## שימוש בסיסי
```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@tottemai/ui"

// דיאלוג בסיסי
<Dialog>
  <DialogTrigger asChild>
    <button>פתח דיאלוג</button>
  </DialogTrigger>
  <DialogContent
    title="הגדרות חשבון"
    description="עדכן את פרטי חשבונך"
    footer={
      <DialogFooter>
        <button>שמור</button>
      </DialogFooter>
    }
  >
    <p>תוכן הדיאלוג כאן</p>
  </DialogContent>
</Dialog>

// דיאלוג גדול
<Dialog>
  <DialogTrigger asChild>
    <button>פתח טופס</button>
  </DialogTrigger>
  <DialogContent size="lg" title="הוספת משתמש חדש">
    <form>...</form>
  </DialogContent>
</Dialog>
```

## קוד מלא
```tsx
// src/feedback/Dialog.tsx
import React from "react"
import * as RadixDialog from "@radix-ui/react-dialog"
import clsx from "clsx"

// ─── Re-exports ───────────────────────────────────────────────────────────────
export const Dialog = RadixDialog.Root
export const DialogTrigger = RadixDialog.Trigger
export const DialogPortal = RadixDialog.Portal
export const DialogClose = RadixDialog.Close

// ─── Overlay ──────────────────────────────────────────────────────────────────
export const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Overlay>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Overlay>
>(({ className, ...props }, ref) => (
  <RadixDialog.Overlay
    ref={ref}
    className={clsx("dialog-overlay", className)}
    style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "var(--color-overlay, rgba(0, 0, 0, 0.5))",
      backdropFilter: "blur(2px)",
      zIndex: "var(--z-overlay, 50)",
      animation: "dialogOverlayIn var(--duration-normal, 200ms) ease",
    }}
    {...props}
  />
))
DialogOverlay.displayName = "DialogOverlay"

// ─── Close icon ───────────────────────────────────────────────────────────────
const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
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

// ─── Size map ─────────────────────────────────────────────────────────────────
type DialogSize = "sm" | "md" | "lg" | "xl" | "fullscreen"

const sizeStyles: Record<DialogSize, React.CSSProperties> = {
  sm: {
    width: "min(90vw, var(--size-dialog-sm, 24rem))",
    maxHeight: "min(85vh, var(--size-dialog-max-h, 600px))",
  },
  md: {
    width: "min(90vw, var(--size-dialog-md, 32rem))",
    maxHeight: "min(85vh, var(--size-dialog-max-h, 600px))",
  },
  lg: {
    width: "min(90vw, var(--size-dialog-lg, 48rem))",
    maxHeight: "min(85vh, var(--size-dialog-max-h, 700px))",
  },
  xl: {
    width: "min(90vw, var(--size-dialog-xl, 64rem))",
    maxHeight: "min(90vh, var(--size-dialog-max-h-xl, 800px))",
  },
  fullscreen: {
    width: "100vw",
    height: "100vh",
    maxHeight: "100vh",
    borderRadius: 0,
    top: 0,
    left: 0,
    transform: "none",
  },
}

// ─── DialogContent ────────────────────────────────────────────────────────────
export interface DialogContentProps {
  size?: DialogSize
  title?: string
  description?: string
  footer?: React.ReactNode
  closeButton?: boolean
  className?: string
  children?: React.ReactNode
}

export function DialogContent({
  size = "md",
  title,
  description,
  footer,
  closeButton = true,
  className,
  children,
}: DialogContentProps) {
  const isFullscreen = size === "fullscreen"

  return (
    <DialogPortal>
      <DialogOverlay />
      <RadixDialog.Content
        className={clsx("dialog-content", `dialog-content--${size}`, className)}
        style={{
          position: "fixed",
          top: isFullscreen ? 0 : "50%",
          left: isFullscreen ? 0 : "50%",
          transform: isFullscreen ? "none" : "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--color-surface, #ffffff)",
          borderRadius: isFullscreen
            ? 0
            : "var(--radius-xl, 1rem)",
          boxShadow: "var(--shadow-xl, 0 20px 60px rgba(0,0,0,0.15))",
          zIndex: "var(--z-modal, 51)",
          outline: "none",
          overflow: "hidden",
          animation: "dialogContentIn var(--duration-normal, 200ms) ease",
          ...sizeStyles[size],
        }}
      >
        {/* Header */}
        {(title || closeButton) && (
          <DialogHeader hasDescription={!!description}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {title && (
                <RadixDialog.Title
                  style={{
                    margin: 0,
                    fontSize: "var(--font-size-lg, 1.125rem)",
                    fontWeight: "var(--font-weight-semibold, 600)",
                    color: "var(--color-text-primary, #0f172a)",
                    lineHeight: "var(--line-height-tight, 1.25)",
                  }}
                >
                  {title}
                </RadixDialog.Title>
              )}
              {description && (
                <RadixDialog.Description
                  style={{
                    margin: 0,
                    marginTop: "var(--spacing-1, 0.25rem)",
                    fontSize: "var(--font-size-sm, 0.875rem)",
                    color: "var(--color-text-secondary, #64748b)",
                    lineHeight: "var(--line-height-normal, 1.5)",
                  }}
                >
                  {description}
                </RadixDialog.Description>
              )}
            </div>

            {closeButton && (
              <RadixDialog.Close asChild>
                <button
                  type="button"
                  aria-label="סגור"
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "var(--size-8, 2rem)",
                    height: "var(--size-8, 2rem)",
                    padding: 0,
                    border: "none",
                    borderRadius: "var(--radius-sm, 0.25rem)",
                    backgroundColor: "transparent",
                    color: "var(--color-text-secondary, #64748b)",
                    cursor: "pointer",
                    transition: "background-color var(--duration-fast, 150ms) ease, color var(--duration-fast, 150ms) ease",
                    alignSelf: "flex-start",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLButtonElement
                    el.style.backgroundColor = "var(--color-surface-hover, #f1f5f9)"
                    el.style.color = "var(--color-text-primary, #0f172a)"
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLButtonElement
                    el.style.backgroundColor = "transparent"
                    el.style.color = "var(--color-text-secondary, #64748b)"
                  }}
                >
                  <XIcon />
                </button>
              </RadixDialog.Close>
            )}
          </DialogHeader>
        )}

        {/* Body */}
        <div
          className="dialog-body"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "var(--spacing-6, 1.5rem)",
            paddingTop: title || closeButton ? "var(--spacing-4, 1rem)" : "var(--spacing-6, 1.5rem)",
            color: "var(--color-text-primary, #0f172a)",
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="dialog-footer"
            style={{
              borderTop: "1px solid var(--color-border, #e2e8f0)",
              padding: "var(--spacing-4, 1rem) var(--spacing-6, 1.5rem)",
              backgroundColor: "var(--color-surface-subtle, #f8fafc)",
            }}
          >
            {footer}
          </div>
        )}
      </RadixDialog.Content>
    </DialogPortal>
  )
}

// ─── DialogHeader ─────────────────────────────────────────────────────────────
interface DialogHeaderProps {
  children: React.ReactNode
  hasDescription?: boolean
}

export function DialogHeader({ children, hasDescription }: DialogHeaderProps) {
  return (
    <div
      className="dialog-header"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "var(--spacing-4, 1rem)",
        padding: "var(--spacing-6, 1.5rem)",
        paddingBottom: hasDescription ? "var(--spacing-2, 0.5rem)" : "var(--spacing-4, 1rem)",
        borderBottom: "1px solid var(--color-border, #e2e8f0)",
      }}
    >
      {children}
    </div>
  )
}

// ─── DialogFooter ─────────────────────────────────────────────────────────────
export interface DialogFooterProps {
  children: React.ReactNode
  className?: string
}

export function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div
      className={clsx("dialog-footer-inner", className)}
      style={{
        display: "flex",
        gap: "var(--spacing-3, 0.75rem)",
        justifyContent: "flex-end",
        alignItems: "center",
      }}
    >
      {children}
    </div>
  )
}

/*
  Required global keyframe animations (add to your global CSS):

  @keyframes dialogOverlayIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes dialogContentIn {
    from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
    to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }

  RTL support is automatic via CSS logical properties
  (paddingInline, marginInlineStart, etc.) and Radix's built-in dir handling.
  Set dir="rtl" on the <html> element or wrap in a dir="rtl" container.
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
