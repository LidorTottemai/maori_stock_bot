# Menu

> **קטגוריה:** navigation
> **תלויות:** none (pure React + CSS)
> **Storybook:** src/stories/navigation/Menu.stories.tsx
> **קוד:** src/navigation/Menu.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
רשימת ניווט אנכית פשוטה עם active state. שימושי לsidebar navigation, settings menu. לא popup — component קבוע בדף.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | רשימה אנכית |
| With Icons | icon + label |
| With Badge | badge counts |
| Grouped | קבוצות עם headers |
| Compact | גרסה צפופה |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| items | `MenuItem[]` | — | — |
| activeValue | `string` | — | — |
| onSelect | `(value: string) => void` | — | — |
| variant | `'default' \| 'compact'` | `'default'` | — |

```ts
interface MenuItem {
  value: string; label: string; icon?: ReactNode
  badge?: number; disabled?: boolean; href?: string
  group?: string
}
```

## שימוש בסיסי
```tsx
import { Menu } from "@tottemai/ui"

<Menu
  activeValue="dashboard"
  onSelect={(v) => router.push(`/${v}`)}
  items={[
    { value: "dashboard", label: "לוח בקרה", icon: <HomeIcon /> },
    { value: "orders", label: "הזמנות", badge: 5 },
    { value: "settings", label: "הגדרות" },
  ]}
/>
```

## קוד מלא
```tsx
// src/navigation/Menu.tsx
import * as React from "react"
import { cn } from "../cn"

interface MenuItem {
  value: string; label: string; icon?: React.ReactNode
  badge?: number; disabled?: boolean; href?: string; group?: string
}

interface MenuProps {
  items: MenuItem[]
  activeValue?: string
  onSelect?: (value: string) => void
  variant?: "default" | "compact"
  className?: string
}

function Menu({ items, activeValue, onSelect, variant = "default", className }: MenuProps) {
  const groups = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const key = item.group ?? "__default__"
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  const renderItem = (item: MenuItem) => {
    const Tag = item.href ? "a" : "button"
    return (
      <Tag
        key={item.value}
        href={item.href}
        disabled={item.disabled}
        className={cn("menu-item", activeValue === item.value && "menu-item--active", item.disabled && "menu-item--disabled", `menu-item--${variant}`)}
        onClick={() => !item.disabled && onSelect?.(item.value)}
      >
        {item.icon && <span className="menu-item-icon">{item.icon}</span>}
        <span className="menu-item-label">{item.label}</span>
        {item.badge !== undefined && <span className="menu-item-badge">{item.badge}</span>}
      </Tag>
    )
  }

  return (
    <nav className={cn("menu", className)}>
      {Object.entries(groups).map(([group, groupItems]) => (
        <div key={group} className="menu-group">
          {group !== "__default__" && <p className="menu-group-label">{group}</p>}
          {groupItems.map(renderItem)}
        </div>
      ))}

      <style>{`
        .menu { display: flex; flex-direction: column; gap: 4px; }
        .menu-group { display: flex; flex-direction: column; gap: 2px; }
        .menu-group-label { font-size: 0.6875rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.07em; padding: 8px 12px 4px; }
        .menu-item {
          display: flex; align-items: center; gap: 10px; padding: 8px 12px; width: 100%;
          border-radius: var(--radius-md, 8px); font-size: 0.875rem; color: var(--color-text-muted);
          background: transparent; border: none; cursor: pointer; text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .menu-item--compact { padding: 6px 10px; }
        .menu-item:hover { background: var(--color-surface-2); color: var(--color-text); }
        .menu-item--active { background: color-mix(in srgb, var(--color-primary) 12%, transparent); color: var(--color-primary); font-weight: 500; }
        .menu-item--disabled { opacity: 0.5; cursor: not-allowed; }
        .menu-item-icon { width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .menu-item-label { flex: 1; text-align: start; }
        .menu-item-badge {
          font-size: 0.6875rem; font-weight: 600; background: var(--color-primary); color: white;
          border-radius: 9999px; padding: 1px 6px; min-width: 18px; text-align: center;
        }
      `}</style>
    </nav>
  )
}

export { Menu }
```

## בדיקות סיום
- [ ] Active state נכון
- [ ] Groups מוצגים עם headers
- [ ] CSS variables בלבד
- [ ] RTL תמיכה (text-align: start)
- [ ] מיוצא ב-src/index.ts
- [ ] Story ב-Storybook

← [[00 - Library Overview & Build Plan]]
