# List

> **קטגוריה:** data-display
> **תלויות:** react, clsx
> **Storybook:** src/stories/List.stories.tsx
> **קוד:** src/data-display/List.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
רשימה עם ListItem הכולל אייקון/אווטאר, כותרת, כותרת משנה וכפתור פעולה. מתאים לרשימות אנשי קשר, תוצאות חיפוש, פריטי תפריט ופידים. תומך בחלוקה ויזואלית בין פריטים ובניווט מקלדת.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | רשימה בסיסית עם כותרות בלבד |
| With Icons | פריטים עם אייקונים משמאל |
| With Avatars | פריטים עם תמונות אווטאר עגולות |
| With Actions | פריטים עם כפתורי פעולה מימין |
| Divided | קו מפריד בין הפריטים |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| icon | `ReactNode` | — | אייקון לפני הכותרת |
| avatar | `string` | — | URL לתמונת אווטאר |
| title | `string` | required | הכותרת הראשית של הפריט |
| subtitle | `string` | — | כותרת משנה מתחת לכותרת |
| action | `ReactNode` | — | אלמנט פעולה בצד |
| onClick | `() => void` | — | פונקציה בלחיצה על הפריט |
| divided | `boolean` | `false` | הוספת קו מפריד תחתי |
| className | `string` | — | קלאס CSS נוסף |

## שימוש בסיסי
```tsx
import { List, ListItem } from "@tottemai/ui"

export default function Demo() {
  return (
    <List>
      <ListItem
        title="Alice Cohen"
        subtitle="מפתחת FullStack"
        divided
      />
      <ListItem
        title="Bob Levi"
        subtitle="מעצב UI/UX"
        action={<button>פעולה</button>}
        divided
      />
      <ListItem
        avatar="https://i.pravatar.cc/40?u=carol"
        title="Carol Mizrahi"
        subtitle="מנהלת מוצר"
        onClick={() => console.log("נלחץ")}
      />
    </List>
  )
}
```

## קוד מלא
```tsx
// src/data-display/List.tsx
import React from "react"
import clsx from "clsx"

// ── List ──────────────────────────────────────────────────────────────────────

export interface ListProps {
  children: React.ReactNode
  as?: React.ElementType
  role?: string
  className?: string
}

export function List({
  children,
  as: Tag = "ul",
  role = "list",
  className,
}: ListProps) {
  return (
    <Tag
      role={role}
      dir="auto"
      className={clsx("tui-list", className)}
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        backgroundColor: "var(--color-surface, #fff)",
        borderRadius: "var(--radius-md, 8px)",
        border: "1px solid var(--color-border, #e2e8f0)",
        overflow: "hidden",
      }}
    >
      {children}
    </Tag>
  )
}

// ── ListItem ──────────────────────────────────────────────────────────────────

export interface ListItemProps {
  icon?: React.ReactNode
  avatar?: string
  title: string
  subtitle?: string
  action?: React.ReactNode
  onClick?: () => void
  divided?: boolean
  className?: string
}

export function ListItem({
  icon,
  avatar,
  title,
  subtitle,
  action,
  onClick,
  divided = false,
  className,
}: ListItemProps) {
  const isInteractive = Boolean(onClick)

  const itemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "var(--spacing-3, 12px)",
    padding: "var(--spacing-3, 12px) var(--spacing-4, 16px)",
    backgroundColor: "var(--color-surface, #fff)",
    color: "var(--color-text-primary, inherit)",
    borderBottom: divided
      ? "1px solid var(--color-border, #e2e8f0)"
      : "none",
    cursor: isInteractive ? "pointer" : "default",
    transition: "background-color var(--duration-fast, 100ms) ease",
    textAlign: "start",
    width: "100%",
    border: "none",
    outline: "none",
    fontFamily: "inherit",
    fontSize: "inherit",
    ...(divided ? { borderBottom: "1px solid var(--color-border, #e2e8f0)" } : {}),
  }

  const leadingStyle: React.CSSProperties = {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "var(--spacing-10, 40px)",
    height: "var(--spacing-10, 40px)",
    color: "var(--color-text-secondary, #64748b)",
  }

  const avatarStyle: React.CSSProperties = {
    ...leadingStyle,
    borderRadius: "50%",
    overflow: "hidden",
    backgroundColor: "var(--color-surface-raised, #f1f5f9)",
  }

  const textBlockStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-0-5, 2px)",
  }

  const titleStyle: React.CSSProperties = {
    fontWeight: "var(--font-weight-medium, 500)" as React.CSSProperties["fontWeight"],
    fontSize: "var(--font-size-sm, 0.875rem)",
    color: "var(--color-text-primary, inherit)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }

  const subtitleStyle: React.CSSProperties = {
    fontSize: "var(--font-size-xs, 0.75rem)",
    color: "var(--color-text-muted, #94a3b8)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }

  const actionStyle: React.CSSProperties = {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
  }

  const leading = avatar ? (
    <span style={avatarStyle} aria-hidden="true">
      <img
        src={avatar}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </span>
  ) : icon ? (
    <span style={leadingStyle} aria-hidden="true">
      {icon}
    </span>
  ) : null

  const inner = (
    <>
      {leading}
      <span style={textBlockStyle}>
        <span style={titleStyle}>{title}</span>
        {subtitle && <span style={subtitleStyle}>{subtitle}</span>}
      </span>
      {action && <span style={actionStyle}>{action}</span>}
    </>
  )

  if (isInteractive) {
    return (
      <li role="listitem" className={clsx("tui-list-item", className)}>
        <button
          type="button"
          style={itemStyle}
          onClick={onClick}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.backgroundColor =
              "var(--color-surface-hover, #f1f5f9)"
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.backgroundColor =
              "var(--color-surface, #fff)"
          }}
          onFocus={(e) => {
            ;(e.currentTarget as HTMLElement).style.backgroundColor =
              "var(--color-surface-hover, #f1f5f9)"
          }}
          onBlur={(e) => {
            ;(e.currentTarget as HTMLElement).style.backgroundColor =
              "var(--color-surface, #fff)"
          }}
        >
          {inner}
        </button>
      </li>
    )
  }

  return (
    <li
      role="listitem"
      style={itemStyle}
      className={clsx("tui-list-item", className)}
    >
      {inner}
    </li>
  )
}

export default List
```

## בדיקות סיום
- [ ] מרנדר בלי שגיאות
- [ ] כל ה-variants פועלים
- [ ] CSS variables בלבד
- [ ] Accessible (aria-*, keyboard nav)
- [ ] RTL תמיכה
- [ ] מיוצא ב-src/index.ts
- [ ] Story ב-Storybook

← [[00 - Library Overview & Build Plan]]
