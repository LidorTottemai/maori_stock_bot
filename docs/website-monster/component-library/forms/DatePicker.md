# DatePicker

> **קטגוריה:** forms
> **תלויות:** @radix-ui/react-popover, react-day-picker, date-fns
> **Storybook:** src/stories/forms/DatePicker.stories.tsx
> **קוד:** src/forms/DatePicker.tsx
> **עלות בנייה:** ~25 דקות

## מה זה
בורר תאריך: כפתור עם התאריך הנבחר → לחיצה פותחת Popover עם Calendar. מורכב מ-Popover + Calendar. תומך בעברית ו-date range.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Single date | ברירת מחדל |
| Date range | from – to |
| With time | date + time picker |
| Min/Max | הגבלת טווח |
| Clearable | כפתור X |
| Error state | — |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `Date` | — | controlled |
| onChange | `(date: Date \| undefined) => void` | — | — |
| placeholder | `string` | `"בחר תאריך"` | — |
| format | `string` | `"dd/MM/yyyy"` | date-fns format |
| disabled | `Matcher \| Matcher[]` | — | disable dates |
| fromDate | `Date` | — | — |
| toDate | `Date` | — | — |
| clearable | `boolean` | false | — |
| error | `string` | — | — |

## שימוש בסיסי
```tsx
import { DatePicker } from "@tottemai/ui"

const [date, setDate] = useState<Date>()

<DatePicker
  value={date}
  onChange={setDate}
  placeholder="תאריך הגעה"
  disabled={{ before: new Date() }}
  clearable
/>
```

## קוד מלא
```tsx
"use client"
// src/forms/DatePicker.tsx
import * as React from "react"
import * as Popover from "@radix-ui/react-popover"
import { format } from "date-fns"
import { he } from "date-fns/locale"
import { Calendar } from "./Calendar"
import { cn } from "../cn"

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  dateFormat?: string
  disabled?: unknown
  fromDate?: Date
  toDate?: Date
  clearable?: boolean
  error?: string
  className?: string
}

function DatePicker({
  value, onChange, placeholder = "בחר תאריך",
  dateFormat = "dd/MM/yyyy", disabled, fromDate, toDate,
  clearable, error, className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className={cn("datepicker-wrapper", className)}>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button className={cn("datepicker-trigger", error && "datepicker-trigger--error")}>
            <span className={cn(!value && "datepicker-placeholder")}>
              {value ? format(value, dateFormat, { locale: he }) : placeholder}
            </span>
            <div className="datepicker-icons">
              {clearable && value && (
                <span
                  role="button" tabIndex={0} aria-label="נקה תאריך"
                  className="datepicker-clear"
                  onPointerDown={(e) => { e.stopPropagation(); onChange?.(undefined); }}
                >✕</span>
              )}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.25"/>
                <path d="M5 1v3M11 1v3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
                <path d="M2 7h12" stroke="currentColor" strokeWidth="1.25"/>
              </svg>
            </div>
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content sideOffset={4} className="datepicker-content">
            <Calendar
              mode="single"
              selected={value}
              onSelect={(date) => { onChange?.(date); setOpen(false); }}
              disabled={disabled as never}
              fromDate={fromDate}
              toDate={toDate}
              initialFocus
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {error && <p className="datepicker-error">{error}</p>}

      <style>{`
        .datepicker-wrapper { display: flex; flex-direction: column; gap: 4px; }
        .datepicker-trigger {
          display: flex; align-items: center; justify-content: space-between;
          width: 100%; height: 40px; padding: 0 12px;
          border: 1px solid var(--color-border); border-radius: var(--radius-md, 8px);
          background: var(--color-surface); color: var(--color-text);
          font-size: 0.875rem; cursor: pointer;
          transition: border-color 0.15s;
        }
        .datepicker-trigger:focus { outline: none; border-color: var(--color-primary); }
        .datepicker-trigger--error { border-color: var(--color-error, #ef4444); }
        .datepicker-placeholder { color: var(--color-text-muted); }
        .datepicker-icons { display: flex; align-items: center; gap: 6px; color: var(--color-text-muted); }
        .datepicker-clear { font-size: 0.75rem; cursor: pointer; padding: 2px 4px; border-radius: 3px; }
        .datepicker-clear:hover { background: var(--color-surface-2); }
        .datepicker-content {
          background: var(--color-surface); border: 1px solid var(--color-border);
          border-radius: var(--radius-lg, 12px); box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          z-index: 50; overflow: hidden;
        }
        .datepicker-error { font-size: 0.75rem; color: var(--color-error, #ef4444); }
      `}</style>
    </div>
  )
}

export { DatePicker }
```

## בדיקות סיום
- [ ] פותח Calendar בלחיצה
- [ ] בחירה סוגרת Popover ומציגה תאריך
- [ ] Clearable עובד
- [ ] CSS variables בלבד
- [ ] RTL תמיכה
- [ ] מיוצא ב-src/index.ts
- [ ] Story ב-Storybook

← [[00 - Library Overview & Build Plan]]
