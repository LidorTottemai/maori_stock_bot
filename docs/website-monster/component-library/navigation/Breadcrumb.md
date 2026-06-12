# Breadcrumb

> **קטגוריה:** navigation
> **תלויות:** react, clsx
> **Storybook:** src/stories/Breadcrumb.stories.tsx
> **קוד:** src/navigation/Breadcrumb.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
ניווט ארגומה (breadcrumb) עם מפריד מותאם אישית, קיצור אוטומטי לנתיבים ארוכים (אליפסיס), ותמיכת RTL מלאה. מיישם `nav > ol > li` עם aria semantics תקניים. פריט אחרון מסומן כ-`aria-current="page"`.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | שלושה פריטים עם מפריד `/` |
| Custom Separator | מפריד מותאם (`›`, `→`, או JSX) |
| Truncated (5+ items) | קיצור לאמצע עם `...` כשמעל maxItems |
| With Icons | איקון בצד כל פריט |
| Home Icon | פריט ראשון עם איקון בית במקום תווית |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| items | `BreadcrumbItemDef[]` | — | **חובה.** רשימת הפריטים |
| separator | `ReactNode` | `'/'` | מפריד בין הפריטים |
| maxItems | `number` | — | מספר מקסימלי לפני קיצור |
| className | `string` | — | קלאסים נוספים |

### BreadcrumbItemDef
| שדה | Type | Description |
|-----|------|-------------|
| label | `string` | טקסט הפריט |
| href | `string?` | כתובת קישור (ללא href = span) |
| icon | `ReactNode?` | אלמנט איקון לפני התווית |
| current | `boolean?` | מסמן את הפריט הנוכחי |

## שימוש בסיסי
```tsx
import { Breadcrumb } from "@tottemai/ui"

const items = [
  { label: "בית", href: "/" },
  { label: "מוצרים", href: "/products" },
  { label: "נעליים", href: "/products/shoes" },
  { label: "Nike Air Max", current: true },
]

<Breadcrumb items={items} separator="›" maxItems={3} />
```

## קוד מלא
```tsx
// src/navigation/Breadcrumb.tsx
import clsx from "clsx";
import React from "react";

export interface BreadcrumbItemDef {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  current?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItemDef[];
  separator?: React.ReactNode;
  maxItems?: number;
  className?: string;
}

const styles = `
  .breadcrumb-nav {
    width: 100%;
  }

  .breadcrumb-list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .breadcrumb-item {
    display: inline-flex;
    align-items: center;
    font-size: var(--font-size-sm, 14px);
  }

  .breadcrumb-link {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-1, 4px);
    color: var(--color-text-secondary, #6b7280);
    text-decoration: none;
    border-radius: var(--radius-xs, 2px);
    padding: 2px var(--spacing-1, 4px);
    transition: color var(--duration-fast, 150ms) ease;
    outline: none;
  }

  .breadcrumb-link:hover {
    color: var(--color-text-primary, #111827);
    text-decoration: underline;
  }

  .breadcrumb-link:focus-visible {
    outline: 2px solid var(--color-focus-ring, var(--color-primary));
    outline-offset: 2px;
  }

  .breadcrumb-current {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-1, 4px);
    color: var(--color-text-primary, #111827);
    font-weight: var(--font-weight-medium, 500);
    padding: 2px var(--spacing-1, 4px);
  }

  .breadcrumb-separator {
    display: inline-flex;
    align-items: center;
    color: var(--color-text-muted, #9ca3af);
    padding: 0 var(--spacing-1, 4px);
    user-select: none;
    font-size: var(--font-size-sm, 14px);
  }

  .breadcrumb-ellipsis {
    display: inline-flex;
    align-items: center;
    color: var(--color-text-secondary, #6b7280);
    padding: 2px var(--spacing-1, 4px);
    letter-spacing: 0.05em;
    cursor: default;
  }

  .breadcrumb-icon {
    width: 1em;
    height: 1em;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
`;

function injectStyles() {
  if (typeof document === "undefined") return;
  const id = "__breadcrumb_styles__";
  if (document.getElementById(id)) return;
  const tag = document.createElement("style");
  tag.id = id;
  tag.textContent = styles;
  document.head.appendChild(tag);
}

function getVisibleItems(
  items: BreadcrumbItemDef[],
  maxItems?: number
): Array<BreadcrumbItemDef | "__ellipsis__"> {
  if (!maxItems || items.length <= maxItems) return items;

  // Always show first and last; fill rest from the end up to maxItems
  // Layout: first, ..., last (maxItems - 2) middle items hidden
  if (maxItems <= 2) {
    return [items[0], "__ellipsis__", items[items.length - 1]];
  }

  const tailCount = maxItems - 2; // slots after first and before ellipsis
  const tail = items.slice(items.length - tailCount);
  return [items[0], "__ellipsis__", ...tail];
}

const BreadcrumbLink: React.FC<{
  item: BreadcrumbItemDef;
}> = ({ item }) => {
  if (item.current || !item.href) {
    return (
      <span
        className="breadcrumb-current"
        aria-current={item.current ? "page" : undefined}
      >
        {item.icon && (
          <span className="breadcrumb-icon" aria-hidden="true">
            {item.icon}
          </span>
        )}
        {item.label}
      </span>
    );
  }

  return (
    <a href={item.href} className="breadcrumb-link">
      {item.icon && (
        <span className="breadcrumb-icon" aria-hidden="true">
          {item.icon}
        </span>
      )}
      {item.label}
    </a>
  );
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = "/",
  maxItems,
  className,
}) => {
  injectStyles();

  if (!items || items.length === 0) return null;

  const visible = getVisibleItems(items, maxItems);

  return (
    <nav
      aria-label="breadcrumb"
      className={clsx("breadcrumb-nav", className)}
      dir="auto"
    >
      <ol className="breadcrumb-list">
        {visible.map((itemOrEllipsis, index) => {
          const isLast = index === visible.length - 1;

          if (itemOrEllipsis === "__ellipsis__") {
            return (
              <React.Fragment key={`ellipsis-${index}`}>
                <li className="breadcrumb-item" aria-hidden="true">
                  <span
                    className="breadcrumb-ellipsis"
                    title="עוד פריטים"
                  >
                    •••
                  </span>
                </li>
                {!isLast && (
                  <li
                    className="breadcrumb-separator"
                    aria-hidden="true"
                  >
                    {separator}
                  </li>
                )}
              </React.Fragment>
            );
          }

          const item = itemOrEllipsis as BreadcrumbItemDef;

          return (
            <React.Fragment key={`${item.href ?? item.label}-${index}`}>
              <li className="breadcrumb-item">
                <BreadcrumbLink item={item} />
              </li>
              {!isLast && (
                <li
                  className="breadcrumb-separator"
                  aria-hidden="true"
                  role="presentation"
                >
                  {separator}
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

Breadcrumb.displayName = "Breadcrumb";

export default Breadcrumb;
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
