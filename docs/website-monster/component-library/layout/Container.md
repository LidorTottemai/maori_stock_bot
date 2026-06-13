# Container

> **קטגוריה:** layout
> **תלויות:** none
> **Storybook:** src/stories/layout/Container.stories.tsx
> **קוד:** src/layout/Container.tsx
> **עלות בנייה:** ~10 דקות

## מה זה
max-width wrapper עם responsive padding. הbuilding block הכי בסיסי בlayout. כל section עוטף ב-Container לרוחב עקבי.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | max-w-7xl |
| Narrow | max-w-3xl (blog, forms) |
| Wide | max-w-screen-2xl |
| Full width | ללא max-width |
| No padding | ללא padding צדדי |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'xl'` | max-width |
| noPadding | `boolean` | false | ללא padding |
| as | `ElementType` | `'div'` | — |
| children | `ReactNode` | — | — |
| className | `string` | — | — |

## שימוש בסיסי
```tsx
import { Container } from "@tottemai/ui"

<Container>
  <h1>תוכן הדף</h1>
</Container>

<Container size="sm">
  <form>טופס צר</form>
</Container>
```

## קוד מלא
```tsx
// src/layout/Container.tsx
import * as React from "react"
import { cn } from "../cn"

const sizeMap = {
  sm:   "container-sm",
  md:   "container-md",
  lg:   "container-lg",
  xl:   "container-xl",
  full: "container-full",
}

interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full"
  noPadding?: boolean
  as?: React.ElementType
}

function Container({ size = "xl", noPadding, as: Tag = "div", className, children, ...props }: ContainerProps) {
  return (
    <Tag
      className={cn("container-base", sizeMap[size], !noPadding && "container-padded", className)}
      {...props}
    >
      {children}
      <style>{`
        .container-base { width: 100%; margin-inline: auto; }
        .container-padded { padding-inline: clamp(16px, 4vw, 32px); }
        .container-sm   { max-width: 672px; }
        .container-md   { max-width: 896px; }
        .container-lg   { max-width: 1024px; }
        .container-xl   { max-width: 1280px; }
        .container-full { max-width: none; }
      `}</style>
    </Tag>
  )
}

export { Container }
```

## בדיקות סיום
- [ ] כל הsizes פועלים
- [ ] RTL תמיכה (margin-inline, padding-inline)
- [ ] CSS variables בלבד
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
