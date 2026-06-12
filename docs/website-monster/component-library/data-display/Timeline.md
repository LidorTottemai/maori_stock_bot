# Timeline

> **קטגוריה:** data-display
> **תלויות:** react, clsx
> **Storybook:** src/stories/Timeline.stories.tsx
> **קוד:** src/data-display/Timeline.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
ציר זמן אנכי המורכב מקומפוננטת `Timeline` (מיכל) ו-`TimelineItem` (פריט בודד). כל פריט מציג אייקון בתוך עיגול, קו מחבר לפריט הבא, כותרת, תיאור ותאריך. תומך בשני וריאנטים (default / compact) ובארבעה מצבי סטטוס. תמיכה מלאה ב-RTL באמצעות CSS logical properties.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | ציר זמן סטנדרטי עם מספר פריטים |
| Compact | גרסה צפופה עם פחות רווחים |
| With Icons | פריטים עם אייקונים מותאמים |
| With Status | שילוב מצבי completed / active / error |
| Mixed States | ציר זמן עם מצבים מעורבים וסטטוסים שונים |

## Props API

### Timeline
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'default' \| 'compact'` | `'default'` | צפיפות הפריטים בציר הזמן |
| className | `string` | — | מחלקות CSS נוספות לעטיפה |
| children | `ReactNode` | — (required) | פריטי `TimelineItem` |

### TimelineItem
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | `string` | — (required) | כותרת הפריט |
| description | `string` | — | טקסט תיאור אופציונלי |
| date | `string` | — | תאריך או חותמת זמן להצגה |
| icon | `ReactNode` | — | אייקון מותאם בתוך העיגול |
| status | `'default' \| 'completed' \| 'active' \| 'error'` | `'default'` | מצב ויזואלי של הפריט |
| isLast | `boolean` | `false` | מסיר את הקו המחבר לפריט הבא |
| className | `string` | — | מחלקות CSS נוספות לפריט |

## שימוש בסיסי
```tsx
import { Timeline, TimelineItem } from "@tottemai/ui"

<Timeline>
  <TimelineItem
    title="הזמנה התקבלה"
    description="הזמנתך נקלטה במערכת בהצלחה"
    date="10 ביוני 2026"
    status="completed"
  />
  <TimelineItem
    title="בעיבוד"
    description="ההזמנה נמצאת בתהליך אריזה"
    date="11 ביוני 2026"
    status="active"
  />
  <TimelineItem
    title="נשלחה"
    description="הזמנתך בדרך אליך"
    date="12 ביוני 2026"
    isLast
  />
</Timeline>

{/* וריאנט compact */}
<Timeline variant="compact">
  <TimelineItem title="שלב ראשון" status="completed" isLast={false} />
  <TimelineItem title="שלב שני" status="active" isLast />
</Timeline>
```

## קוד מלא
```tsx
// src/data-display/Timeline.tsx
import clsx from "clsx"
import React from "react"

/* ─── Types ─────────────────────────────────────────────────────────── */

export type TimelineVariant = "default" | "compact"
export type TimelineItemStatus = "default" | "completed" | "active" | "error"

export interface TimelineProps {
  /** צפיפות הפריטים בציר הזמן */
  variant?: TimelineVariant
  /** מחלקות CSS נוספות לעטיפה */
  className?: string
  /** פריטי TimelineItem */
  children: React.ReactNode
}

export interface TimelineItemProps {
  /** כותרת הפריט */
  title: string
  /** טקסט תיאור אופציונלי */
  description?: string
  /** תאריך או חותמת זמן להצגה */
  date?: string
  /** אייקון מותאם בתוך העיגול */
  icon?: React.ReactNode
  /** מצב ויזואלי של הפריט */
  status?: TimelineItemStatus
  /** מסיר את הקו המחבר לפריט הבא */
  isLast?: boolean
  /** מחלקות CSS נוספות לפריט */
  className?: string
}

/* ─── Context ────────────────────────────────────────────────────────── */

interface TimelineContextValue {
  variant: TimelineVariant
}

const TimelineContext = React.createContext<TimelineContextValue>({
  variant: "default",
})

/* ─── Default icon per status ────────────────────────────────────────── */

