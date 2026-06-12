# ContextMenu

> **קטגוריה:** surfaces
> **תלויות:** @radix-ui/react-context-menu
> **Storybook:** src/stories/ContextMenu.stories.tsx
> **קוד:** src/surfaces/ContextMenu.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
קומפוננטת ContextMenu מבוססת Radix UI, מציגה תפריט צף בקליק ימני על אלמנט. מבנה זהה ל-DropdownMenu עם אותם תת-קומפוננטות (Item, Sub, Separator, Label, CheckboxItem, RadioGroup).

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | תפריט קונטקסט בסיסי עם פריטים |
| WithIcons | פריטים עם אייקונים |
| WithSubMenu | תפריט משנה מקונן |
| WithCheckboxItems | פריטים מסוג checkbox |
| WithRadioGroup | קבוצת radio בתוך התפריט |
| Destructive | פריט מחיקה בצבע אדום |

## Props API / Return Value
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| — | — | — | ContextMenu.Root אין props ייחודיים |

### ContextMenuContent Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| loop | `boolean` | `false` | ניווט מעגלי במקלדת |
| alignOffset | `number` | `0` | היסט יישור |
| className | `string` | `""` | CSS נוסף |

### ContextMenuItem Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| inset | `boolean` | `false` | ריפוד שמאל (לאיקונים) |
| disabled | `boolean` | `false` | השבתה |
| onSelect | `(event: Event) => void` | `undefined` | callback בבחירה |
| destructive | `boolean` | `false` | עיצוב הרסני (אדום) |

