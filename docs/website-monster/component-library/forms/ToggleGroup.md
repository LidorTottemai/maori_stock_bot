# ToggleGroup

> **קטגוריה:** forms
> **תלויות:** @radix-ui/react-toggle-group
> **Storybook:** src/stories/forms/ToggleGroup.stories.tsx
> **קוד:** src/forms/ToggleGroup.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
קבוצת כפתורי toggle. type="single" לבחירה אחת (כמו radio), type="multiple" לבחירה מרובה. שימושי ל-text formatting toolbar, filter chips, view switcher.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Single | בחירה אחת בלבד |
| Multiple | בחירה מרובה |
| With Icons | icons בלבד |
| Outlined | variant outlined |
| Pill | border-radius מלא |
| Disabled | — |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | `'single' \| 'multiple'` | `'single'` | — |
| value | `string \| string[]` | — | controlled |
| onValueChange | `(value) => void` | — | — |
| items | `{ value: string; label: string; icon?: ReactNode }[]` | — | — |
| variant | `'default' \| 'outline' \| 'pill'` | `'default'` | — |
| disabled | `boolean` | false | — |

## שימוש בסיסי
```tsx
import { ToggleGroup } from "@tottemai/ui"

<ToggleGroup
  type="single"
  defaultValue="list"
  items={[
    { value: "list", label: "רשימה" },
    { value: "grid", label: "גריד" },
  ]}
/>
```

## קוד מלא
```tsx
"use client"
// src/forms/ToggleGroup.tsx
import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { cn } from "../cn"

interface ToggleItem { value: string; label: string; icon?: React.ReactNode }

type ToggleGroupProps = {
  items: ToggleItem[]
  variant?: "default" | "outline" | "pill"
  className?: string
} & (
  | { type: "single"; value?: string; defaultValue?: string; onValueChange?: (value: string) => void; disabled?: boolean }
  | { type: "multiple"; value?: string[]; defaultValue?: string[]; onValueChange?: (value: string[]) => void; disabled?: boolean }
)

function ToggleGroup({ items, variant = "default", className, type, ...props }: ToggleGroupProps) {
  return (
    <ToggleGroupPrimitive.Root
      type={type as "single"}
      className={cn("tg-root", `tg-${variant}`, className)}
      {...(props as Record<string, unknown>)}
    >
      {items.map((item) => (
        <ToggleGroupPrimitive.Item key={item.value} value={item.value} className="tg-item">
          {item.icon && <span className="tg-icon">{item.icon}</span>}
          {item.label}
        </ToggleGroupPrimitive.Item>
      ))}

      <style>{`
        .tg-root { display: inline-flex; border-radius: var(--radius-md, 8px); overflow: hidden; border: 1px solid var(--color-border); }
        .tg-item {
          padding: 0 14px; height: 36px; font-size: 0.875rem; color: var(--color-text-muted);
          background: transparent; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px;
          transition: background 0.15s, color 0.15s;
        }
        .tg-item:not(:last-child) { border-inline-end: 1px solid var(--color-border); }
        .tg-item:hover { background: var(--color-surface-2); color: var(--color-text); }
        .tg-item[data-state="on"] { background: var(--color-primary); color: white; }
        .tg-icon { display: flex; align-items: center; }
        .tg-pill { border-radius: 9999px; }
        .tg-pill .tg-item:first-child { border-radius: 9999px 0 0 9999px; }
        .tg-pill .tg-item:last-child { border-radius: 0 9999px 9999px 0; }
        .tg-outline .tg-item[data-state="on"] { background: transparent; color: var(--color-primary); }
      `}</style>
    </ToggleGroupPrimitive.Root>
  )
}

export { ToggleGroup }
```

## בדיקות סיום
- [ ] Single + Multiple פועלים
- [ ] CSS variables בלבד
- [ ] Accessible
- [ ] RTL תמיכה
- [ ] מיוצא ב-src/index.ts
- [ ] Story ב-Storybook

← [[00 - Library Overview & Build Plan]]
