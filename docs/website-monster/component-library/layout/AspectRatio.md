# AspectRatio

> **קטגוריה:** layout
> **תלויות:** @radix-ui/react-aspect-ratio
> **Storybook:** src/stories/layout/AspectRatio.stories.tsx
> **קוד:** src/layout/AspectRatio.tsx
> **עלות בנייה:** ~10 דקות

## מה זה
שמירת יחס גובה-רוחב לאלמנטים (תמונות, וידאו, maps). מבוסס Radix AspectRatio. מונע layout shift בטעינת תמונות.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| ratio | `number` | `16/9` | width/height |
| children | `ReactNode` | — | תמונה/וידאו |
| className | `string` | — | — |

## שימוש בסיסי
```tsx
import { AspectRatio } from "@tottemai/ui"

// תמונה 16:9
<AspectRatio ratio={16/9}>
  <img src="/hero.jpg" alt="hero" className="object-cover w-full h-full" />
</AspectRatio>

// ריבועי
<AspectRatio ratio={1}>
  <img src="/avatar.jpg" alt="avatar" />
</AspectRatio>
```

## קוד מלא
```tsx
// src/layout/AspectRatio.tsx
import * as React from "react"
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"
import { cn } from "../cn"

interface AspectRatioProps extends React.ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root> {
  className?: string
}

const AspectRatio = React.forwardRef<
  React.ElementRef<typeof AspectRatioPrimitive.Root>,
  AspectRatioProps
>(({ className, children, ...props }, ref) => (
  <AspectRatioPrimitive.Root
    ref={ref}
    className={cn("aspect-ratio-root", className)}
    {...props}
  >
    {children}
    <style>{`
      .aspect-ratio-root { position: relative; width: 100%; overflow: hidden; }
      .aspect-ratio-root > * { position: absolute; inset: 0; width: 100%; height: 100%; }
    `}</style>
  </AspectRatioPrimitive.Root>
))
AspectRatio.displayName = "AspectRatio"

export { AspectRatio }
```

## בדיקות סיום
- [ ] יחס נשמר ב-responsive
- [ ] תמונה ממלאת את הContainer
- [ ] אין layout shift
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
