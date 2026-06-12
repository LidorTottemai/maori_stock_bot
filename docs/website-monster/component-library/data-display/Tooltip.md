# Tooltip

> **קטגוריה:** data-display
> **תלויות:** @radix-ui/react-tooltip, react, clsx
> **Storybook:** src/stories/Tooltip.stories.tsx
> **קוד:** src/data-display/Tooltip.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
Tooltip מבוסס Radix UI המציג תוכן עזר קצר בעת ריחוף על אלמנט. תומך בהשהיית הופעה, ארבעה כיווני מיקום, יישור, רוחב מקסימלי מותאם ותמיכה מלאה ב-RTL.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | Tooltip בסיסי עם תוכן טקסט פשוט |
| With Delay | הופעה עם השהיה של 800ms |
| Top | Tooltip מעל הטריגר |
| Bottom | Tooltip מתחת לטריגר |
| Left | Tooltip משמאל לטריגר |
| Right | Tooltip מימין לטריגר |
| Max Width | Tooltip עם רוחב מוגבל וגלישת טקסט |
| Disabled Trigger | טריגר מושבת עטוף ב-span לנגישות |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| content | `ReactNode` | — (required) | התוכן שמוצג בתוך ה-Tooltip |
| side | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | הצד שבו מוצג ה-Tooltip ביחס לטריגר |
| align | `'start' \| 'center' \| 'end'` | `'center'` | היישור לאורך הציר הנגדי |
| delayDuration | `number` | `400` | השהיה במילישניות לפני הצגת ה-Tooltip |
| maxWidth | `number \| string` | `200` | רוחב מקסימלי של ה-Tooltip (px אם מספר) |
| children | `ReactNode` | — (required) | אלמנט הטריגר שמפעיל את ה-Tooltip |
| className | `string` | — | מחלקות CSS נוספות ל-Content |

## שימוש בסיסי
```tsx
import { Tooltip } from "@tottemai/ui"

<Tooltip content="מידע נוסף על הפעולה">
  <button>ריחוף עלי</button>
</Tooltip>

{/* עם השהיה וכיוון מותאם */}
<Tooltip
  content="עוד פרטים כאן"
  side="bottom"
  align="start"
  delayDuration={800}
  maxWidth={300}
>
  <span>אלמנט עם Tooltip</span>
</Tooltip>
```

## קוד מלא
```tsx
// src/data-display/Tooltip.tsx
import * as RadixTooltip from "@radix-ui/react-tooltip"
import clsx from "clsx"
import React from "react"

export interface TooltipProps {
  /** התוכן שמוצג בתוך ה-Tooltip */
  content: React.ReactNode
  /** הצד שבו מוצג ה-Tooltip ביחס לטריגר */
  side?: "top" | "bottom" | "left" | "right"
  /** היישור לאורך הציר הנגדי */
  align?: "start" | "center" | "end"
  /** השהיה במילישניות לפני הצגת ה-Tooltip */
  delayDuration?: number
  /** רוחב מקסימלי של ה-Tooltip (px אם מספר) */
  maxWidth?: number | string
  /** אלמנט הטריגר שמפעיל את ה-Tooltip */
  children: React.ReactNode
  /** מחלקות CSS נוספות ל-Content */
  className?: string
}

export function Tooltip({
  content,
  side = "top",
  align = "center",
  delayDuration = 400,
  maxWidth = 200,
  children,
  className,
}: TooltipProps) {
  const resolvedMaxWidth =
    typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth

  return (
    <RadixTooltip.Provider delayDuration={delayDuration}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>
          {/* Wrap in span to support disabled buttons as triggers */}
          <span style={{ display: "inline-flex" }}>{children}</span>
        </RadixTooltip.Trigger>

        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            align={align}
            sideOffset={6}
            className={clsx("tooltip-content", className)}
            style={
              {
                "--tooltip-max-width": resolvedMaxWidth,
              } as React.CSSProperties
            }
          >
            {content}
            <RadixTooltip.Arrow className="tooltip-arrow" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  )
}

/*
  CSS (add to your global stylesheet or CSS module):

  .tooltip-content {
    max-width: var(--tooltip-max-width, 200px);
    padding: var(--spacing-1, 4px) var(--spacing-2, 8px);
    border-radius: var(--radius-sm, 4px);
    background-color: var(--color-tooltip-bg, var(--color-neutral-900));
    color: var(--color-tooltip-fg, var(--color-neutral-50));
    font-size: var(--font-size-xs, 0.75rem);
    line-height: var(--line-height-tight, 1.4);
    word-break: break-word;
    box-shadow: var(--shadow-md);
    z-index: var(--z-tooltip, 1000);
    animation-duration: 150ms;
    animation-timing-function: ease-out;
  }

  .tooltip-content[data-state="delayed-open"][data-side="top"] {
    animation-name: tooltipSlideUp;
  }
  .tooltip-content[data-state="delayed-open"][data-side="bottom"] {
    animation-name: tooltipSlideDown;
  }
  .tooltip-content[data-state="delayed-open"][data-side="left"] {
    animation-name: tooltipSlideLeft;
  }
  .tooltip-content[data-state="delayed-open"][data-side="right"] {
    animation-name: tooltipSlideRight;
  }

  .tooltip-arrow {
    fill: var(--color-tooltip-bg, var(--color-neutral-900));
  }

  @keyframes tooltipSlideUp {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes tooltipSlideDown {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes tooltipSlideLeft {
    from { opacity: 0; transform: translateX(4px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes tooltipSlideRight {
    from { opacity: 0; transform: translateX(-4px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  /* RTL: Radix automatically flips left/right sides when dir="rtl" is
     set on the document or a parent element. No extra CSS needed. */
*/
```

## בדיקות סיום
- [ ] מרנדר בלי שגיאות
- [ ] כל ה-variants פועלים
- [ ] CSS variables בלבד
- [ ] Accessible (aria-*, keyboard nav)
- [ ] RTL תמיכה
- [ ] מיוצא ב-src/index.ts
- [ ] Story ב-Storybook

← [[00 - Library Overview & Build Plan]]
