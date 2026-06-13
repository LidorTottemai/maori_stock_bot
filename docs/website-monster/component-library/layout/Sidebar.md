# Sidebar

> **קטגוריה:** layout
> **תלויות:** framer-motion (motion/react)
> **Storybook:** src/stories/layout/Sidebar.stories.tsx
> **קוד:** src/layout/Sidebar.tsx
> **עלות בנייה:** ~35 דקות

## מה זה
Side navigation לapp layouts / dashboards. ניתן לצמצום (collapsed → icon only). תומך ב-active state, groups, nested items, mobile overlay mode.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Expanded | עם labels |
| Collapsed | icons בלבד |
| With toggle | כפתור collapse |
| Mobile overlay | drawer על mobile |
| Dark | dark sidebar |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| items | `SidebarItem[]` | — | — |
| collapsed | `boolean` | false | icon-only mode |
| onToggle | `() => void` | — | — |
| activeValue | `string` | — | — |
| onSelect | `(value: string) => void` | — | — |
| logo | `ReactNode` | — | — |

## שימוש בסיסי
```tsx
import { Sidebar } from "@tottemai/ui"

const [collapsed, setCollapsed] = useState(false)

<Sidebar
  collapsed={collapsed}
  onToggle={() => setCollapsed(c => !c)}
  activeValue={currentPage}
  onSelect={(v) => router.push(`/${v}`)}
  items={[
    { value: "dashboard", label: "לוח בקרה", icon: <HomeIcon /> },
    { value: "orders", label: "הזמנות", icon: <OrdersIcon />, badge: 3 },
    { type: "separator" },
    { value: "settings", label: "הגדרות", icon: <SettingsIcon /> },
  ]}
/>
```

## קוד מלא
```tsx
"use client"
// src/layout/Sidebar.tsx
import * as React from "react"
import { motion } from "motion/react"
import { cn } from "../cn"

type SidebarItem =
  | { type?: "item"; value: string; label: string; icon?: React.ReactNode; badge?: number; disabled?: boolean }
  | { type: "separator" }
  | { type: "group"; label: string }

interface SidebarProps {
  items: SidebarItem[]
  collapsed?: boolean
  onToggle?: () => void
  activeValue?: string
  onSelect?: (value: string) => void
  logo?: React.ReactNode
  className?: string
}

function Sidebar({ items, collapsed = false, onToggle, activeValue, onSelect, logo, className }: SidebarProps) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 60 : 240 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn("sidebar", className)}
    >
      {/* Header */}
      <div className="sidebar-header">
        {!collapsed && logo && <div className="sidebar-logo">{logo}</div>}
        {onToggle && (
          <button onClick={onToggle} className="sidebar-toggle" aria-label={collapsed ? "הרחב sidebar" : "צמצם sidebar"}>
            <motion.svg width="16" height="16" viewBox="0 0 16 16" fill="none" animate={{ rotate: collapsed ? 180 : 0 }}>
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </button>
        )}
      </div>

      {/* Items */}
      <nav className="sidebar-nav">
        {items.map((item, i) => {
          if (item.type === "separator") return <div key={i} className="sidebar-separator" />
          if (item.type === "group") return !collapsed ? <p key={i} className="sidebar-group-label">{item.label}</p> : null
          const isActive = activeValue === item.value
          return (
            <button
              key={item.value}
              disabled={item.disabled}
              onClick={() => onSelect?.(item.value)}
              className={cn("sidebar-item", isActive && "sidebar-item--active", collapsed && "sidebar-item--collapsed")}
              title={collapsed ? item.label : undefined}
            >
              {item.icon && <span className="sidebar-item-icon">{item.icon}</span>}
              {!collapsed && <span className="sidebar-item-label">{item.label}</span>}
              {!collapsed && item.badge !== undefined && <span className="sidebar-badge">{item.badge}</span>}
            </button>
          )
        })}
      </nav>

      <style>{`
        .sidebar {
          display: flex; flex-direction: column; height: 100%;
          background: var(--color-surface); border-inline-end: 1px solid var(--color-border);
          overflow: hidden; flex-shrink: 0;
        }
        .sidebar-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 12px; height: 60px; border-bottom: 1px solid var(--color-border); }
        .sidebar-logo { overflow: hidden; white-space: nowrap; }
        .sidebar-toggle { background: transparent; border: none; cursor: pointer; color: var(--color-text-muted); padding: 4px; border-radius: var(--radius-sm, 4px); display: flex; }
        .sidebar-toggle:hover { background: var(--color-surface-2); color: var(--color-text); }
        .sidebar-nav { display: flex; flex-direction: column; gap: 2px; padding: 12px 8px; flex: 1; overflow-y: auto; }
        .sidebar-item {
          display: flex; align-items: center; gap: 10px; padding: 9px 10px; width: 100%;
          border-radius: var(--radius-md, 8px); font-size: 0.875rem; color: var(--color-text-muted);
          background: transparent; border: none; cursor: pointer; text-align: start;
          white-space: nowrap; overflow: hidden; transition: background 0.15s, color 0.15s;
        }
        .sidebar-item:hover { background: var(--color-surface-2); color: var(--color-text); }
        .sidebar-item--active { background: color-mix(in srgb, var(--color-primary) 12%, transparent); color: var(--color-primary); font-weight: 500; }
        .sidebar-item--collapsed { justify-content: center; padding: 9px; }
        .sidebar-item-icon { width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .sidebar-item-label { flex: 1; }
        .sidebar-badge { font-size: 0.6875rem; font-weight: 600; background: var(--color-primary); color: white; border-radius: 9999px; padding: 1px 6px; }
        .sidebar-separator { height: 1px; background: var(--color-border); margin: 8px 0; }
        .sidebar-group-label { font-size: 0.6875rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.07em; padding: 8px 10px 4px; }
      `}</style>
    </motion.aside>
  )
}

export { Sidebar }
```

## בדיקות סיום
- [ ] Collapse/expand animation
- [ ] Active state נכון
- [ ] Tooltip ב-collapsed mode
- [ ] CSS variables בלבד
- [ ] RTL תמיכה (border-inline-end)
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
