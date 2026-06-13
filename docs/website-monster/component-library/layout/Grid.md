# Grid

> **קטגוריה:** layout
> **תלויות:** none
> **Storybook:** src/stories/layout/Grid.stories.tsx
> **קוד:** src/layout/Grid.tsx
> **עלות בנייה:** ~10 דקות

## מה זה
Responsive CSS Grid wrapper. `cols` prop מגדיר עמודות בbreakpoints שונים. מחליף את `grid grid-cols-X gap-Y` חוזר.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| cols | `number \| { sm?: number; md?: number; lg?: number; xl?: number }` | `1` | — |
| gap | `string` | `'24px'` | — |
| autoFill | `boolean` | false | auto-fill minmax |
| minColWidth | `string` | `'280px'` | עבור autoFill |
| as | `ElementType` | `'div'` | — |

## שימוש בסיסי
```tsx
import { Grid } from "@tottemai/ui"

<Grid cols={{ sm: 1, md: 2, lg: 3 }} gap="32px">
  <ServiceCard />
  <ServiceCard />
  <ServiceCard />
</Grid>

<Grid autoFill minColWidth="240px">
  {products.map(p => <ProductCard key={p.id} {...p} />)}
</Grid>
```

## קוד מלא
```tsx
// src/layout/Grid.tsx
import * as React from "react"
import { cn } from "../cn"

interface GridCols { sm?: number; md?: number; lg?: number; xl?: number }

interface GridProps extends React.HTMLAttributes<HTMLElement> {
  cols?: number | GridCols
  gap?: string
  autoFill?: boolean
  minColWidth?: string
  as?: React.ElementType
}

function Grid({ cols = 1, gap = "24px", autoFill, minColWidth = "280px", as: Tag = "div", style, className, children, ...props }: GridProps) {
  let gridTemplateColumns: string

  if (autoFill) {
    gridTemplateColumns = `repeat(auto-fill, minmax(${minColWidth}, 1fr))`
  } else if (typeof cols === "number") {
    gridTemplateColumns = `repeat(${cols}, 1fr)`
  } else {
    // Use CSS custom properties via inline style — handled with CSS vars approach
    gridTemplateColumns = `repeat(${cols.sm ?? 1}, 1fr)`
  }

  const responsiveCols = typeof cols === "object" ? cols : null

  return (
    <>
      <Tag
        className={cn("grid-wrapper", responsiveCols && "grid-responsive", className)}
        style={{ gridTemplateColumns, gap, ...style }}
        {...props}
      >
        {children}
      </Tag>
      {responsiveCols && (
        <style>{`
          .grid-responsive {
            ${responsiveCols.sm ? `grid-template-columns: repeat(${responsiveCols.sm}, 1fr);` : ""}
          }
          @media (min-width: 640px) {
            .grid-responsive {
              ${responsiveCols.sm ? `grid-template-columns: repeat(${responsiveCols.sm}, 1fr);` : ""}
            }
          }
          @media (min-width: 768px) {
            .grid-responsive {
              ${responsiveCols.md ? `grid-template-columns: repeat(${responsiveCols.md}, 1fr);` : ""}
            }
          }
          @media (min-width: 1024px) {
            .grid-responsive {
              ${responsiveCols.lg ? `grid-template-columns: repeat(${responsiveCols.lg}, 1fr);` : ""}
            }
          }
          @media (min-width: 1280px) {
            .grid-responsive {
              ${responsiveCols.xl ? `grid-template-columns: repeat(${responsiveCols.xl}, 1fr);` : ""}
            }
          }
        `}</style>
      )}
      <style>{`.grid-wrapper { display: grid; }`}</style>
    </>
  )
}

export { Grid }
```

## בדיקות סיום
- [ ] Responsive cols פועלים
- [ ] autoFill פועל
- [ ] Gap עקבי
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