## שימוש בסיסי
\`\`\`tsx
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@tottemai/ui"

<ContextMenu>
  <ContextMenuTrigger>
    <div style={{ padding: "2rem", border: "2px dashed var(--color-border)" }}>
      קליק ימני כאן
    </div>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem onSelect={() => console.log("edit")}>עריכה</ContextMenuItem>
    <ContextMenuItem onSelect={() => console.log("copy")}>העתקה</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem destructive onSelect={() => console.log("delete")}>מחיקה</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
\`\`\`

## קוד מלא
\`\`\`tsx
import * as React from "react"
import * as RadixContextMenu from "@radix-ui/react-context-menu"

// ─── Types ───────────────────────────────────────────────────────────────────

interface ContextMenuItemProps
  extends React.ComponentPropsWithoutRef<typeof RadixContextMenu.Item> {
  inset?: boolean
  destructive?: boolean
}

interface ContextMenuCheckboxItemProps
  extends React.ComponentPropsWithoutRef<typeof RadixContextMenu.CheckboxItem> {}

interface ContextMenuRadioItemProps
  extends React.ComponentPropsWithoutRef<typeof RadixContextMenu.RadioItem> {}

// ─── Root pieces (direct re-exports) ────────────────────────────────────────

const ContextMenu = RadixContextMenu.Root
const ContextMenuTrigger = RadixContextMenu.Trigger
const ContextMenuPortal = RadixContextMenu.Portal
const ContextMenuSub = RadixContextMenu.Sub
const ContextMenuRadioGroup = RadixContextMenu.RadioGroup

// ─── Shared item style ───────────────────────────────────────────────────────

const itemBaseStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--spacing-2)",
  padding: "var(--spacing-2) var(--spacing-3)",
  borderRadius: "var(--radius-sm)",
  fontSize: "var(--font-size-sm)",
  cursor: "default",
  userSelect: "none",
  outline: "none",
  color: "var(--color-text)",
  transition: "background var(--duration-fast)",
}

// ─── ContextMenuContent ──────────────────────────────────────────────────────

const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof RadixContextMenu.Content>,
  React.ComponentPropsWithoutRef<typeof RadixContextMenu.Content>
>(({ style, children, ...props }, ref) => (
  <RadixContextMenu.Portal>
    <RadixContextMenu.Content
      ref={ref}
      style={{
        minWidth: "180px",
        background: "var(--color-surface-overlay)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)",
        padding: "var(--spacing-1)",
        zIndex: "var(--z-context-menu)",
        ...style,
      }}
      {...props}
    >
      {children}
    </RadixContextMenu.Content>
  </RadixContextMenu.Portal>
))

ContextMenuContent.displayName = "ContextMenuContent"

// ─── ContextMenuItem ─────────────────────────────────────────────────────────

const ContextMenuItem = React.forwardRef<
  React.ElementRef<typeof RadixContextMenu.Item>,
  ContextMenuItemProps
>(({ style, children, inset, destructive, ...props }, ref) => (
  <RadixContextMenu.Item
    ref={ref}
    style={{
      ...itemBaseStyle,
      paddingLeft: inset ? "var(--spacing-8)" : "var(--spacing-3)",
      color: destructive ? "var(--color-danger)" : "var(--color-text)",
      ...style,
    }}
    {...props}
  >
    {children}
  </RadixContextMenu.Item>
))

ContextMenuItem.displayName = "ContextMenuItem"

// ─── ContextMenuCheckboxItem ──────────────────────────────────────────────────

const ContextMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof RadixContextMenu.CheckboxItem>,
  ContextMenuCheckboxItemProps
>(({ style, children, ...props }, ref) => (
  <RadixContextMenu.CheckboxItem
    ref={ref}
    style={{
      ...itemBaseStyle,
      paddingLeft: "var(--spacing-8)",
      position: "relative",
      ...style,
    }}
    {...props}
  >
    <span
      style={{
        position: "absolute",
        left: "var(--spacing-2)",
        width: 16,
        height: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <RadixContextMenu.ItemIndicator>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </RadixContextMenu.ItemIndicator>
    </span>
    {children}
  </RadixContextMenu.CheckboxItem>
))

ContextMenuCheckboxItem.displayName = "ContextMenuCheckboxItem"

// ─── ContextMenuRadioItem ────────────────────────────────────────────────────

const ContextMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof RadixContextMenu.RadioItem>,
  ContextMenuRadioItemProps
>(({ style, children, ...props }, ref) => (
  <RadixContextMenu.RadioItem
    ref={ref}
    style={{
      ...itemBaseStyle,
      paddingLeft: "var(--spacing-8)",
      position: "relative",
      ...style,
    }}
    {...props}
  >
    <span
      style={{
        position: "absolute",
        left: "var(--spacing-2)",
        width: 16,
        height: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <RadixContextMenu.ItemIndicator>
        <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
          <circle cx="4" cy="4" r="4" fill="currentColor" />
        </svg>
      </RadixContextMenu.ItemIndicator>
    </span>
    {children}
  </RadixContextMenu.RadioItem>
))

ContextMenuRadioItem.displayName = "ContextMenuRadioItem"

// ─── ContextMenuLabel ────────────────────────────────────────────────────────

const ContextMenuLabel = React.forwardRef<
  React.ElementRef<typeof RadixContextMenu.Label>,
  React.ComponentPropsWithoutRef<typeof RadixContextMenu.Label> & { inset?: boolean }
>(({ style, inset, ...props }, ref) => (
  <RadixContextMenu.Label
    ref={ref}
    style={{
      padding: "var(--spacing-1) var(--spacing-3)",
      paddingLeft: inset ? "var(--spacing-8)" : "var(--spacing-3)",
      fontSize: "var(--font-size-xs)",
      fontWeight: "var(--font-weight-semibold)",
      color: "var(--color-text-muted)",
      ...style,
    }}
    {...props}
  />
))

ContextMenuLabel.displayName = "ContextMenuLabel"

// ─── ContextMenuSeparator ────────────────────────────────────────────────────

const ContextMenuSeparator = React.forwardRef<
  React.ElementRef<typeof RadixContextMenu.Separator>,
  React.ComponentPropsWithoutRef<typeof RadixContextMenu.Separator>
>(({ style, ...props }, ref) => (
  <RadixContextMenu.Separator
    ref={ref}
    style={{
      height: "1px",
      background: "var(--color-border)",
      margin: "var(--spacing-1) 0",
      ...style,
    }}
    {...props}
  />
))

ContextMenuSeparator.displayName = "ContextMenuSeparator"

// ─── ContextMenuSubTrigger ───────────────────────────────────────────────────

const ContextMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof RadixContextMenu.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof RadixContextMenu.SubTrigger> & { inset?: boolean }
>(({ style, children, inset, ...props }, ref) => (
  <RadixContextMenu.SubTrigger
    ref={ref}
    style={{
      ...itemBaseStyle,
      paddingLeft: inset ? "var(--spacing-8)" : "var(--spacing-3)",
      justifyContent: "space-between",
      ...style,
    }}
    {...props}
  >
    {children}
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M4.5 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </RadixContextMenu.SubTrigger>
))

ContextMenuSubTrigger.displayName = "ContextMenuSubTrigger"

// ─── ContextMenuSubContent ───────────────────────────────────────────────────

const ContextMenuSubContent = React.forwardRef<
  React.ElementRef<typeof RadixContextMenu.SubContent>,
  React.ComponentPropsWithoutRef<typeof RadixContextMenu.SubContent>
>(({ style, ...props }, ref) => (
  <RadixContextMenu.SubContent
    ref={ref}
    style={{
      minWidth: "160px",
      background: "var(--color-surface-overlay)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-lg)",
      padding: "var(--spacing-1)",
      zIndex: "var(--z-context-menu)",
      ...style,
    }}
    {...props}
  />
))

ContextMenuSubContent.displayName = "ContextMenuSubContent"

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuPortal,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuRadioGroup,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
}
\`\`\`

## בדיקות סיום
- [ ] מרנדר בלי שגיאות
- [ ] כל ה-variants פועלים
- [ ] CSS variables בלבד
- [ ] Accessible
- [ ] RTL תמיכה
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
