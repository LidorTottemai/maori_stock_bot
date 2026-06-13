# NavigationMenu

> **קטגוריה:** navigation
> **תלויות:** @radix-ui/react-navigation-menu
> **Storybook:** src/stories/navigation/NavigationMenu.stories.tsx
> **קוד:** src/navigation/NavigationMenu.tsx
> **עלות בנייה:** ~30 דקות

## מה זה
Top-level navigation bar עם dropdown panels (mega menu). מבוסס Radix NavigationMenu. תומך ב-hover + focus, animated indicator, mobile-ready. שימושי ב-Navbar של אתרים.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Simple links | קישורים רגילים |
| With dropdowns | panels מתחת לlinks |
| Mega menu | panel רחב עם תמונות |
| Mobile | collapsed navigation |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| items | `NavItem[]` | — | — |
| className | `string` | — | — |

```ts
interface NavItem {
  label: string
  href?: string
  children?: { label: string; href: string; description?: string }[]
}
```

## שימוש בסיסי
```tsx
import { NavigationMenu } from "@tottemai/ui"

<NavigationMenu
  items={[
    { label: "בית", href: "/" },
    { label: "שירותים", children: [
      { label: "עיסוי שוודי", href: "/services/swedish", description: "עיסוי קלאסי מרגיע" },
      { label: "רפלקסולוגיה", href: "/services/reflexology" },
    ]},
    { label: "צור קשר", href: "/contact" },
  ]}
/>
```

## קוד מלא
```tsx
"use client"
// src/navigation/NavigationMenu.tsx
import * as React from "react"
import * as NavMenuPrimitive from "@radix-ui/react-navigation-menu"
import { cn } from "../cn"

interface NavChild { label: string; href: string; description?: string }
interface NavItem { label: string; href?: string; children?: NavChild[] }

interface NavigationMenuProps {
  items: NavItem[]
  className?: string
}

function NavigationMenu({ items, className }: NavigationMenuProps) {
  return (
    <NavMenuPrimitive.Root className={cn("navmenu-root", className)}>
      <NavMenuPrimitive.List className="navmenu-list">
        {items.map((item) => (
          <NavMenuPrimitive.Item key={item.label}>
            {item.children ? (
              <>
                <NavMenuPrimitive.Trigger className="navmenu-trigger">
                  {item.label}
                  <svg className="navmenu-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </NavMenuPrimitive.Trigger>
                <NavMenuPrimitive.Content className="navmenu-content">
                  <ul className="navmenu-dropdown">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <NavMenuPrimitive.Link href={child.href} className="navmenu-dropdown-link">
                          <span className="navmenu-dropdown-label">{child.label}</span>
                          {child.description && <span className="navmenu-dropdown-desc">{child.description}</span>}
                        </NavMenuPrimitive.Link>
                      </li>
                    ))}
                  </ul>
                </NavMenuPrimitive.Content>
              </>
            ) : (
              <NavMenuPrimitive.Link href={item.href} className="navmenu-link">{item.label}</NavMenuPrimitive.Link>
            )}
          </NavMenuPrimitive.Item>
        ))}
        <NavMenuPrimitive.Indicator className="navmenu-indicator">
          <div className="navmenu-arrow" />
        </NavMenuPrimitive.Indicator>
      </NavMenuPrimitive.List>
      <div className="navmenu-viewport-container">
        <NavMenuPrimitive.Viewport className="navmenu-viewport" />
      </div>

      <style>{`
        .navmenu-root { position: relative; }
        .navmenu-list { display: flex; align-items: center; gap: 4px; list-style: none; padding: 0; margin: 0; }
        .navmenu-link, .navmenu-trigger {
          padding: 8px 14px; border-radius: var(--radius-md, 8px);
          font-size: 0.875rem; font-weight: 500; color: var(--color-text-muted);
          background: transparent; border: none; cursor: pointer; text-decoration: none;
          display: flex; align-items: center; gap: 5px;
          transition: background 0.15s, color 0.15s;
        }
        .navmenu-link:hover, .navmenu-trigger:hover,
        .navmenu-trigger[data-state="open"] { background: var(--color-surface-2); color: var(--color-text); }
        .navmenu-chevron { transition: transform 0.2s; }
        .navmenu-trigger[data-state="open"] .navmenu-chevron { transform: rotate(180deg); }
        .navmenu-viewport-container { position: absolute; top: 100%; start: 0; width: 100%; display: flex; justify-content: center; }
        .navmenu-viewport {
          background: var(--color-surface); border: 1px solid var(--color-border);
          border-radius: var(--radius-lg, 12px); box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          overflow: hidden; width: var(--radix-navigation-menu-viewport-width);
          height: var(--radix-navigation-menu-viewport-height);
          transition: width 0.2s, height 0.2s;
          animation: navmenu-viewport-in 0.15s ease;
        }
        @keyframes navmenu-viewport-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .navmenu-content { padding: 8px; }
        .navmenu-dropdown { list-style: none; padding: 0; margin: 0; display: grid; gap: 4px; min-width: 200px; }
        .navmenu-dropdown-link { display: flex; flex-direction: column; gap: 2px; padding: 10px 12px; border-radius: var(--radius-md, 8px); text-decoration: none; transition: background 0.1s; }
        .navmenu-dropdown-link:hover { background: var(--color-surface-2); }
        .navmenu-dropdown-label { font-size: 0.875rem; font-weight: 500; color: var(--color-text); }
        .navmenu-dropdown-desc { font-size: 0.8125rem; color: var(--color-text-muted); }
        .navmenu-indicator { bottom: -2px; height: 8px; display: flex; align-items: flex-end; justify-content: center; overflow: hidden; transition: transform 0.2s; }
        .navmenu-arrow { width: 10px; height: 5px; background: var(--color-surface); border: 1px solid var(--color-border); transform: rotate(45deg); border-radius: 2px 0 0 0; }
      `}</style>
    </NavMenuPrimitive.Root>
  )
}

export { NavigationMenu }
```

## בדיקות סיום
- [ ] Dropdown panels נפתחים ב-hover/focus
- [ ] Keyboard navigation פועל
- [ ] Viewport animation
- [ ] CSS variables בלבד
- [ ] מיוצא ב-src/index.ts
- [ ] Story ב-Storybook

← [[00 - Library Overview & Build Plan]]
