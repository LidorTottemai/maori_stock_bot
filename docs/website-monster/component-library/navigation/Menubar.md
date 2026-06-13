# Menubar

> **קטגוריה:** navigation
> **תלויות:** @radix-ui/react-menubar
> **Storybook:** src/stories/navigation/Menubar.stories.tsx
> **קוד:** src/navigation/Menubar.tsx
> **עלות בנייה:** ~25 דקות

## מה זה
Application-style menubar — File, Edit, View... כמו macOS / VS Code. מבוסס Radix Menubar. תומך ב-keyboard navigation, shortcuts, submenus, checkboxes.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | File / Edit / View |
| With shortcuts | ⌘S, ⌘Z |
| With checkboxes | toggle states |
| With submenus | nested menus |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| menus | `MenubarMenu[]` | — | — |

```ts
interface MenubarMenu {
  label: string
  items: MenubarItem[]
}
type MenubarItem =
  | { type: 'item'; label: string; shortcut?: string; onClick?: () => void }
  | { type: 'separator' }
  | { type: 'checkbox'; label: string; checked: boolean; onCheckedChange: (c: boolean) => void }
```

## שימוש בסיסי
```tsx
import { Menubar } from "@tottemai/ui"

<Menubar menus={[
  { label: "קובץ", items: [
    { type: "item", label: "חדש", shortcut: "⌘N", onClick: handleNew },
    { type: "item", label: "שמור", shortcut: "⌘S", onClick: handleSave },
    { type: "separator" },
    { type: "item", label: "סגור", onClick: handleClose },
  ]},
  { label: "עריכה", items: [
    { type: "item", label: "בטל", shortcut: "⌘Z", onClick: handleUndo },
    { type: "item", label: "חזור", shortcut: "⌘⇧Z", onClick: handleRedo },
  ]},
]} />
```

## קוד מלא
```tsx
"use client"
// src/navigation/Menubar.tsx
import * as React from "react"
import * as MenubarPrimitive from "@radix-ui/react-menubar"
import { cn } from "../cn"

type MenubarItem =
  | { type: "item"; label: string; shortcut?: string; disabled?: boolean; onClick?: () => void }
  | { type: "separator" }
  | { type: "checkbox"; label: string; checked: boolean; onCheckedChange: (c: boolean) => void }

interface MenubarMenu { label: string; items: MenubarItem[] }

function Menubar({ menus, className }: { menus: MenubarMenu[]; className?: string }) {
  return (
    <MenubarPrimitive.Root className={cn("mbar-root", className)}>
      {menus.map((menu) => (
        <MenubarPrimitive.Menu key={menu.label}>
          <MenubarPrimitive.Trigger className="mbar-trigger">{menu.label}</MenubarPrimitive.Trigger>
          <MenubarPrimitive.Portal>
            <MenubarPrimitive.Content className="mbar-content" align="start" sideOffset={4}>
              {menu.items.map((item, i) => {
                if (item.type === "separator") return <MenubarPrimitive.Separator key={i} className="mbar-separator" />
                if (item.type === "checkbox") return (
                  <MenubarPrimitive.CheckboxItem key={i} checked={item.checked} onCheckedChange={item.onCheckedChange} className="mbar-item">
                    <MenubarPrimitive.ItemIndicator className="mbar-check">✓</MenubarPrimitive.ItemIndicator>
                    {item.label}
                  </MenubarPrimitive.CheckboxItem>
                )
                return (
                  <MenubarPrimitive.Item key={i} disabled={item.disabled} onSelect={item.onClick} className="mbar-item">
                    <span className="mbar-item-label">{item.label}</span>
                    {item.shortcut && <span className="mbar-shortcut">{item.shortcut}</span>}
                  </MenubarPrimitive.Item>
                )
              })}
            </MenubarPrimitive.Content>
          </MenubarPrimitive.Portal>
        </MenubarPrimitive.Menu>
      ))}

      <style>{`
        .mbar-root { display: flex; align-items: center; background: var(--color-surface); border-bottom: 1px solid var(--color-border); padding: 0 8px; }
        .mbar-trigger {
          padding: 6px 10px; border-radius: var(--radius-sm, 4px); font-size: 0.8125rem;
          color: var(--color-text); background: transparent; border: none; cursor: pointer;
          transition: background 0.1s;
        }
        .mbar-trigger:hover, .mbar-trigger[data-state="open"] { background: var(--color-surface-2); }
        .mbar-content {
          background: var(--color-surface); border: 1px solid var(--color-border);
          border-radius: var(--radius-md, 8px); box-shadow: 0 8px 20px rgba(0,0,0,0.12);
          padding: 4px; min-width: 200px; z-index: 50;
        }
        .mbar-item {
          display: flex; align-items: center; gap: 8px; padding: 7px 12px;
          border-radius: var(--radius-sm, 4px); font-size: 0.8125rem; color: var(--color-text);
          cursor: pointer; outline: none;
        }
        .mbar-item[data-highlighted] { background: var(--color-surface-2); }
        .mbar-item[data-disabled] { opacity: 0.5; cursor: not-allowed; }
        .mbar-item-label { flex: 1; }
        .mbar-shortcut { font-size: 0.6875rem; color: var(--color-text-muted); }
        .mbar-check { width: 16px; color: var(--color-primary); }
        .mbar-separator { height: 1px; background: var(--color-border); margin: 4px 0; }
      `}</style>
    </MenubarPrimitive.Root>
  )
}

export { Menubar }
```

## בדיקות סיום
- [ ] Keyboard navigation (← → ↓ Enter Esc)
- [ ] Checkboxes שומרים state
- [ ] CSS variables בלבד
- [ ] מיוצא ב-src/index.ts
- [ ] Story ב-Storybook

← [[00 - Library Overview & Build Plan]]