function DefaultIcon({ status }: { status: TimelineItemStatus }) {
  if (status === "completed") {
    return (
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2 6l3 3 5-5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  if (status === "error") {
    return (
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3 3l6 6M9 3l-6 6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  if (status === "active") {
    return (
      <svg
        width="8"
        height="8"
        viewBox="0 0 8 8"
        aria-hidden="true"
      >
        <circle cx="4" cy="4" r="4" fill="currentColor" />
      </svg>
    )
  }
  // default — empty dot
  return (
    <svg
      width="6"
      height="6"
      viewBox="0 0 6 6"
      aria-hidden="true"
    >
      <circle cx="3" cy="3" r="3" fill="currentColor" />
    </svg>
  )
}

/* ─── Components ─────────────────────────────────────────────────────── */

export function Timeline({
  variant = "default",
  className,
  children,
}: TimelineProps) {
  return (
    <TimelineContext.Provider value={{ variant }}>
      <ol
        className={clsx(
          "timeline",
          `timeline--${variant}`,
          className
        )}
        // Semantic ordered list so screen readers announce item count
      >
        {children}
      </ol>
    </TimelineContext.Provider>
  )
}

export function TimelineItem({
  title,
  description,
  date,
  icon,
  status = "default",
  isLast = false,
  className,
}: TimelineItemProps) {
  const { variant } = React.useContext(TimelineContext)

  return (
    <li
      className={clsx(
        "timeline-item",
        `timeline-item--${status}`,
        variant === "compact" && "timeline-item--compact",
        isLast && "timeline-item--last",
        className
      )}
      data-status={status}
    >
      {/* Left/start column: icon + connecting line */}
      <div className="timeline-item__track" aria-hidden="true">
        <div className="timeline-item__icon-wrap">
          {icon ?? <DefaultIcon status={status} />}
        </div>
        {!isLast && <div className="timeline-item__line" />}
      </div>

      {/* Right/end column: content */}
      <div className="timeline-item__content">
        <div className="timeline-item__header">
          <span className="timeline-item__title">{title}</span>
          {date && (
            <time className="timeline-item__date" dateTime={date}>
              {date}
            </time>
          )}
        </div>
        {description && (
          <p className="timeline-item__description">{description}</p>
        )}
      </div>
    </li>
  )
}

/*
  CSS (add to your global stylesheet or CSS module):

  /* ── Timeline container ── */
  .timeline {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  /* ── Item layout ── */
  .timeline-item {
    display: flex;
    gap: var(--spacing-3, 12px);
    padding-block-end: var(--spacing-5, 20px);
  }
  .timeline-item--compact {
    padding-block-end: var(--spacing-3, 12px);
  }
  .timeline-item--last {
    padding-block-end: 0;
  }

  /* ── Track (icon + line) ── */
  .timeline-item__track {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    width: var(--timeline-track-width, 24px);
  }

  .timeline-item__icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--timeline-icon-size, 24px);
    height: var(--timeline-icon-size, 24px);
    border-radius: var(--radius-full, 9999px);
    flex-shrink: 0;
    background-color: var(--color-timeline-icon-bg, var(--color-neutral-200));
    color: var(--color-timeline-icon-fg, var(--color-neutral-600));
    border: 2px solid var(--color-timeline-icon-border, var(--color-neutral-300));
    transition: background-color 150ms ease, border-color 150ms ease;
  }

  /* Status colour overrides */
  .timeline-item--completed .timeline-item__icon-wrap {
    background-color: var(--color-timeline-completed-bg, var(--color-success-100));
    color: var(--color-timeline-completed-fg, var(--color-success-700));
    border-color: var(--color-timeline-completed-border, var(--color-success-400));
  }
  .timeline-item--active .timeline-item__icon-wrap {
    background-color: var(--color-timeline-active-bg, var(--color-primary-100));
    color: var(--color-timeline-active-fg, var(--color-primary-600));
    border-color: var(--color-timeline-active-border, var(--color-primary-400));
    box-shadow: 0 0 0 3px var(--color-timeline-active-ring, var(--color-primary-200));
  }
  .timeline-item--error .timeline-item__icon-wrap {
    background-color: var(--color-timeline-error-bg, var(--color-error-100));
    color: var(--color-timeline-error-fg, var(--color-error-700));
    border-color: var(--color-timeline-error-border, var(--color-error-400));
  }

  /* Connecting line */
  .timeline-item__line {
    flex: 1;
    width: 2px;
    margin-block: var(--spacing-1, 4px);
    background-color: var(--color-timeline-line, var(--color-neutral-200));
    border-radius: var(--radius-full, 9999px);
  }
  .timeline-item--completed .timeline-item__line {
    background-color: var(--color-timeline-completed-line, var(--color-success-300));
  }

  /* ── Content ── */
  .timeline-item__content {
    flex: 1;
    min-width: 0; /* prevent overflow */
    padding-block-start: var(--spacing-0-5, 2px); /* align with icon center */
  }

  .timeline-item__header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--spacing-2, 8px);
    flex-wrap: wrap;
  }

  .timeline-item__title {
    font-size: var(--font-size-sm, 0.875rem);
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary, var(--color-neutral-900));
    line-height: var(--line-height-tight, 1.4);
  }

  .timeline-item__date {
    font-size: var(--font-size-xs, 0.75rem);
    color: var(--color-text-muted, var(--color-neutral-500));
    white-space: nowrap;
    flex-shrink: 0;
  }

  .timeline-item__description {
    margin: 0;
    margin-block-start: var(--spacing-1, 4px);
    font-size: var(--font-size-sm, 0.875rem);
    color: var(--color-text-secondary, var(--color-neutral-600));
    line-height: var(--line-height-normal, 1.6);
  }

  /* ── RTL support ──
     All spacing uses logical properties (padding-block-*, padding-inline-*,
     margin-inline-start, etc.) so the layout mirrors automatically when
     dir="rtl" is set on a parent. The track column appears on the
     inline-start side in both directions. */
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
