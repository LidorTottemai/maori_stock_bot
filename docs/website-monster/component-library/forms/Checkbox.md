# Checkbox

> **קטגוריה:** forms
> **תלויות:** @radix-ui/react-checkbox, class-variance-authority
> **Storybook:** src/stories/forms/Checkbox.stories.tsx
> **קוד:** src/forms/Checkbox.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
Checkbox עם תמיכה ב-checked, indeterminate ו-disabled. מבוסס Radix לנגישות מלאה. כולל label מובנה ותמיכה ב-RTL.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | unchecked |
| Checked | מסומן |
| Indeterminate | מצב ביניים (partial selection) |
| Disabled | לא ניתן לשינוי |
| With Label | checkbox + label לחיץ |
| With Error | label אדום + שגיאה |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| checked | `boolean \| 'indeterminate'` | — | controlled state |
| defaultChecked | `boolean` | false | uncontrolled initial |
| onCheckedChange | `(checked: boolean \| 'indeterminate') => void` | — | change handler |
| disabled | `boolean` | false | — |
| id | `string` | — | connects to label |
| label | `string` | — | inline label text |
| error | `string` | — | error message below |
| className | `string` | — | — |

## שימוש בסיסי
```tsx
import { Checkbox } from "@tottemai/ui"

<Checkbox id="terms" label="אני מסכים לתנאי השימוש" />
<Checkbox checked="indeterminate" onCheckedChange={(v) => console.log(v)} />
```

## קוד מלא
```tsx
"use client"
// src/forms/Checkbox.tsx
import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { cn } from "../cn"

interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string
  error?: string
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, label, error, id, ...props }, ref) => {
  const checkboxId = id || React.useId()

  return (
    <div className={cn("checkbox-wrapper", className)}>
      <div className="checkbox-row">
        <CheckboxPrimitive.Root
          ref={ref}
          id={checkboxId}
          className="checkbox-root"
          {...props}
        >
          <CheckboxPrimitive.Indicator className="checkbox-indicator">
            {props.checked === "indeterminate" ? (
              <svg width="10" height="2" viewBox="0 0 10 2" fill="none">
                <rect width="10" height="2" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        {label && (
          <label htmlFor={checkboxId} className="checkbox-label">
            {label}
          </label>
        )}
      </div>
      {error && <p className="checkbox-error">{error}</p>}

      <style>{`
        .checkbox-wrapper { display: flex; flex-direction: column; gap: 4px; }
        .checkbox-row { display: flex; align-items: center; gap: 8px; }
        .checkbox-root {
          width: 18px; height: 18px; border-radius: var(--radius-sm, 4px);
          border: 1.5px solid var(--color-border);
          background: var(--color-bg);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: border-color 0.15s, background 0.15s;
          flex-shrink: 0;
        }
        .checkbox-root[data-state="checked"],
        .checkbox-root[data-state="indeterminate"] {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: white;
        }
        .checkbox-root:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
        .checkbox-root[data-disabled] { opacity: 0.5; cursor: not-allowed; }
        .checkbox-indicator { display: flex; align-items: center; justify-content: center; }
        .checkbox-label { font-size: 0.875rem; color: var(--color-text); cursor: pointer; line-height: 1.4; }
        .checkbox-error { font-size: 0.75rem; color: var(--color-error, #ef4444); }
      `}</style>
    </div>
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
```

## בדיקות סיום
- [ ] מרנדר בלי שגיאות
- [ ] כל ה-variants פועלים
- [ ] CSS variables בלבד (אין hexcodes קשיחים)
- [ ] Accessible (aria-*, keyboard nav)
- [ ] RTL תמיכה
- [ ] prefers-reduced-motion
- [ ] מיוצא ב-src/index.ts
- [ ] Story ב-Storybook

← [[00 - Library Overview & Build Plan]]
