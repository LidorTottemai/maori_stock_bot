# Sheet

> **קטגוריה:** feedback
> **תלויות:** @radix-ui/react-dialog, react, clsx
> **Storybook:** src/stories/Sheet.stories.tsx
> **קוד:** src/feedback/Sheet.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
מגירה נשלפת (Drawer/Sheet) המבוססת על Radix UI Dialog. נפתחת מלמטה, מימין, או משמאל עם אנימציית החלקה חלקה. מתאימה לתפריטי ניווט, פורמים צדדיים, ופאנלים נוספים. תמיכה מלאה ב-RTL: left ו-right מוחלפים אוטומטית בהתאם לכיוון הטקסט.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| From Bottom | מגירה נפתחת מלמטה, ברירת מחדל למובייל |
| From Right | פאנל צד נפתח מהימין |
| From Left | פאנל ניווט נפתח משמאל |
| Full Height | מגירה צד בגובה מלא |
| With Form | מגירה עם טופס ו-footer עם כפתורי שמירה/ביטול |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| side | `'bottom' \| 'right' \| 'left'` | `'right'` | כיוון פתיחת המגירה |
| size | `'sm' \| 'md' \| 'lg' \| 'full'` | `'md'` | גודל המגירה (רוחב לצד, גובה לתחתית) |
| title | `string` | — | כותרת בה-header |
| description | `string` | — | תיאור מתחת לכותרת |
| footer | `ReactNode` | — | תוכן ה-footer |
| closeButton | `boolean` | `true` | האם להציג כפתור X |
| className | `string` | — | class נוסף ל-Content |
| children | `ReactNode` | — | תוכן גוף המגירה |

## שימוש בסיסי
```tsx
import { Sheet, SheetTrigger, SheetContent, SheetFooter } from "@tottemai/ui"

// מגירה מהימין
<Sheet>
  <SheetTrigger asChild>
    <button>פתח הגדרות</button>
  </SheetTrigger>
  <SheetContent
    side="right"
    title="הגדרות"
    description="עדכן את ההעדפות שלך"
    footer={
      <SheetFooter>
        <button>שמור</button>
      </SheetFooter>
    }
  >
    <form>...</form>
  </SheetContent>
</Sheet>

// מגירה מלמטה (מובייל)
<Sheet>
  <SheetTrigger asChild>
    <button>אפשרויות</button>
  </SheetTrigger>
  <SheetContent side="bottom" size="sm" title="בחר פעולה">
    <ul>...</ul>
  </SheetContent>
</Sheet>
```

