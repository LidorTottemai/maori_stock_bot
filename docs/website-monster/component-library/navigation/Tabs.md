# Tabs

> **קטגוריה:** navigation
> **תלויות:** @radix-ui/react-tabs, react, clsx
> **Storybook:** src/stories/Tabs.stories.tsx
> **קוד:** src/navigation/Tabs.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
קומפוננטת Tabs מבוססת Radix UI עם שלושה וריאנטים ויזואליים: line (קו תחתי מונפש), pill (כפתור מעוגל), ו-card (כרטיסיה). תומכת באוריינטציה אנכית, ניווט מקלדת מלא, ו-RTL מובנה דרך Radix.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Line (default) | קו תחתי כחול מחליק אחרי הטאב הפעיל |
| Pill | רקע מעוגל מסביב לטאב הפעיל |
| Card | גבול ורקע בסגנון כרטיסיה |
| Vertical | רשימה אנכית של טאבים בצד |
| With Icons | איקון + תווית בכל טאב |
| Disabled Tab | טאב לא לחיץ עם סטייל מעומעם |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'line' \| 'pill' \| 'card'` | `'line'` | סגנון ויזואלי |
| orientation | `'horizontal' \| 'vertical'` | `'horizontal'` | כיוון פריסת הטאבים |
| defaultValue | `string` | — | ערך ברירת מחדל (uncontrolled) |
| value | `string` | — | ערך נוכחי (controlled) |
| onValueChange | `(value: string) => void` | — | קולבק לשינוי טאב |
| className | `string` | — | קלאסים נוספים לעטיפה |

### TabsTrigger Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `string` | — | **חובה.** ערך ייחודי לטאב |
| disabled | `boolean` | `false` | ביטול הטאב |
| icon | `ReactNode` | — | אלמנט איקון לפני התווית |
| className | `string` | — | קלאסים נוספים |

## שימוש בסיסי
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@tottemai/ui"

<Tabs defaultValue="tab1" variant="line">
  <TabsList>
    <TabsTrigger value="tab1">פרופיל</TabsTrigger>
    <TabsTrigger value="tab2">הגדרות</TabsTrigger>
    <TabsTrigger value="tab3" disabled>מנוי</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">תוכן פרופיל</TabsContent>
  <TabsContent value="tab2">תוכן הגדרות</TabsContent>
  <TabsContent value="tab3">תוכן מנוי</TabsContent>
</Tabs>
```

