# Badge

> **קטגוריה:** primitives
> **תלויות:** class-variance-authority, clsx
> **Storybook:** src/stories/Badge.stories.tsx
> **קוד:** src/primitives/Badge.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
תגית קטנה בצורת pill לציון סטטוס, קטגוריה או ערך.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | תגית ברירת מחדל |
| Secondary | תגית משנית |
| Outline | תגית עם border |
| Destructive | תגית אזהרה/שגיאה |
| Success | תגית הצלחה |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | "default" \| "secondary" \| "outline" \| "destructive" \| "success" | "default" | סגנון התגית |
| className | string | — | CSS classes נוספים |
| children | React.ReactNode | — | תוכן התגית |

## שימוש בסיסי
```tsx
import { Badge } from "@tottemai/ui"

// Default
<Badge>חדש</Badge>

// Secondary
<Badge variant="secondary">בתהליך</Badge>

// Outline
<Badge variant="outline">טיוטה</Badge>

// Destructive
<Badge variant="destructive">שגיאה</Badge>

// Success
<Badge variant="success">פעיל</Badge>
```

## קוד מלא
```tsx
// src/primitives/Badge.tsx
"use client"
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { clsx } from "clsx"

const badgeVariants = cva(
  [
    "inline-flex items-center justify-center",
    "px-2.5 py-0.5",
    "text-xs font-medium",
    "leading-none",
    "border border-transparent",
    "select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-[var(--color-primary)]",
          "text-[var(--color-primary-fg)]",
          "rounded-[9999px]",
        ].join(" "),
        secondary: [
          "bg-[var(--color-secondary)]",
          "text-[var(--color-secondary-fg)]",
          "rounded-[9999px]",
        ].join(" "),
        outline: [
          "bg-transparent",
          "border-[var(--color-border)]",
          "text-[var(--color-muted-fg)]",
          "rounded-[9999px]",
        ].join(" "),
        destructive: [
          "bg-[var(--color-destructive)]",
          "text-[var(--color-destructive-fg)]",
          "rounded-[9999px]",
        ].join(" "),
        success: [
          "bg-[var(--color-success)]",
          "text-[var(--color-success-fg)]",
          "rounded-[9999px]",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={clsx(badgeVariants({ variant }), className)}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = "Badge"

export { Badge, badgeVariants }
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
