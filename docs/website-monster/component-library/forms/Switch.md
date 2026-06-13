# Switch

> **קטגוריה:** forms
> **תלויות:** @radix-ui/react-switch
> **Storybook:** src/stories/forms/Switch.stories.tsx
> **קוד:** src/forms/Switch.tsx
> **עלות בנייה:** ~15 דקות

## מה זה
Toggle switch מבוסס Radix. מחליף checkbox לbinary settings. תומך בgדלים שונים, label משמאל/ימין, ו-RTL.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | off state |
| Checked | on state |
| Small | גודל קטן |
| Large | גודל גדול |
| Label Left | label משמאל |
| Label Right | label מימין |
| Disabled | — |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| checked | `boolean` | — | controlled |
| defaultChecked | `boolean` | false | — |
| onCheckedChange | `(checked: boolean) => void` | — | — |
| disabled | `boolean` | false | — |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | — |
| label | `string` | — | — |
| labelPosition | `'left' \| 'right'` | `'right'` | — |

## שימוש בסיסי
```tsx
import { Switch } from "@tottemai/ui"

<Switch label="הפעל התראות" defaultChecked onCheckedChange={(v) => console.log(v)} />
```

## קוד מלא
```tsx
"use client"
// src/forms/Switch.tsx
import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cn } from "../cn"

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  size?: "sm" | "md" | "lg"
  label?: string
  labelPosition?: "left" | "right"
}

const sizeStyles = {
  sm: { root: "w-8 h-4",  thumb: "w-3 h-3 data-[state=checked]:translate-x-4" },
  md: { root: "w-11 h-6", thumb: "w-5 h-5 data-[state=checked]:translate-x-5" },
  lg: { root: "w-14 h-7", thumb: "w-6 h-6 data-[state=checked]:translate-x-7" },
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, size = "md", label, labelPosition = "right", id, ...props }, ref) => {
  const switchId = id || React.useId()
  const s = sizeStyles[size]

  const switchEl = (
    <SwitchPrimitive.Root
      ref={ref}
      id={switchId}
      className={cn("switch-root", s.root, className)}
      {...props}
    >
      <SwitchPrimitive.Thumb className={cn("switch-thumb", s.thumb)} />
    </SwitchPrimitive.Root>
  )

  if (!label) return switchEl

  return (
    <div className="switch-wrapper">
      {labelPosition === "left" && <label htmlFor={switchId} className="switch-label">{label}</label>}
      {switchEl}
      {labelPosition === "right" && <label htmlFor={switchId} className="switch-label">{label}</label>}

      <style>{`
        .switch-wrapper { display: flex; align-items: center; gap: 10px; }
        .switch-root {
          position: relative; display: inline-flex; align-items: center;
          border-radius: 9999px; background: var(--color-surface-2);
          border: 1px solid var(--color-border); cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }
        .switch-root[data-state="checked"] { background: var(--color-primary); border-color: var(--color-primary); }
        .switch-root:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
        .switch-root[data-disabled] { opacity: 0.5; cursor: not-allowed; }
        .switch-thumb {
          display: block; border-radius: 9999px;
          background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          transition: transform 0.2s; transform: translateX(1px);
        }
        .w-8 { width: 32px; } .h-4 { height: 16px; }
        .w-11 { width: 44px; } .h-6 { height: 24px; }
        .w-14 { width: 56px; } .h-7 { height: 28px; }
        .w-3 { width: 12px; } .h-3 { height: 12px; }
        .w-5 { width: 20px; } .h-5 { height: 20px; }
        .w-6 { width: 24px; } .h-6 { height: 24px; }
        .switch-label { font-size: 0.875rem; color: var(--color-text); cursor: pointer; user-select: none; }
      `}</style>
    </div>
  )
})
Switch.displayName = "Switch"

export { Switch }
```

## בדיקות סיום
- [ ] מרנדר בלי שגיאות
- [ ] כל ה-variants פועלים
- [ ] CSS variables בלבד
- [ ] Accessible
- [ ] RTL תמיכה
- [ ] מיוצא ב-src/index.ts
- [ ] Story ב-Storybook

← [[00 - Library Overview & Build Plan]]