## קוד מלא
```tsx
// src/navigation/Tabs.tsx
import * as RadixTabs from "@radix-ui/react-tabs";
import clsx from "clsx";
import React from "react";

export type TabsVariant = "line" | "pill" | "card";

export interface TabsProps
  extends Omit<React.ComponentPropsWithoutRef<typeof RadixTabs.Root>, "className"> {
  variant?: TabsVariant;
  className?: string;
}

export interface TabsListProps
  extends Omit<React.ComponentPropsWithoutRef<typeof RadixTabs.List>, "className"> {
  className?: string;
}

export interface TabsTriggerProps
  extends Omit<React.ComponentPropsWithoutRef<typeof RadixTabs.Trigger>, "className"> {
  icon?: React.ReactNode;
  className?: string;
}

export interface TabsContentProps
  extends Omit<React.ComponentPropsWithoutRef<typeof RadixTabs.Content>, "className"> {
  className?: string;
}

const TabsContext = React.createContext<{ variant: TabsVariant }>({
  variant: "line",
});

const styles = `
  .tabs-root {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .tabs-root[data-orientation="vertical"] {
    flex-direction: row;
    gap: var(--spacing-4, 16px);
  }

  /* ── List ── */
  .tabs-list {
    display: flex;
    flex-shrink: 0;
  }

  .tabs-list[data-orientation="vertical"] {
    flex-direction: column;
    border-inline-end: 1px solid var(--color-border, #e5e7eb);
    padding-inline-end: 0;
  }

  /* Line variant list */
  .tabs-list--line {
    position: relative;
    border-bottom: 2px solid var(--color-border, #e5e7eb);
  }

  .tabs-list--line[data-orientation="vertical"] {
    border-bottom: none;
  }

  /* Pill variant list */
  .tabs-list--pill {
    background-color: var(--color-surface-raised, #f3f4f6);
    border-radius: var(--radius-full, 9999px);
    padding: var(--spacing-1, 4px);
    gap: var(--spacing-1, 4px);
  }

  /* Card variant list */
  .tabs-list--card {
    border-bottom: 1px solid var(--color-border, #e5e7eb);
    gap: var(--spacing-1, 4px);
  }

  /* ── Trigger ── */
  .tabs-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-2, 8px);
    padding: var(--spacing-2, 8px) var(--spacing-4, 16px);
    font-size: var(--font-size-sm, 14px);
    font-weight: var(--font-weight-medium, 500);
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    border: none;
    background: transparent;
    color: var(--color-text-secondary, #6b7280);
    border-radius: var(--radius-sm, 4px);
    transition:
      color var(--duration-fast, 150ms) ease,
      background-color var(--duration-fast, 150ms) ease;
    outline: none;
    position: relative;
  }

  .tabs-trigger:hover:not([data-disabled]) {
    color: var(--color-text-primary, #111827);
  }

  .tabs-trigger:focus-visible {
    outline: 2px solid var(--color-focus-ring, var(--color-primary));
    outline-offset: 2px;
  }

  .tabs-trigger[data-disabled] {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* Line trigger active */
  .tabs-trigger--line[data-state="active"] {
    color: var(--color-primary);
  }

  .tabs-trigger--line::after {
    content: "";
    position: absolute;
    bottom: -2px;
    inset-inline-start: 0;
    width: 100%;
    height: 2px;
    background-color: var(--color-primary);
    border-radius: var(--radius-full, 9999px);
    transform: scaleX(0);
    transition: transform var(--duration-normal, 200ms) var(--ease-standard, ease);
  }

  .tabs-trigger--line[data-state="active"]::after {
    transform: scaleX(1);
  }

  .tabs-trigger--line[data-orientation="vertical"]::after {
    bottom: unset;
    inset-inline-end: -2px;
    inset-inline-start: unset;
    width: 2px;
    height: 100%;
    top: 0;
    transform: scaleY(0);
  }

  .tabs-trigger--line[data-orientation="vertical"][data-state="active"]::after {
    transform: scaleY(1);
  }

  /* Pill trigger active */
  .tabs-trigger--pill[data-state="active"] {
    background-color: var(--color-surface, #ffffff);
    color: var(--color-text-primary, #111827);
    box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.1));
    border-radius: var(--radius-full, 9999px);
  }

  /* Card trigger active */
  .tabs-trigger--card {
    border: 1px solid transparent;
    border-bottom: none;
    border-radius: var(--radius-sm, 4px) var(--radius-sm, 4px) 0 0;
    margin-bottom: -1px;
  }

  .tabs-trigger--card[data-state="active"] {
    background-color: var(--color-surface, #ffffff);
    color: var(--color-text-primary, #111827);
    border-color: var(--color-border, #e5e7eb);
    border-bottom-color: var(--color-surface, #ffffff);
  }

  /* ── Content ── */
  .tabs-content {
    flex: 1;
    padding: var(--spacing-4, 16px) 0;
    color: var(--color-text-primary, #111827);
    font-size: var(--font-size-base, 16px);
    outline: none;
  }

  .tabs-content[data-orientation="vertical"] {
    padding: 0 var(--spacing-4, 16px);
  }

  .tabs-content:focus-visible {
    outline: 2px solid var(--color-focus-ring, var(--color-primary));
    outline-offset: 2px;
    border-radius: var(--radius-sm, 4px);
  }

  /* RTL flip for line underline in vertical */
  [dir="rtl"] .tabs-trigger--line[data-orientation="vertical"]::after {
    inset-inline-end: unset;
    inset-inline-start: -2px;
  }
`;

function injectStyles() {
  if (typeof document === "undefined") return;
  const id = "__tabs_styles__";
  if (document.getElementById(id)) return;
  const tag = document.createElement("style");
  tag.id = id;
  tag.textContent = styles;
  document.head.appendChild(tag);
}

/* ── Tabs Root ── */
export const Tabs = React.forwardRef<
  React.ElementRef<typeof RadixTabs.Root>,
  TabsProps
>(({ variant = "line", className, children, ...props }, ref) => {
  injectStyles();
  return (
    <TabsContext.Provider value={{ variant }}>
      <RadixTabs.Root
        ref={ref}
        className={clsx("tabs-root", className)}
        {...props}
      >
        {children}
      </RadixTabs.Root>
    </TabsContext.Provider>
  );
});
Tabs.displayName = "Tabs";

/* ── Tabs List ── */
export const TabsList = React.forwardRef<
  React.ElementRef<typeof RadixTabs.List>,
  TabsListProps
>(({ className, children, ...props }, ref) => {
  const { variant } = React.useContext(TabsContext);
  return (
    <RadixTabs.List
      ref={ref}
      className={clsx(
        "tabs-list",
        `tabs-list--${variant}`,
        className
      )}
      {...props}
    >
      {children}
    </RadixTabs.List>
  );
});
TabsList.displayName = "TabsList";

/* ── Tabs Trigger ── */
export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof RadixTabs.Trigger>,
  TabsTriggerProps
>(({ className, icon, children, ...props }, ref) => {
  const { variant } = React.useContext(TabsContext);
  return (
    <RadixTabs.Trigger
      ref={ref}
      className={clsx(
        "tabs-trigger",
        `tabs-trigger--${variant}`,
        className
      )}
      {...props}
    >
      {icon && (
        <span className="tabs-trigger-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </RadixTabs.Trigger>
  );
});
TabsTrigger.displayName = "TabsTrigger";

/* ── Tabs Content ── */
export const TabsContent = React.forwardRef<
  React.ElementRef<typeof RadixTabs.Content>,
  TabsContentProps
>(({ className, children, ...props }, ref) => {
  return (
    <RadixTabs.Content
      ref={ref}
      className={clsx("tabs-content", className)}
      {...props}
    >
      {children}
    </RadixTabs.Content>
  );
});
TabsContent.displayName = "TabsContent";

export default Tabs;
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
