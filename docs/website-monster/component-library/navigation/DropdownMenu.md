# DropdownMenu

> **קטגוריה:** navigation
> **תלויות:** @radix-ui/react-dropdown-menu
> **Storybook:** src/stories/navigation/DropdownMenu.stories.tsx
> **קוד:** src/navigation/DropdownMenu.tsx
> **עלות בנייה:** ~25 דקות

## מה זה
Popup dropdown menu מבוסס Radix. תומך ב-checkboxes, radio groups, submenus, separators, keyboard shortcuts display. מתאים ל-"..." action menus, user account menus.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | פריטים פשוטים |
| With Icons | icon לכל פריט |
| With Shortcuts | keyboard shortcut display |
| Checkboxes | multi-select items |
| Radio group | single select items |
| Destructive item | "מחק" באדום |
| Submenus | nested menus |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| trigger | `ReactNode` | — | הelement שפותח את התפריט |
| items | `DropdownItem[]` | — | — |
| align | `'start' \| 'center' \| 'end'` | `'start'` | — |
| side | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | — |

```ts
type DropdownItem =
  | { type: 'item'; label: string; icon?: ReactNode; shortcut?: string; destructive?: boolean; disabled?: boolean; onClick?: () => void }
  | { type: 'separator' }
  | { type: 'label'; label: string }
```

## שימוש בסיסי
```tsx
import { DropdownMenu } from "@tottemai/ui"

<DropdownMenu
  trigger={<button>פעולות</button>}
  items={[
    { type: "item", label: "ערוך", shortcut: "⌘E", onClick: handleEdit },
    { type: "item", label: "שכפל", onClick: handleDuplicate },
    { type: "separator" },
    { type: "item", label: "מחק", destructive: true, onClick: handleDelete },
  ]}
/>
```

## קוד מלא
```tsx
"use client"
// src/navigation/DropdownMenu.tsx
import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { cn } from "../cn"

type DDItem =
  | { type: "item"; label: string; icon?: React.ReactNode; shortcut?: string; destructive?: boolean; disabled?: boolean; onClick?: () => void }
  | { type: "separator" }
  | { type: "label"; label: string }

interface DropdownMenuProps {
  trigger: React.ReactNode
  items: DDItem[]
  align?: "start" | "center" | "end"
  side?: "top" | "bottom" | "left" | "right"
  className?: string
}

function DropdownMenu({ trigger, items, align = "start", side = "bottom", className }: DropdownMenuProps) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>{trigger}</DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          side={side}
          sideOffset={6}
          className={cn("ddmenu-content", className)}
        >
          {items.map((item, i) => {
            if (item.type === "separator") return <DropdownMenuPrimitive.Separator key={i} className="ddmenu-separator" />
            if (item.type === "label") return <DropdownMenuPrimitive.Label key={i} className="ddmenu-label">{item.label}</DropdownMenuPrimitive.Label>
            return (
              <DropdownMenuPrimitive.Item
                key={i}
                disabled={item.disabled}
                onSelect={item.onClick}
                className={cn("ddmenu-item", item.destructive && "ddmenu-item--destructive")}
              >
                {item.icon && <span className="ddmenu-icon">{item.icon}</span>}
                <span className="ddmenu-item-label">{item.label}</span>
                {item.shortcut && <span className="ddmenu-shortcut">{item.shortcut}</span>}
              </DropdownMenuPrimitive.Item>
            )
          })}

          <style>{`
            .ddmenu-content {
              background: var(--color-surface); border: 1px solid var(--color-border);
              border-radius: var(--radius-md, 8px); box-shadow: 0 8px 24px rgba(0,0,0,0.15);
              padding: 4px; min-width: 180px; z-index: 50;
              animation: ddmenu-in 0.12s ease;
            }
            @keyframes ddmenu-in { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
            .ddmenu-item {
              display: flex; align-items: center; gap: 8px; padding: 7px 12px;
              border-radius: var(--radius-sm, 4px); font-size: 0.875rem; color: var(--color-text);
              cursor: pointer; outline: none; transition: background 0.1s;
            }
            .ddmenu-item[data-highlighted] { background: var(--color-surface-2); }
            .ddmenu-item[data-disabled] { opacity: 0.5; cursor: not-allowed; }
            .ddmenu-item--destructive { color: var(--color-error, #ef4444); }
            .ddmenu-icon { width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); flex-shrink: 0; }
            .ddmenu-item-label { flex: 1; }
            .ddmenu-shortcut { font-size: 0.75rem; color: var(--color-text-muted); margin-inline-start: auto; }
            .ddmenu-separator { height: 1px; background: var(--color-border); margin: 4px 0; }
            .ddmenu-label { padding: 4px 12px; font-size: 0.75rem; color: var(--color-text-muted); font-weight: 600; }
          `}</style>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}

export { DropdownMenu }
```

## בדיקות סיום
- [ ] Keyboard navigation פועל
- [ ] Destructive items אדומים
- [ ] CSS variables בלבד
- [ ] RTL תמיכה
- [ ] מיוצא ב-src/index.ts
- [ ] Story ב-Storybook

← [[00 - Library Overview & Build Plan]]
