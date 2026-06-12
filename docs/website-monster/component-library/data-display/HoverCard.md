# HoverCard

> **קטגוריה:** data-display
> **תלויות:** @radix-ui/react-hover-card, react, clsx
> **Storybook:** src/stories/HoverCard.stories.tsx
> **קוד:** src/data-display/HoverCard.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
HoverCard מבוסס Radix UI המציג תצוגה מקדימה עשירה בעת ריחוף על טריגר. מתאים לתצוגת פרופיל משתמש, תצוגה מקדימה של קישור או כל תוכן מותאם. תומך בהשהיית פתיחה וסגירה נפרדות ותמיכה מלאה ב-RTL.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | HoverCard בסיסי עם תוכן טקסט |
| User Profile Preview | תצוגת פרופיל משתמש עם אווטאר ופרטים |
| Link Preview | תצוגה מקדימה של כתובת URL עם כותרת ותיאור |
| Custom Content | תוכן מותאם אישית עם תמונה וכפתורים |
| With Avatar | HoverCard עם אווטאר גדול ומידע ביוגרפי |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| trigger | `ReactNode` | — (required) | האלמנט שמפעיל את ה-HoverCard בריחוף |
| children | `ReactNode` | — (required) | התוכן שמוצג בתוך ה-HoverCard |
| openDelay | `number` | `300` | השהיה במילישניות לפני פתיחה |
| closeDelay | `number` | `200` | השהיה במילישניות לפני סגירה |
| side | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | הצד שבו מוצג ה-HoverCard ביחס לטריגר |
| align | `'start' \| 'center' \| 'end'` | `'center'` | היישור לאורך הציר הנגדי |
| className | `string` | — | מחלקות CSS נוספות ל-Content |

## שימוש בסיסי
```tsx
import { HoverCard } from "@tottemai/ui"

{/* תצוגת פרופיל בסיסית */}
<HoverCard
  trigger={<a href="/profile">@username</a>}
>
  <div>
    <img src="/avatar.png" alt="User avatar" />
    <strong>שם מלא</strong>
    <p>תיאור קצר של המשתמש</p>
  </div>
</HoverCard>

{/* עם השהיות מותאמות */}
<HoverCard
  trigger={<span>ריחוף עלי</span>}
  openDelay={500}
  closeDelay={100}
  side="top"
  align="start"
>
  <p>תוכן מותאם</p>
</HoverCard>
```

## קוד מלא
```tsx
// src/data-display/HoverCard.tsx
import * as RadixHoverCard from "@radix-ui/react-hover-card"
import clsx from "clsx"
import React from "react"

export interface HoverCardProps {
  /** האלמנט שמפעיל את ה-HoverCard בריחוף */
  trigger: React.ReactNode
  /** התוכן שמוצג בתוך ה-HoverCard */
  children: React.ReactNode
  /** השהיה במילישניות לפני פתיחה */
  openDelay?: number
  /** השהיה במילישניות לפני סגירה */
  closeDelay?: number
  /** הצד שבו מוצג ה-HoverCard ביחס לטריגר */
  side?: "top" | "bottom" | "left" | "right"
  /** היישור לאורך הציר הנגדי */
  align?: "start" | "center" | "end"
  /** מחלקות CSS נוספות ל-Content */
  className?: string
}

export function HoverCard({
  trigger,
  children,
  openDelay = 300,
  closeDelay = 200,
  side = "bottom",
  align = "center",
  className,
}: HoverCardProps) {
  return (
    <RadixHoverCard.Root openDelay={openDelay} closeDelay={closeDelay}>
      <RadixHoverCard.Trigger asChild>
        {/* Wrap in span so any element can be a trigger */}
        <span className="hover-card-trigger">{trigger}</span>
      </RadixHoverCard.Trigger>

      <RadixHoverCard.Portal>
        <RadixHoverCard.Content
          side={side}
          align={align}
          sideOffset={8}
          className={clsx("hover-card-content", className)}
        >
          {children}
          <RadixHoverCard.Arrow className="hover-card-arrow" />
        </RadixHoverCard.Content>
      </RadixHoverCard.Portal>
    </RadixHoverCard.Root>
  )
}

/*
  CSS (add to your global stylesheet or CSS module):

  .hover-card-trigger {
    display: inline-flex;
    cursor: pointer;
  }

  .hover-card-content {
    min-width: var(--hover-card-min-width, 220px);
    max-width: var(--hover-card-max-width, 360px);
    padding: var(--spacing-3, 12px);
    border-radius: var(--radius-md, 8px);
    background-color: var(--color-surface-overlay, var(--color-neutral-0));
    color: var(--color-text-primary, var(--color-neutral-900));
    border: 1px solid var(--color-border-subtle, var(--color-neutral-200));
    box-shadow: var(--shadow-lg);
    z-index: var(--z-popover, 900);
    outline: none;
    animation-duration: 200ms;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  }

  .hover-card-content[data-state="open"][data-side="top"] {
    animation-name: hoverCardSlideUp;
  }
  .hover-card-content[data-state="open"][data-side="bottom"] {
    animation-name: hoverCardSlideDown;
  }
  .hover-card-content[data-state="open"][data-side="left"] {
    animation-name: hoverCardSlideLeft;
  }
  .hover-card-content[data-state="open"][data-side="right"] {
    animation-name: hoverCardSlideRight;
  }

  .hover-card-arrow {
    fill: var(--color-surface-overlay, var(--color-neutral-0));
    /* Match the border color via drop-shadow filter on parent if needed */
  }

  @keyframes hoverCardSlideUp {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes hoverCardSlideDown {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes hoverCardSlideLeft {
    from { opacity: 0; transform: translateX(6px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes hoverCardSlideRight {
    from { opacity: 0; transform: translateX(-6px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  /* RTL: Radix automatically mirrors left/right side placement when
     dir="rtl" is present on the document or a parent. No extra CSS needed.
     Use logical properties (margin-inline-start, padding-inline-end, etc.)
     inside the card content to support both directions. */
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
