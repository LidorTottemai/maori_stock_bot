# Button

> **קטגוריה:** primitives
> **תלויות:** class-variance-authority, @radix-ui/react-slot
> **Storybook:** src/stories/Button.stories.tsx
> **קוד:** src/primitives/Button.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
כפתור ראשוני עם תמיכה מלאה ב-variants, גדלים, מצב loading, ו-asChild מ-Radix Slot. בסיס לכל פעולות המשתמש ב-UI. כל הצבעים מגיעים מ-CSS variables בלבד, ללא hexcode קשיח אחד.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Primary | כפתור ראשי עם רקע var(--color-primary) |
| Secondary | כפתור משני עם רקע var(--color-secondary) |
| Ghost | כפתור שקוף, background רק ב-hover |
| Outline | כפתור עם border בלבד, ללא fill |
| Destructive | כפתור לפעולות מסוכנות (מחיקה, ביטול) |
| Small | size="sm" — גובה 1.75rem |
| Medium | size="md" — גובה 2.25rem (ברירת מחדל) |
| Large | size="lg" — גובה 2.75rem |
| Loading | isLoading={true} — spinner + disabled אוטומטי |
| AsChild | asChild={true} עם `<a>` לניווט ללא button wrapper |
| Disabled | disabled={true} — opacity 50% |
| WithIcon | כפתור עם אייקון בצד, RTL-aware |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `"primary" \| "secondary" \| "ghost" \| "outline" \| "destructive"` | `"primary"` | סגנון ויזואלי של הכפתור |
| size | `"sm" \| "md" \| "lg"` | `"md"` | גודל הכפתור (padding + font) |
| isLoading | `boolean` | `false` | מציג spinner, מגדיר aria-busy, ומשבית קליקים |
| loadingLabel | `string` | `"טוען..."` | aria-label קריא בזמן loading לנגישות |
| asChild | `boolean` | `false` | מעביר את כל ה-props לילד הישיר (Radix Slot pattern) |
| disabled | `boolean` | `false` | משבית לחיצה, opacity 50% |
| className | `string` | `undefined` | class נוסף שמצורף לסוף הרשימה |
| children | `React.ReactNode` | — | תוכן הכפתור |
| onClick | `React.MouseEventHandler<HTMLButtonElement>` | `undefined` | handler לאירוע לחיצה |

## שימוש בסיסי
```tsx
import { Button } from "@tottemai/ui"

// Primary button
<Button variant="primary" size="md" onClick={() => console.log("clicked")}>
  שמור שינויים
</Button>

// Loading state
<Button variant="primary" isLoading loadingLabel="שומר נתונים...">
  שמור שינויים
</Button>

// AsChild — renders as <a>, zero button DOM
<Button asChild variant="ghost">
  <a href="/dashboard">לדשבורד</a>
</Button>

// Destructive with small size
<Button variant="destructive" size="sm">
  מחק חשבון
</Button>

// RTL layout with icon (icon flips position via dir="rtl")
<div dir="rtl">
  <Button variant="outline">
    <svg width="16" height="16" aria-hidden="true"><path d="M5 12l7-7" stroke="currentColor" strokeWidth="2"/></svg>
    חזור
  </Button>
</div>
```

