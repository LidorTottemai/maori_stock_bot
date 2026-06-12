# Separator

> **קטגוריה:** primitives
> **תלויות:** @radix-ui/react-separator, clsx
> **Storybook:** src/stories/Separator.stories.tsx
> **קוד:** src/primitives/Separator.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
קו הפרדה אופקי או אנכי. מבוסס Radix Separator עם תמיכה מלאה ב-accessibility ו-RTL.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Horizontal | קו אופקי (ברירת מחדל) |
| Vertical | קו אנכי |
| WithLabel | קו עם תווית באמצע (or/and pattern) |
| Decorative | ללא role semantics |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| orientation | "horizontal" \| "vertical" | "horizontal" | כיוון הקו |
| decorative | boolean | false | האם הקו דקורטיבי בלבד (ללא role separator) |
| label | string | — | תווית באמצע הקו |
| className | string | — | CSS classes נוספים |

## שימוש בסיסי
```tsx
import { Separator } from "@tottemai/ui"

// אופקי
<Separator />

// אנכי
<Separator orientation="vertical" />

// עם תווית
<Separator label="או" />

// דקורטיבי
<Separator decorative />
```

## קוד מלא
```tsx
// src/primitives/Separator.tsx
"use client"
import * as React from "react"
import * as RadixSeparator from "@radix-ui/react-separator"
import { clsx } from "clsx"

export interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof RadixSeparator.Root> {
  orientation?: "horizontal" | "vertical"
  decorative?: boolean
  label?: string
  className?: string
}

const Separator = React.forwardRef<
  React.ElementRef<typeof RadixSeparator.Root>,
  SeparatorProps
>(
  (
    {
      orientation = "horizontal",
      decorative = false,
      label,
      className,
      ...props
    },
    ref
  ) => {
    const isHorizontal = orientation === "horizontal"

    if (label && isHorizontal) {
      return (
        <div
          className={clsx("separator-with-label", className)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            width: "100%",
          }}
          role={decorative ? "none" : "separator"}
          aria-orientation="horizontal"
        >
          <RadixSeparator.Root
            ref={ref}
            decorative
            orientation="horizontal"
            style={{
              flex: 1,
              height: "1px",
              backgroundColor: "var(--color-border)",
              border: "none",
            }}
            {...props}
          />
          <span
            style={{
              flexShrink: 0,
              color: "var(--color-text-muted)",
              fontSize: "0.75rem",
              fontWeight: 500,
              userSelect: "none",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>
          <RadixSeparator.Root
            decorative
            orientation="horizontal"
            style={{
              flex: 1,
              height: "1px",
              backgroundColor: "var(--color-border)",
              border: "none",
            }}
          />
        </div>
      )
    }

    return (
      <RadixSeparator.Root
        ref={ref}
        orientation={orientation}
        decorative={decorative}
        className={clsx("separator", `separator--${orientation}`, className)}
        style={{
          backgroundColor: "var(--color-border)",
          border: "none",
          flexShrink: 0,
          ...(isHorizontal
            ? { width: "100%", height: "1px" }
            : { width: "1px", height: "100%" }),
        }}
        {...props}
      />
    )
  }
)

Separator.displayName = "Separator"

export { Separator }
```

## עיקרון CSS Variables
```css
/* אין צבעים קשיחים */
background: var(--color-border);
color: var(--color-text-muted);
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
