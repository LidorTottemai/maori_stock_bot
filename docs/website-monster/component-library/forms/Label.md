# Label

> **קטגוריה:** forms
> **תלויות:** @radix-ui/react-label, clsx
> **Storybook:** src/stories/Label.stories.tsx
> **קוד:** src/forms/Label.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
תווית טופס עם אינדיקטור חובה (*) ומצב disabled.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | תווית רגילה |
| Required | תווית עם כוכבית אדומה |
| Disabled | תווית מושבתת (opacity נמוכה) |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| required | boolean | false | מציג כוכבית אדומה (*) |
| disabled | boolean | false | מצב disabled עם opacity |
| htmlFor | string | — | מזהה ה-input המקושר |
| className | string | — | CSS classes נוספים |
| children | React.ReactNode | — | טקסט התווית |

## שימוש בסיסי
```tsx
import { Label } from "@tottemai/ui"

// תווית רגילה
<Label htmlFor="email">כתובת אימייל</Label>

// תווית חובה
<Label htmlFor="email" required>כתובת אימייל</Label>

// תווית מושבתת
<Label htmlFor="email" disabled>כתובת אימייל</Label>
```

## קוד מלא
```tsx
// src/forms/Label.tsx
"use client"
import * as React from "react"
import * as RadixLabel from "@radix-ui/react-label"
import clsx from "clsx"

export interface LabelProps extends React.ComponentPropsWithoutRef<typeof RadixLabel.Root> {
  required?: boolean
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

export const Label = React.forwardRef<
  React.ElementRef<typeof RadixLabel.Root>,
  LabelProps
>(({ required = false, disabled = false, className, children, ...props }, ref) => {
  return (
    <RadixLabel.Root
      ref={ref}
      className={clsx(
        "label-root",
        disabled && "label-root--disabled",
        className
      )}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        fontSize: "var(--font-size-sm)",
        fontWeight: "var(--font-weight-medium)",
        color: disabled ? "var(--color-label-disabled, var(--color-label))" : "var(--color-label)",
        opacity: disabled ? "var(--opacity-disabled, 0.5)" : undefined,
        cursor: "default",
        userSelect: "none",
      }}
      {...props}
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
    </RadixLabel.Root>
  )
})

Label.displayName = "Label"
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
