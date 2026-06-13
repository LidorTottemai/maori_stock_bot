# RadioGroup

> **קטגוריה:** forms
> **תלויות:** @radix-ui/react-radio-group
> **Storybook:** src/stories/forms/RadioGroup.stories.tsx
> **קוד:** src/forms/RadioGroup.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
קבוצת radio buttons מבוססת Radix. תומך בפריסה אנכית/אופקית, disabled per-item, ו-RTL.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Vertical | פריסה אנכית (default) |
| Horizontal | פריסה אופקית |
| With Descriptions | כל אפשרות עם כיתוב נוסף |
| Disabled | כל הgroup disabled |
| Disabled item | פריט בודד disabled |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `string` | — | controlled value |
| defaultValue | `string` | — | uncontrolled initial |
| onValueChange | `(value: string) => void` | — | — |
| orientation | `'vertical' \| 'horizontal'` | `'vertical'` | — |
| disabled | `boolean` | false | disables entire group |
| items | `{ value: string; label: string; description?: string; disabled?: boolean }[]` | — | options |

## שימוש בסיסי
```tsx
import { RadioGroup } from "@tottemai/ui"

<RadioGroup
  defaultValue="option1"
  items={[
    { value: "option1", label: "אפשרות 1" },
    { value: "option2", label: "אפשרות 2" },
    { value: "option3", label: "אפשרות 3", disabled: true },
  ]}
  onValueChange={(v) => console.log(v)}
/>
```

## קוד מלא
```tsx
"use client"
// src/forms/RadioGroup.tsx
import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { cn } from "../cn"

interface RadioItem {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

interface RadioGroupProps extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>, "children"> {
  items: RadioItem[]
  orientation?: "vertical" | "horizontal"
}

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, items, orientation = "vertical", ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    className={cn("radio-group", orientation === "horizontal" && "radio-group--horizontal", className)}
    {...props}
  >
    {items.map((item) => (
      <div key={item.value} className={cn("radio-item", item.disabled && "radio-item--disabled")}>
        <RadioGroupPrimitive.Item
          value={item.value}
          id={`radio-${item.value}`}
          disabled={item.disabled}
          className="radio-button"
        >
          <RadioGroupPrimitive.Indicator className="radio-indicator" />
        </RadioGroupPrimitive.Item>
        <div className="radio-content">
          <label htmlFor={`radio-${item.value}`} className="radio-label">{item.label}</label>
          {item.description && <p className="radio-description">{item.description}</p>}
        </div>
      </div>
    ))}

    <style>{`
      .radio-group { display: flex; flex-direction: column; gap: 12px; }
      .radio-group--horizontal { flex-direction: row; flex-wrap: wrap; gap: 16px; }
      .radio-item { display: flex; align-items: flex-start; gap: 10px; }
      .radio-item--disabled { opacity: 0.5; }
      .radio-button {
        width: 18px; height: 18px; border-radius: 50%;
        border: 1.5px solid var(--color-border);
        background: var(--color-bg);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; flex-shrink: 0; margin-top: 2px;
        transition: border-color 0.15s;
      }
      .radio-button[data-state="checked"] { border-color: var(--color-primary); }
      .radio-button:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
      .radio-button[data-disabled] { cursor: not-allowed; }
      .radio-indicator {
        width: 8px; height: 8px; border-radius: 50%;
        background: var(--color-primary);
        display: block;
      }
      .radio-content { display: flex; flex-direction: column; gap: 2px; }
      .radio-label { font-size: 0.875rem; color: var(--color-text); cursor: pointer; line-height: 1.4; }
      .radio-description { font-size: 0.75rem; color: var(--color-text-muted); }
    `}</style>
  </RadioGroupPrimitive.Root>
))
RadioGroup.displayName = "RadioGroup"

export { RadioGroup }
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