## קוד מלא
```tsx
// src/primitives/Button.tsx
"use client"
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

// ─── CSS Variables Reference ──────────────────────────────────────────────────
// --color-primary              background of primary button
// --color-primary-foreground   text on primary button
// --color-secondary            background of secondary button
// --color-secondary-foreground text on secondary button
// --color-destructive          background of destructive button
// --color-destructive-foreground text on destructive button
// --color-border               border color for outline variant
// --color-foreground           default text color
// --color-surface-hover        hover bg for ghost/outline variants
// --color-focus-ring           focus ring color (falls back to primary)
// --radius-md                  button border-radius (default 0.375rem)
// ─────────────────────────────────────────────────────────────────────────────

// ─── Injected styles (scoped, injected once) ──────────────────────────────────
const BTN_STYLE_ID = "__tottemai_btn__"

const buttonCSS = `
  .tm-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-weight: 500;
    border-radius: var(--radius-md, 0.375rem);
    border: 1px solid transparent;
    cursor: pointer;
    text-decoration: none;
    transition: background-color 150ms ease, border-color 150ms ease,
                color 150ms ease, opacity 150ms ease, box-shadow 150ms ease;
    white-space: nowrap;
    user-select: none;
    position: relative;
    outline: none;
    line-height: 1;
    font-family: inherit;
  }

  .tm-btn:focus-visible {
    box-shadow: 0 0 0 3px var(--color-focus-ring, var(--color-primary));
  }

  .tm-btn:disabled,
  .tm-btn[aria-disabled="true"] {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* ── Sizes ── */
  .tm-btn--sm { padding: 0.25rem 0.75rem;  font-size: 0.75rem;  min-height: 1.75rem; }
  .tm-btn--md { padding: 0.5rem  1.25rem;  font-size: 0.875rem; min-height: 2.25rem; }
  .tm-btn--lg { padding: 0.75rem 1.75rem;  font-size: 1rem;     min-height: 2.75rem; }

  /* ── Variants ── */
  .tm-btn--primary {
    background: var(--color-primary);
    color: var(--color-primary-foreground);
    border-color: var(--color-primary);
  }
  .tm-btn--primary:hover:not(:disabled):not([aria-disabled="true"]) {
    filter: brightness(0.9);
  }
  .tm-btn--primary:active:not(:disabled):not([aria-disabled="true"]) {
    filter: brightness(0.85);
  }

  .tm-btn--secondary {
    background: var(--color-secondary);
    color: var(--color-secondary-foreground);
    border-color: var(--color-secondary);
  }
  .tm-btn--secondary:hover:not(:disabled):not([aria-disabled="true"]) {
    filter: brightness(0.93);
  }
  .tm-btn--secondary:active:not(:disabled):not([aria-disabled="true"]) {
    filter: brightness(0.88);
  }

  .tm-btn--destructive {
    background: var(--color-destructive);
    color: var(--color-destructive-foreground);
    border-color: var(--color-destructive);
  }
  .tm-btn--destructive:hover:not(:disabled):not([aria-disabled="true"]) {
    filter: brightness(0.9);
  }

  .tm-btn--outline {
    background: transparent;
    color: var(--color-foreground);
    border-color: var(--color-border);
  }
  .tm-btn--outline:hover:not(:disabled):not([aria-disabled="true"]) {
    background: var(--color-surface-hover, rgba(0, 0, 0, 0.05));
  }

  .tm-btn--ghost {
    background: transparent;
    color: var(--color-foreground);
    border-color: transparent;
  }
  .tm-btn--ghost:hover:not(:disabled):not([aria-disabled="true"]) {
    background: var(--color-surface-hover, rgba(0, 0, 0, 0.06));
  }

  /* ── Spinner ── */
  .tm-btn__spinner {
    display: inline-block;
    width: 1em;
    height: 1em;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    flex-shrink: 0;
    animation: tm-btn-spin 0.65s linear infinite;
  }

  @keyframes tm-btn-spin {
    to { transform: rotate(360deg); }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .tm-btn { transition: none; }
    .tm-btn__spinner { animation: none; opacity: 0.7; }
  }

  /* ── RTL icon order ── */
  [dir="rtl"] .tm-btn svg:first-child  { order: 1; }
  [dir="rtl"] .tm-btn svg:last-child   { order: -1; }
`

function injectButtonStyles(): void {
  if (typeof document === "undefined") return
  if (document.getElementById(BTN_STYLE_ID)) return
  const tag = document.createElement("style")
  tag.id = BTN_STYLE_ID
  tag.textContent = buttonCSS
  document.head.appendChild(tag)
}

// ─── CVA class map ────────────────────────────────────────────────────────────
const buttonVariants = cva("tm-btn", {
  variants: {
    variant: {
      primary:     "tm-btn--primary",
      secondary:   "tm-btn--secondary",
      ghost:       "tm-btn--ghost",
      outline:     "tm-btn--outline",
      destructive: "tm-btn--destructive",
    },
    size: {
      sm: "tm-btn--sm",
      md: "tm-btn--md",
      lg: "tm-btn--lg",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
})

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Renders the child element instead of a <button> (Radix Slot) */
  asChild?: boolean
  /** Shows an animated spinner and disables interaction */
  isLoading?: boolean
  /** Screen-reader label announced during loading (default: "טוען...") */
  loadingLabel?: string
}

// ─── Component ────────────────────────────────────────────────────────────────
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      loadingLabel = "טוען...",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Inject global keyframes + base styles once per page
    React.useLayoutEffect(injectButtonStyles, [])

    const Comp = asChild ? Slot : "button"
    const isDisabled = disabled || isLoading

    const classes = [buttonVariants({ variant, size }), className]
      .filter(Boolean)
      .join(" ")

    return (
      <Comp
        ref={ref}
        className={classes}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading && (
          <span
            className="tm-btn__spinner"
            aria-hidden="true"
            role="presentation"
          />
        )}
        {isLoading ? (
          <>
            {/* visually hidden label for screen readers */}
            <span
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
              {loadingLabel}
            </span>
            {/* visually show the original text, aria-hidden because sr-only above */}
            <span aria-hidden="true">{children}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
```

## עיקרון CSS Variables
```css
/* אין צבעים קשיחים */
background: var(--color-primary);
color: var(--color-primary-foreground);
border-color: var(--color-border);
border-radius: var(--radius-md, 0.375rem);
background: var(--color-surface-hover, rgba(0, 0, 0, 0.05));
box-shadow: 0 0 0 3px var(--color-focus-ring, var(--color-primary));
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
