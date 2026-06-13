# Combobox

> **קטגוריה:** forms
> **תלויות:** cmdk, @radix-ui/react-popover
> **Storybook:** src/stories/forms/Combobox.stories.tsx
> **קוד:** src/forms/Combobox.tsx
> **עלות בנייה:** ~35 דקות

## מה זה
Autocomplete / Combobox עם fuzzy search. לוחץ → נפתח popover עם input חיפוש + רשימת אפשרויות. מתאים לselect ארוכים (מדינות, ערים, מוצרים). תומך ב-async loading.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | חיפוש synchronous |
| Async | loading spinner בזמן fetch |
| Multi-select | בחירה מרובה עם chips |
| Groups | אפשרויות מקובצות |
| Clearable | כפתור X לניקוי |
| Empty state | "לא נמצאו תוצאות" |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `string` | — | controlled single value |
| onValueChange | `(value: string) => void` | — | — |
| options | `{ value: string; label: string }[]` | — | — |
| placeholder | `string` | `"חפש..."` | — |
| searchPlaceholder | `string` | `"חיפוש..."` | input placeholder |
| loading | `boolean` | false | shows spinner |
| emptyText | `string` | `"לא נמצאו תוצאות"` | — |
| disabled | `boolean` | false | — |
| clearable | `boolean` | false | show X button |

## שימוש בסיסי
```tsx
import { Combobox } from "@tottemai/ui"

const [value, setValue] = useState("")

<Combobox
  value={value}
  onValueChange={setValue}
  placeholder="בחר עיר"
  clearable
  options={cities}
/>
```

## קוד מלא
```tsx
"use client"
// src/forms/Combobox.tsx
import * as React from "react"
import { Command } from "cmdk"
import * as Popover from "@radix-ui/react-popover"
import { cn } from "../cn"

interface ComboboxOption { value: string; label: string }

interface ComboboxProps {
  value?: string
  onValueChange?: (value: string) => void
  options: ComboboxOption[]
  placeholder?: string
  searchPlaceholder?: string
  loading?: boolean
  emptyText?: string
  disabled?: boolean
  clearable?: boolean
  className?: string
}

function Combobox({
  value, onValueChange, options, placeholder = "בחר...",
  searchPlaceholder = "חיפוש...", loading, emptyText = "לא נמצאו תוצאות",
  disabled, clearable, className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const selected = options.find((o) => o.value === value)

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("combobox-trigger", className)}
        >
          <span className={cn(!selected && "combobox-placeholder")}>
            {selected ? selected.label : placeholder}
          </span>
          <div className="combobox-icons">
            {clearable && value && (
              <span
                role="button"
                tabIndex={0}
                aria-label="Clear"
                className="combobox-clear"
                onPointerDown={(e) => { e.stopPropagation(); onValueChange?.(""); }}
                onKeyDown={(e) => e.key === "Enter" && onValueChange?.("")}
              >✕</span>
            )}
            <span className="combobox-chevron">⌄</span>
          </div>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="combobox-content" sideOffset={4} align="start">
          <Command className="combobox-command">
            <Command.Input placeholder={searchPlaceholder} className="combobox-input" />
            <Command.List className="combobox-list">
              {loading ? (
                <div className="combobox-loading">טוען...</div>
              ) : (
                <>
                  <Command.Empty className="combobox-empty">{emptyText}</Command.Empty>
                  {options.map((opt) => (
                    <Command.Item
                      key={opt.value}
                      value={opt.value}
                      onSelect={() => { onValueChange?.(opt.value); setOpen(false); }}
                      className={cn("combobox-item", opt.value === value && "combobox-item--selected")}
                    >
                      {opt.label}
                      {opt.value === value && <span className="combobox-check">✓</span>}
                    </Command.Item>
                  ))}
                </>
              )}
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover.Portal>

      <style>{`
        .combobox-trigger {
          display: flex; align-items: center; justify-content: space-between;
          width: 100%; height: 40px; padding: 0 12px;
          border: 1px solid var(--color-border); border-radius: var(--radius-md, 8px);
          background: var(--color-surface); color: var(--color-text);
          font-size: 0.875rem; cursor: pointer;
          transition: border-color 0.15s;
        }
        .combobox-trigger:focus { outline: none; border-color: var(--color-primary); }
        .combobox-trigger[disabled] { opacity: 0.5; cursor: not-allowed; }
        .combobox-placeholder { color: var(--color-text-muted); }
        .combobox-icons { display: flex; align-items: center; gap: 4px; }
        .combobox-clear { color: var(--color-text-muted); cursor: pointer; font-size: 0.75rem; padding: 2px 4px; border-radius: 3px; }
        .combobox-clear:hover { color: var(--color-text); background: var(--color-surface-2); }
        .combobox-chevron { color: var(--color-text-muted); font-size: 0.75rem; }
        .combobox-content {
          background: var(--color-surface); border: 1px solid var(--color-border);
          border-radius: var(--radius-md, 8px); box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          width: var(--radix-popover-trigger-width); z-index: 50; overflow: hidden;
        }
        .combobox-command { display: flex; flex-direction: column; }
        .combobox-input {
          padding: 10px 12px; border: none; border-bottom: 1px solid var(--color-border);
          background: transparent; color: var(--color-text); font-size: 0.875rem; width: 100%;
          outline: none;
        }
        .combobox-list { max-height: 240px; overflow-y: auto; padding: 4px; }
        .combobox-item {
          padding: 8px 12px; border-radius: var(--radius-sm, 4px);
          font-size: 0.875rem; color: var(--color-text); cursor: pointer;
          display: flex; justify-content: space-between;
          transition: background 0.1s;
        }
        .combobox-item[data-selected="true"],
        .combobox-item:hover { background: var(--color-surface-2); }
        .combobox-item--selected { color: var(--color-primary); }
        .combobox-check { color: var(--color-primary); }
        .combobox-empty { padding: 12px; text-align: center; color: var(--color-text-muted); font-size: 0.875rem; }
        .combobox-loading { padding: 16px; text-align: center; color: var(--color-text-muted); font-size: 0.875rem; }
      `}</style>
    </Popover.Root>
  )
}

export { Combobox }
```

## בדיקות סיום
- [ ] מרנדר בלי שגיאות
- [ ] Fuzzy search פועל
- [ ] CSS variables בלבד
- [ ] Accessible (keyboard nav)
- [ ] RTL תמיכה
- [ ] מיוצא ב-src/index.ts
- [ ] Story ב-Storybook

← [[00 - Library Overview & Build Plan]]