## קוד מלא
```tsx
// src/feedback/Sheet.tsx
import React from "react"
import * as RadixDialog from "@radix-ui/react-dialog"
import clsx from "clsx"

// ─── Re-exports ───────────────────────────────────────────────────────────────
export const Sheet = RadixDialog.Root
export const SheetTrigger = RadixDialog.Trigger
export const SheetPortal = RadixDialog.Portal
export const SheetClose = RadixDialog.Close

// ─── Types ────────────────────────────────────────────────────────────────────
export type SheetSide = "bottom" | "right" | "left"
export type SheetSize = "sm" | "md" | "lg" | "full"

// ─── Overlay ──────────────────────────────────────────────────────────────────
export const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Overlay>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Overlay>
>(({ className, ...props }, ref) => (
  <RadixDialog.Overlay
    ref={ref}
    className={clsx("sheet-overlay", className)}
    style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "var(--color-overlay, rgba(0, 0, 0, 0.5))",
      backdropFilter: "blur(2px)",
      zIndex: "var(--z-overlay, 50)",
      animation: "sheetOverlayIn var(--duration-normal, 200ms) ease",
    }}
    {...props}
  />
))
SheetOverlay.displayName = "SheetOverlay"

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

// ─── Size maps ────────────────────────────────────────────────────────────────
// For left/right sides: controls width
const horizontalSizes: Record<SheetSize, string> = {
  sm: "var(--sheet-width-sm, 20rem)",
  md: "var(--sheet-width-md, 28rem)",
  lg: "var(--sheet-width-lg, 40rem)",
  full: "100vw",
}

// For bottom side: controls height
const bottomSizes: Record<SheetSize, string> = {
  sm: "var(--sheet-height-sm, 40vh)",
  md: "var(--sheet-height-md, 60vh)",
  lg: "var(--sheet-height-lg, 80vh)",
  full: "100vh",
}

// ─── Side styles (RTL-aware) ──────────────────────────────────────────────────
function getSideStyles(
  side: SheetSide,
  size: SheetSize,
  isRTL: boolean
): React.CSSProperties {
  // Flip left/right for RTL
  const resolvedSide =
    side === "left"
      ? isRTL ? "right" : "left"
      : side === "right"
      ? isRTL ? "left" : "right"
      : "bottom"

  if (resolvedSide === "bottom") {
    return {
      bottom: 0,
      left: 0,
      right: 0,
      height: bottomSizes[size],
      width: "100%",
      borderTopLeftRadius: "var(--radius-xl, 1rem)",
      borderTopRightRadius: "var(--radius-xl, 1rem)",
      animation: "sheetSlideUp var(--duration-normal, 250ms) cubic-bezier(0.32, 0.72, 0, 1)",
    }
  }

  if (resolvedSide === "right") {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      width: horizontalSizes[size],
      height: "100vh",
      borderTopLeftRadius: "var(--radius-xl, 1rem)",
      borderBottomLeftRadius: "var(--radius-xl, 1rem)",
      animation: "sheetSlideInRight var(--duration-normal, 250ms) cubic-bezier(0.32, 0.72, 0, 1)",
    }
  }

  // left
  return {
    top: 0,
    left: 0,
    bottom: 0,
    width: horizontalSizes[size],
    height: "100vh",
    borderTopRightRadius: "var(--radius-xl, 1rem)",
    borderBottomRightRadius: "var(--radius-xl, 1rem)",
    animation: "sheetSlideInLeft var(--duration-normal, 250ms) cubic-bezier(0.32, 0.72, 0, 1)",
  }
}

// ─── SheetContent ─────────────────────────────────────────────────────────────
export interface SheetContentProps {
  side?: SheetSide
  size?: SheetSize
  title?: string
  description?: string
  footer?: React.ReactNode
  closeButton?: boolean
  className?: string
  children?: React.ReactNode
}

export function SheetContent({
  side = "right",
  size = "md",
  title,
  description,
  footer,
  closeButton = true,
  className,
  children,
}: SheetContentProps) {
  // Detect RTL from document direction or nearest ancestor
  const [isRTL, setIsRTL] = React.useState(false)
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (contentRef.current) {
      const dir = getComputedStyle(contentRef.current).direction
      setIsRTL(dir === "rtl")
    } else {
      setIsRTL(
        typeof document !== "undefined" &&
          document.documentElement.dir === "rtl"
      )
    }
  }, [])

  const sideStyles = getSideStyles(side, size, isRTL)

  return (
    <SheetPortal>
      <SheetOverlay />
      <RadixDialog.Content
        ref={contentRef}
        className={clsx(
          "sheet-content",
          `sheet-content--${side}`,
          `sheet-content--${size}`,
          className
        )}
        style={{
          position: "fixed",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--color-surface, #ffffff)",
          boxShadow: "var(--shadow-xl, 0 20px 60px rgba(0,0,0,0.2))",
          zIndex: "var(--z-modal, 51)",
          outline: "none",
          overflow: "hidden",
          ...sideStyles,
        }}
      >
        {/* Header */}
        {(title || closeButton) && (
          <div
            className="sheet-header"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--spacing-4, 1rem)",
              padding: "var(--spacing-5, 1.25rem) var(--spacing-6, 1.5rem)",
              borderBottom: "1px solid var(--color-border, #e2e8f0)",
              flexShrink: 0,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              {title && (
                <RadixDialog.Title
                  style={{
                    margin: 0,
                    fontSize: "var(--font-size-base, 1rem)",
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
                    transition:
                      "background-color var(--duration-fast, 150ms) ease",
                    alignSelf: "flex-start",
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      "var(--color-surface-hover, #f1f5f9)"
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      "transparent"
                  }}
                >
                  <XIcon />
                </button>
              </RadixDialog.Close>
            )}
          </div>
        )}

        {/* Body */}
        <div
          className="sheet-body"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "var(--spacing-6, 1.5rem)",
            color: "var(--color-text-primary, #0f172a)",
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="sheet-footer"
            style={{
              borderTop: "1px solid var(--color-border, #e2e8f0)",
              padding:
                "var(--spacing-4, 1rem) var(--spacing-6, 1.5rem)",
              backgroundColor: "var(--color-surface-subtle, #f8fafc)",
              flexShrink: 0,
            }}
          >
            {footer}
          </div>
        )}
      </RadixDialog.Content>
    </SheetPortal>
  )
}

// ─── SheetHeader ──────────────────────────────────────────────────────────────
export interface SheetHeaderProps {
  children: React.ReactNode
  className?: string
}

export function SheetHeader({ children, className }: SheetHeaderProps) {
  return (
    <div
      className={clsx("sheet-header-standalone", className)}
      style={{
        marginBottom: "var(--spacing-4, 1rem)",
      }}
    >
      {children}
    </div>
  )
}

// ─── SheetFooter ──────────────────────────────────────────────────────────────
export interface SheetFooterProps {
  children: React.ReactNode
  className?: string
}

export function SheetFooter({ children, className }: SheetFooterProps) {
  return (
    <div
      className={clsx("sheet-footer-inner", className)}
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

  @keyframes sheetOverlayIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes sheetSlideUp {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
  }

  @keyframes sheetSlideInRight {
    from { transform: translateX(100%); }
    to   { transform: translateX(0); }
  }

  @keyframes sheetSlideInLeft {
    from { transform: translateX(-100%); }
    to   { transform: translateX(0); }
  }

  RTL note: the component detects document direction at mount time and
  automatically swaps left↔right panel positioning. For SSR, pass the
  correct `dir` attribute on <html> before hydration.
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
