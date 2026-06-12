# Popover

> **קטגוריה:** surfaces
> **תלויות:** @radix-ui/react-popover
> **Storybook:** src/stories/Popover.stories.tsx
> **קוד:** src/surfaces/Popover.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
קומפוננטת Popover מבוססת Radix UI, מציגה תוכן צף מעל העמוד בקרבת אלמנט trigger. תומכת בהצבה גמישה (top/bottom/left/right + start/center/end), חץ אופציונלי, וסגירה אוטומטית בקליק מחוץ לאזור.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | popover בסיסי עם כותרת ותוכן |
| WithArrow | popover עם חץ המצביע ל-trigger |
| Placements | הדגמת כל כיווני ההצבה |
| Form | popover המכיל טופס פשוט |
| Controlled | מצב נשלט עם isOpen / onOpenChange |

## Props API / Return Value
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| open | `boolean` | `undefined` | מצב נשלט |
| defaultOpen | `boolean` | `false` | פתוח כברירת מחדל |
| onOpenChange | `(open: boolean) => void` | `undefined` | callback בשינוי |
| modal | `boolean` | `false` | מצב מודאל (trap focus) |

### PopoverContent Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| side | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` | צד ביחס ל-trigger |
| align | `"start" \| "center" \| "end"` | `"center"` | יישור |
| sideOffset | `number` | `8` | רווח בפיקסלים מה-trigger |
| showArrow | `boolean` | `false` | הצגת חץ |
| className | `string` | `""` | CSS נוסף |

## שימוש בסיסי
\`\`\`tsx
import { Popover, PopoverTrigger, PopoverContent } from "@tottemai/ui"

<Popover>
  <PopoverTrigger asChild>
    <button>פתח Popover</button>
  </PopoverTrigger>
  <PopoverContent showArrow>
    <p>תוכן ה-Popover</p>
  </PopoverContent>
</Popover>
\`\`\`

## קוד מלא
\`\`\`tsx
import * as React from "react"
import * as RadixPopover from "@radix-ui/react-popover"

// ─── Types ───────────────────────────────────────────────────────────────────

interface PopoverContentProps extends React.ComponentPropsWithoutRef<typeof RadixPopover.Content> {
  showArrow?: boolean
}

// ─── Popover (root) ──────────────────────────────────────────────────────────

const Popover = RadixPopover.Root
const PopoverTrigger = RadixPopover.Trigger
const PopoverPortal = RadixPopover.Portal

// ─── PopoverContent ──────────────────────────────────────────────────────────

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof RadixPopover.Content>,
  PopoverContentProps
>(
  (
    {
      style,
      children,
      showArrow = false,
      sideOffset = 8,
      align = "center",
      side = "bottom",
      ...props
    },
    ref
  ) => (
    <PopoverPortal>
      <RadixPopover.Content
        ref={ref}
        sideOffset={sideOffset}
        align={align}
        side={side}
        style={{
          background: "var(--color-surface-overlay)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg)",
          padding: "var(--spacing-4)",
          maxWidth: "320px",
          zIndex: "var(--z-popover)",
          animationDuration: "var(--duration-normal)",
          transformOrigin: "var(--radix-popover-content-transform-origin)",
          ...style,
        }}
        {...props}
      >
        {children}
        {showArrow && (
          <RadixPopover.Arrow
            style={{
              fill: "var(--color-surface-overlay)",
              stroke: "var(--color-border)",
            }}
            width={12}
            height={6}
          />
        )}
      </RadixPopover.Content>
    </PopoverPortal>
  )
)

PopoverContent.displayName = "PopoverContent"

// ─── PopoverClose ────────────────────────────────────────────────────────────

const PopoverClose = React.forwardRef<
  React.ElementRef<typeof RadixPopover.Close>,
  React.ComponentPropsWithoutRef<typeof RadixPopover.Close>
>(({ style, children, ...props }, ref) => (
  <RadixPopover.Close
    ref={ref}
    style={{
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "var(--color-text-muted)",
      padding: "var(--spacing-1)",
      borderRadius: "var(--radius-sm)",
      ...style,
    }}
    {...props}
  >
    {children ?? (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )}
  </RadixPopover.Close>
))

PopoverClose.displayName = "PopoverClose"

/*
 * CSS for entry/exit animations:
 *
 * [data-radix-popper-content-wrapper] [data-state="open"] {
 *   animation: popover-in var(--duration-normal) var(--ease-out);
 * }
 * [data-radix-popper-content-wrapper] [data-state="closed"] {
 *   animation: popover-out var(--duration-fast) var(--ease-in);
 * }
 * @keyframes popover-in {
 *   from { opacity: 0; transform: scale(0.96) }
 *   to   { opacity: 1; transform: scale(1) }
 * }
 * @keyframes popover-out {
 *   from { opacity: 1; transform: scale(1) }
 *   to   { opacity: 0; transform: scale(0.96) }
 * }
 */

export { Popover, PopoverTrigger, PopoverPortal, PopoverContent, PopoverClose }
export type { PopoverContentProps }
\`\`\`

## בדיקות סיום
- [ ] מרנדר בלי שגיאות
- [ ] כל ה-variants פועלים
- [ ] CSS variables בלבד
- [ ] Accessible
- [ ] RTL תמיכה
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
