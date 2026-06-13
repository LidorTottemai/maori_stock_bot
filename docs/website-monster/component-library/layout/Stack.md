# Stack

> **קטגוריה:** layout
> **תלויות:** none
> **Storybook:** src/stories/layout/Stack.stories.tsx
> **קוד:** src/layout/Stack.tsx
> **עלות בנייה:** ~10 דקות

## מה זה
Flexbox wrapper עם gap. מחליף את `flex flex-col gap-X` חוזר. Row / Column, עם dividers אופציונליים.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| direction | `'column' \| 'row'` | `'column'` | — |
| gap | `number \| string` | `'16px'` | — |
| align | `CSSProperties['alignItems']` | — | — |
| justify | `CSSProperties['justifyContent']` | — | — |
| divider | `ReactNode` | — | between children |
| wrap | `boolean` | false | flex-wrap |
| as | `ElementType` | `'div'` | — |

## שימוש בסיסי
```tsx
import { Stack } from "@tottemai/ui"

<Stack gap="24px">
  <Card />
  <Card />
  <Card />
</Stack>

<Stack direction="row" gap="12px" align="center">
  <Icon />
  <span>Label</span>
</Stack>
```

## קוד מלא
```tsx
// src/layout/Stack.tsx
import * as React from "react"
import { cn } from "../cn"

interface StackProps extends React.HTMLAttributes<HTMLElement> {
  direction?: "column" | "row"
  gap?: number | string
  align?: React.CSSProperties["alignItems"]
  justify?: React.CSSProperties["justifyContent"]
  divider?: React.ReactNode
  wrap?: boolean
  as?: React.ElementType
}

function Stack({ direction = "column", gap = "16px", align, justify, divider, wrap, as: Tag = "div", style, className, children, ...props }: StackProps) {
  const gapValue = typeof gap === "number" ? `${gap}px` : gap
  const items = React.Children.toArray(children).filter(Boolean)

  return (
    <Tag
      className={cn("stack", className)}
      style={{ flexDirection: direction, gap: divider ? 0 : gapValue, alignItems: align, justifyContent: justify, flexWrap: wrap ? "wrap" : undefined, ...style }}
      {...props}
    >
      {divider
        ? items.map((child, i) => (
            <React.Fragment key={i}>
              {child}
              {i < items.length - 1 && <div style={{ margin: direction === "column" ? `calc(${gapValue} / 2) 0` : `0 calc(${gapValue} / 2)` }}>{divider}</div>}
            </React.Fragment>
          ))
        : children}
      <style>{`.stack { display: flex; }`}</style>
    </Tag>
  )
}

export { Stack }
```

## בדיקות סיום
- [ ] Column + Row פועלים
- [ ] Dividers מוצגים
- [ ] RTL תמיכה
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
