# Popover

> **קטגוריה:** surfaces
> **תלויות:** @radix-ui/react-popover
> **Storybook:** src/stories/Popover.stories.tsx
> **קוד:** src/surfaces/Popover.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
קומפוננטת Popover המבוססת על Radix UI. מציגה תוכן floating מעל הדף, עם תמיכה באפשרויות placement שונות, חץ ויזואלי, וסגירה אוטומטית בלחיצה מחוץ לאלמנט.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | Popover בסיסי עם כפתור trigger |
| WithArrow | Popover עם חץ מצביע |
| TopPlacement | ממוקם מעל ה-trigger |
| BottomPlacement | ממוקם מתחת ה-trigger (ברירת מחדל) |
| StartPlacement | יישור לצד הטקסט |
| FormPopover | Popover עם טופס פנימי |

## Props API / Return Value
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| open | `boolean` | `undefined` | מצב נשלט |
| defaultOpen | `boolean` | `false` | מצב פתיחה התחלתי |
| onOpenChange | `(open: boolean) => void` | `undefined` | callback לשינוי מצב |

**PopoverTrigger Props**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| asChild | `boolean` | `false` | מרנדר ילד ישיר כ-trigger |
| children | `React.ReactNode` | — | אלמנט הפעלה |

**PopoverContent Props**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| side | `"top" \| "bottom" \| "left" \| "right"` | `"bottom"` | כיוון הצגה |
| align | `"start" \| "center" \| "end"` | `"center"` | יישור |
| sideOffset | `number` | `8` | מרחק מה-trigger (px) |
| showArrow | `boolean` | `false` | הצגת חץ |
| className | `string` | `undefined` | class נוסף |
| children | `React.ReactNode` | — | תוכן ה-popover |

## שימוש בסיסי
```tsx
import { Popover, PopoverTrigger, PopoverContent } from "@tottemai/ui"

<Popover>
  <PopoverTrigger asChild>
    <button>פתח Popover</button>
  </PopoverTrigger>
  <PopoverContent side="bottom" showArrow>
    <p>תוכן ה-Popover מופיע כאן</p>
  </PopoverContent>
</Popover>
```

## קוד מלא
```tsx
import * as RadixPopover from "@radix-ui/react-popover"
import React from "react"

const KEYFRAMES = `
@keyframes popover-in {
  from { opacity: 0; transform: scale(0.95) translateY(-4px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes popover-out {
  from { opacity: 1; transform: scale(1) translateY(0); }
  to   { opacity: 0; transform: scale(0.95) translateY(-4px); }
}
`

function injectKeyframes() {
  if (typeof document === "undefined") return
  if (document.getElementById("tottemai-popover-kf")) return
  const style = document.createElement("style")
  style.id = "tottemai-popover-kf"
  style.textContent = KEYFRAMES
  document.head.appendChild(style)
}

// Root
interface PopoverProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export function Popover({ open, defaultOpen, onOpenChange, children }: PopoverProps) {
  React.useEffect(() => { injectKeyframes() }, [])
  return (
    <RadixPopover.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {children}
    </RadixPopover.Root>
  )
}

// Trigger
export const PopoverTrigger = RadixPopover.Trigger

// Content
interface PopoverContentProps {
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  sideOffset?: number
  showArrow?: boolean
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

export function PopoverContent({
  side = "bottom",
  align = "center",
  sideOffset = 8,
  showArrow = false,
  className,
  style,
  children,
}: PopoverContentProps) {
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        side={side}
        align={align}
        sideOffset={sideOffset}
        className={className}
        style={{
          zIndex: "var(--z-popover, 50)",
          background: "var(--popover-bg, var(--color-surface))",
          border: "1px solid var(--popover-border, var(--color-border))",
          borderRadius: "var(--popover-radius, var(--radius-md, 8px))",
          boxShadow: "var(--shadow-lg)",
          padding: "var(--popover-padding, var(--spacing-4, 16px))",
          minWidth: "var(--popover-min-width, 200px)",
          maxWidth: "var(--popover-max-width, 360px)",
          color: "var(--popover-color, var(--color-text))",
          fontSize: "var(--popover-font-size, var(--text-sm, 0.875rem))",
          animationDuration: "var(--duration-150, 150ms)",
          animationTimingFunction: "var(--ease-out, ease-out)",
          outline: "none",
          ...style,
        }}
      >
        {children}
        {showArrow && (
          <RadixPopover.Arrow
            style={{
              fill: "var(--popover-arrow-fill, var(--color-surface))",
              filter: "drop-shadow(0 1px 0 var(--popover-border, var(--color-border)))",
            }}
            width={12}
            height={6}
          />
        )}
      </RadixPopover.Content>
    </RadixPopover.Portal>
  )
}

// Close button (optional utility)
export const PopoverClose = RadixPopover.Close
```

## בדיקות סיום
- [ ] מרנדר בלי שגיאות
- [ ] כל ה-variants פועלים
- [ ] CSS variables בלבד
- [ ] Accessible
- [ ] RTL תמיכה
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
