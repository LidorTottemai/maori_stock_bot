# Button

> **קטגוריה:** primitives
> **תלויות:** class-variance-authority, @radix-ui/react-slot, clsx
> **Storybook:** src/stories/Button.stories.tsx
> **קוד:** src/primitives/Button.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
כפתור רב-שימושי עם variants מרובים, גדלים, loading state ותמיכה ב-asChild pattern של Radix.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Primary | כפתור ראשי עם צבע primary |
| Secondary | כפתור משני |
| Ghost | כפתור שקוף ללא border |
| Outline | כפתור עם border בלבד |
| Destructive | כפתור לפעולות הרסניות (אדום) |
| Small | גודל sm |
| Medium | גודל md (ברירת מחדל) |
| Large | גודל lg |
| Loading | כפתור עם spinner ו-disabled אוטומטי |
| AsChild | עוטף אלמנט אחר (לדוגמה link) |
| Disabled | מצב disabled |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | "primary" \| "secondary" \| "ghost" \| "outline" \| "destructive" | "primary" | סגנון הכפתור |
| size | "sm" \| "md" \| "lg" | "md" | גודל הכפתור |
| loading | boolean | false | מציג spinner ומשבית את הכפתור |
| asChild | boolean | false | מפעיל Radix Slot pattern |
| disabled | boolean | false | השבתת הכפתור |
| className | string | — | CSS classes נוספים |
| children | React.ReactNode | — | תוכן הכפתור |

## שימוש בסיסי
```tsx
import { Button } from "@tottemai/ui"

// Primary
<Button variant="primary" size="md">לחץ כאן</Button>

// Loading
<Button variant="primary" loading>שומר...</Button>

// Destructive
<Button variant="destructive">מחק</Button>

// AsChild — renders as <a> tag
<Button asChild variant="ghost">
  <a href="/about">אודות</a>
</Button>
```

## קוד מלא
```tsx
// src/primitives/Button.tsx
"use client"
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { clsx } from "clsx"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-medium rounded-md",
    "border border-transparent",
    "transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "@media (prefers-reduced-motion: reduce) { transition: none }",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-[var(--color-primary)]",
          "text-[var(--color-primary-fg)]",
          "hover:opacity-90",
          "focus-visible:ring-[var(--color-primary)]",
        ].join(" "),
        secondary: [
          "bg-[var(--color-secondary)]",
          "text-[var(--color-secondary-fg)]",
          "hover:opacity-85",
          "focus-visible:ring-[var(--color-secondary)]",
        ].join(" "),
        ghost: [
          "bg-transparent",
          "text-[var(--color-primary)]",
          "hover:bg-[var(--color-muted)]",
          "hover:text-[var(--color-muted-fg)]",
          "focus-visible:ring-[var(--color-primary)]",
        ].join(" "),
        outline: [
          "bg-transparent",
          "border-[var(--color-border)]",
          "text-[var(--color-primary)]",
          "hover:bg-[var(--color-muted)]",
          "focus-visible:ring-[var(--color-primary)]",
        ].join(" "),
        destructive: [
          "bg-[var(--color-destructive)]",
          "text-[var(--color-destructive-fg)]",
          "hover:opacity-90",
          "focus-visible:ring-[var(--color-destructive)]",
        ].join(" "),
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

const LoadingSpinner = () => (
  <svg
    aria-hidden="true"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      animation: "button-spin 0.75s linear infinite",
    }}
  >
    <style>{`
      @keyframes button-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @media (prefers-reduced-motion: reduce) {
        .button-spinner { animation: none; opacity: 0.6; }
      }
    `}</style>
    <circle
      cx="8"
      cy="8"
      r="6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="28"
      strokeDashoffset="10"
      opacity="0.4"
    />
    <path
      d="M8 2a6 6 0 0 1 6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      asChild = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const isDisabled = disabled || loading

    return (
      <Comp
        ref={ref}
        className={clsx(buttonVariants({ variant, size }), className)}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading && <LoadingSpinner />}
        {children}
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
