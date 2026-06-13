# ScrollArea

> **קטגוריה:** surfaces
> **תלויות:** @radix-ui/react-scroll-area
> **Storybook:** src/stories/surfaces/ScrollArea.stories.tsx
> **קוד:** src/surfaces/ScrollArea.tsx
> **עלות בנייה:** ~15 דקות

## מה זה
Container עם scrollbar מעוצב. מחליף את ה-native scrollbar עם custom styling שנשאר עקבי בין browsers ומערכות הפעלה. מבוסס Radix ScrollArea.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Vertical | גלילה אנכית |
| Horizontal | גלילה אופקית |
| Both | גלילה בשני הכיוונים |
| Custom height | גבוה קבוע |
| Thin scrollbar | scrollbar דק (2px) |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | `ReactNode` | — | — |
| className | `string` | — | applied to root |
| orientation | `'vertical' \| 'horizontal' \| 'both'` | `'vertical'` | — |
| scrollbarSize | `number` | `8` | px |
| type | `'auto' \| 'always' \| 'scroll' \| 'hover'` | `'hover'` | Radix type |

## שימוש בסיסי
```tsx
import { ScrollArea } from "@tottemai/ui"

<ScrollArea className="h-[320px] w-full">
  {longContent}
</ScrollArea>
```

## קוד מלא
```tsx
"use client"
// src/surfaces/ScrollArea.tsx
import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { cn } from "../cn"

interface ScrollAreaProps extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  orientation?: "vertical" | "horizontal" | "both"
  scrollbarSize?: number
  className?: string
  children?: React.ReactNode
}

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(({ className, children, orientation = "vertical", scrollbarSize = 8, type = "hover", ...props }, ref) => (
  <ScrollAreaPrimitive.Root ref={ref} type={type} className={cn("scroll-area-root", className)} {...props}>
    <ScrollAreaPrimitive.Viewport className="scroll-area-viewport">
      {children}
    </ScrollAreaPrimitive.Viewport>

    {(orientation === "vertical" || orientation === "both") && (
      <ScrollAreaPrimitive.Scrollbar orientation="vertical" className="scroll-area-scrollbar scroll-area-scrollbar--v" style={{ width: scrollbarSize }}>
        <ScrollAreaPrimitive.Thumb className="scroll-area-thumb" />
      </ScrollAreaPrimitive.Scrollbar>
    )}

    {(orientation === "horizontal" || orientation === "both") && (
      <ScrollAreaPrimitive.Scrollbar orientation="horizontal" className="scroll-area-scrollbar scroll-area-scrollbar--h" style={{ height: scrollbarSize }}>
        <ScrollAreaPrimitive.Thumb className="scroll-area-thumb" />
      </ScrollAreaPrimitive.Scrollbar>
    )}

    {orientation === "both" && <ScrollAreaPrimitive.Corner />}

    <style>{`
      .scroll-area-root { position: relative; overflow: hidden; }
      .scroll-area-viewport { width: 100%; height: 100%; }
      .scroll-area-scrollbar {
        display: flex; user-select: none; touch-action: none;
        padding: 2px; background: transparent;
        transition: background 0.15s;
      }
      .scroll-area-scrollbar:hover { background: color-mix(in srgb, var(--color-border) 50%, transparent); }
      .scroll-area-scrollbar--v { flex-direction: column; }
      .scroll-area-scrollbar--h { flex-direction: row; }
      .scroll-area-thumb {
        flex: 1; border-radius: 9999px; background: var(--color-border);
        position: relative; transition: background 0.15s;
      }
      .scroll-area-thumb:hover { background: var(--color-text-subtle); }
    `}</style>
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = "ScrollArea"

export { ScrollArea }
```

## בדיקות סיום
- [ ] Scrollbar מוצג ב-hover
- [ ] Vertical + Horizontal פועלים
- [ ] CSS variables בלבד
- [ ] מיוצא ב-src/index.ts
- [ ] Story ב-Storybook

← [[00 - Library Overview & Build Plan]]
