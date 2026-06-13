# Select

> **קטגוריה:** forms
> **תלויות:** @radix-ui/react-select
> **Storybook:** src/stories/forms/Select.stories.tsx
> **קוד:** src/forms/Select.tsx
> **עלות בנייה:** ~25 דקות

## מה זה
Dropdown select מבוסס Radix. תומך בgrouped options, searchable, disabled items, placeholder, ו-RTL. מחליף את ה-native `<select>` עם עיצוב מלא.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | select רגיל |
| With Groups | אפשרויות מקובצות |
| With Search | חיפוש בתוך האפשרויות |
| Error State | border אדום + error message |
| Disabled | כל ה-select disabled |
| Small / Large | גדלים שונים |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `string` | — | controlled value |
| defaultValue | `string` | — | — |
| onValueChange | `(value: string) => void` | — | — |
| placeholder | `string` | `"בחר..."` | — |
| options | `SelectOption[]` | — | flat list |
| groups | `SelectGroup[]` | — | grouped list |
| disabled | `boolean` | false | — |
| error | `string` | — | — |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | — |

## שימוש בסיסי
```tsx
import { Select } from "@tottemai/ui"

<Select
  placeholder="בחר עיר"
  options={[
    { value: "tlv", label: "תל אביב" },
    { value: "jlm", label: "ירושלים" },
    { value: "hfa", label: "חיפה" },
  ]}
  onValueChange={(v) => console.log(v)}
/>
```

## קוד מלא
```tsx
"use client"
// src/forms/Select.tsx
import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { cn } from "../cn"

export interface SelectOption { value: string; label: string; disabled?: boolean }
export interface SelectGroup { label: string; options: SelectOption[] }

interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  options?: SelectOption[]
  groups?: SelectGroup[]
  disabled?: boolean
  error?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeMap = { sm: "select-sm", md: "select-md", lg: "select-lg" }

function Select({ value, defaultValue, onValueChange, placeholder = "בחר...", options, groups, disabled, error, size = "md", className }: SelectProps) {
  return (
    <div className={cn("select-wrapper", className)}>
      <SelectPrimitive.Root value={value} defaultValue={defaultValue} onValueChange={onValueChange} disabled={disabled}>
        <SelectPrimitive.Trigger className={cn("select-trigger", sizeMap[size], error && "select-trigger--error")}>
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon className="select-icon">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content className="select-content" position="popper" sideOffset={4}>
            <SelectPrimitive.Viewport className="select-viewport">
              {groups
                ? groups.map((group) => (
                    <SelectPrimitive.Group key={group.label}>
                      <SelectPrimitive.Label className="select-group-label">{group.label}</SelectPrimitive.Label>
                      {group.options.map((opt) => (
                        <SelectPrimitive.Item key={opt.value} value={opt.value} disabled={opt.disabled} className="select-item">
                          <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                          <SelectPrimitive.ItemIndicator className="select-item-check">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </SelectPrimitive.ItemIndicator>
                        </SelectPrimitive.Item>
                      ))}
                      <SelectPrimitive.Separator className="select-separator" />
                    </SelectPrimitive.Group>
                  ))
                : options?.map((opt) => (
                    <SelectPrimitive.Item key={opt.value} value={opt.value} disabled={opt.disabled} className="select-item">
                      <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                      <SelectPrimitive.ItemIndicator className="select-item-check">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </SelectPrimitive.ItemIndicator>
                    </SelectPrimitive.Item>
                  ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {error && <p className="select-error">{error}</p>}

      <style>{`
        .select-wrapper { display: flex; flex-direction: column; gap: 4px; }
        .select-trigger {
          display: flex; align-items: center; justify-content: space-between;
          width: 100%; border: 1px solid var(--color-border);
          border-radius: var(--radius-md, 8px); background: var(--color-surface);
          color: var(--color-text); cursor: pointer;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .select-sm { height: 32px; padding: 0 10px; font-size: 0.8125rem; }
        .select-md { height: 40px; padding: 0 12px; font-size: 0.875rem; }
        .select-lg { height: 48px; padding: 0 16px; font-size: 1rem; }
        .select-trigger:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent); }
        .select-trigger--error { border-color: var(--color-error, #ef4444); }
        .select-trigger[data-disabled] { opacity: 0.5; cursor: not-allowed; }
        .select-icon { color: var(--color-text-muted); }
        .select-content {
          background: var(--color-surface); border: 1px solid var(--color-border);
          border-radius: var(--radius-md, 8px); box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          overflow: hidden; z-index: 50; min-width: var(--radix-select-trigger-width);
          max-height: 300px;
        }
        .select-viewport { padding: 4px; }
        .select-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 12px; border-radius: var(--radius-sm, 4px);
          font-size: 0.875rem; color: var(--color-text); cursor: pointer;
          outline: none; transition: background 0.1s;
        }
        .select-item[data-highlighted] { background: var(--color-surface-2); }
        .select-item[data-disabled] { opacity: 0.5; cursor: not-allowed; }
        .select-item-check { color: var(--color-primary); }
        .select-group-label { padding: 6px 12px 4px; font-size: 0.75rem; color: var(--color-text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .select-separator { height: 1px; background: var(--color-border); margin: 4px 0; }
        .select-error { font-size: 0.75rem; color: var(--color-error, #ef4444); }
      `}</style>
    </div>
  )
}

export { Select }
```

## בדיקות סיום
- [ ] מרנדר בלי שגיאות
- [ ] כל ה-variants פועלים
- [ ] CSS variables בלבד
- [ ] Accessible (keyboard nav, aria)
- [ ] RTL תמיכה
- [ ] מיוצא ב-src/index.ts
- [ ] Story ב-Storybook

← [[00 - Library Overview & Build Plan]]
