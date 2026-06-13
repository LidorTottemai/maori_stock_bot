# Calendar

> **קטגוריה:** forms
> **תלויות:** react-day-picker, date-fns
> **Storybook:** src/stories/forms/Calendar.stories.tsx
> **קוד:** src/forms/Calendar.tsx
> **עלות בנייה:** ~30 דקות

## מה זה
לוח שנה חודשי לבחירת תאריך. מבוסס react-day-picker. תומך ב-date range, disabled dates, ולוקל עברי (ראשון ראשון). משמש בתוך DatePicker.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Single | בחירת תאריך בודד |
| Range | בחירת טווח תאריכים |
| Disabled dates | ימים ספציפיים חסומים |
| Min/Max | טווח חוקי |
| Multiple months | 2 חודשים בצד |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| mode | `'single' \| 'range' \| 'multiple'` | `'single'` | — |
| selected | `Date \| DateRange \| Date[]` | — | controlled |
| onSelect | `(date) => void` | — | — |
| disabled | `Matcher \| Matcher[]` | — | disable dates |
| fromDate | `Date` | — | min date |
| toDate | `Date` | — | max date |
| locale | `Locale` | `he` | — |
| numberOfMonths | `number` | `1` | — |

## שימוש בסיסי
```tsx
import { Calendar } from "@tottemai/ui"
import { he } from "date-fns/locale"

const [date, setDate] = useState<Date>()

<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  locale={he}
  disabled={{ before: new Date() }}
/>
```

## קוד מלא
```tsx
"use client"
// src/forms/Calendar.tsx
import * as React from "react"
import { DayPicker, DayPickerProps } from "react-day-picker"
import { he } from "date-fns/locale"
import { cn } from "../cn"

type CalendarProps = DayPickerProps & { className?: string }

function Calendar({ className, locale = he, ...props }: CalendarProps) {
  return (
    <>
      <DayPicker
        locale={locale}
        weekStartsOn={0}
        showOutsideDays
        className={cn("calendar", className)}
        classNames={{
          months: "calendar-months",
          month: "calendar-month",
          caption: "calendar-caption",
          caption_label: "calendar-caption-label",
          nav: "calendar-nav",
          nav_button: "calendar-nav-btn",
          nav_button_previous: "calendar-prev",
          nav_button_next: "calendar-next",
          table: "calendar-table",
          head_row: "calendar-head-row",
          head_cell: "calendar-head-cell",
          row: "calendar-row",
          cell: "calendar-cell",
          day: "calendar-day",
          day_selected: "calendar-day-selected",
          day_today: "calendar-day-today",
          day_outside: "calendar-day-outside",
          day_disabled: "calendar-day-disabled",
          day_range_middle: "calendar-day-range-middle",
          day_range_start: "calendar-day-range-start",
          day_range_end: "calendar-day-range-end",
        }}
        {...props}
      />
      <style>{`
        .calendar { padding: 16px; background: var(--color-surface); border-radius: var(--radius-lg, 12px); display: inline-block; }
        .calendar-months { display: flex; gap: 16px; }
        .calendar-caption { display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; }
        .calendar-caption-label { font-size: 0.9375rem; font-weight: 600; color: var(--color-text); }
        .calendar-nav { display: flex; gap: 4px; }
        .calendar-nav-btn {
          width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--color-border); border-radius: var(--radius-sm, 4px);
          background: transparent; color: var(--color-text-muted); cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .calendar-nav-btn:hover { background: var(--color-surface-2); color: var(--color-text); }
        .calendar-table { border-collapse: collapse; width: 100%; }
        .calendar-head-cell { font-size: 0.75rem; font-weight: 500; color: var(--color-text-muted); text-align: center; padding: 4px 0; width: 36px; }
        .calendar-cell { padding: 2px; text-align: center; }
        .calendar-day {
          width: 34px; height: 34px; border-radius: var(--radius-sm, 6px);
          font-size: 0.875rem; color: var(--color-text); cursor: pointer; border: none; background: transparent;
          transition: background 0.1s, color 0.1s;
        }
        .calendar-day:hover { background: var(--color-surface-2); }
        .calendar-day-selected { background: var(--color-primary) !important; color: white !important; }
        .calendar-day-today { font-weight: 700; border: 1px solid var(--color-border); }
        .calendar-day-outside { color: var(--color-text-subtle); }
        .calendar-day-disabled { color: var(--color-text-subtle); cursor: not-allowed; opacity: 0.5; }
        .calendar-day-range-middle { background: color-mix(in srgb, var(--color-primary) 15%, transparent); border-radius: 0; }
        .calendar-day-range-start { border-radius: var(--radius-sm, 6px) 0 0 var(--radius-sm, 6px); }
        .calendar-day-range-end { border-radius: 0 var(--radius-sm, 6px) var(--radius-sm, 6px) 0; }
      `}</style>
    </>
  )
}

export { Calendar }
```

## בדיקות סיום
- [ ] Single/Range/Multiple modes פועלים
- [ ] עברית: ראשון ראשון
- [ ] Disabled dates פועלים
- [ ] CSS variables בלבד
- [ ] RTL תמיכה
- [ ] מיוצא ב-src/index.ts
- [ ] Story ב-Storybook

← [[00 - Library Overview & Build Plan]]
