# Command

> **קטגוריה:** navigation
> **תלויות:** cmdk, @radix-ui/react-dialog
> **Storybook:** src/stories/navigation/Command.stories.tsx
> **קוד:** src/navigation/Command.tsx
> **עלות בנייה:** ~30 דקות

## מה זה
Command palette (Cmd+K / ⌘K). Dialog עם fuzzy search, groups, keyboard navigation. ה-UX של VS Code, Linear, Vercel. משמש לניווט מהיר, חיפוש, פעולות.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | command palette רגיל |
| With groups | Navigation / Actions / Settings |
| With keyboard trigger | ⌘K לפתיחה |
| With recent items | היסטוריה |
| Empty state | "לא נמצאו תוצאות" |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| open | `boolean` | — | controlled |
| onOpenChange | `(open: boolean) => void` | — | — |
| groups | `CommandGroup[]` | — | קבוצות פקודות |
| placeholder | `string` | `"חפש פקודה..."` | — |
| shortcut | `string` | `"⌘K"` | keyboard shortcut display |

```ts
interface CommandGroup {
  label: string
  items: { label: string; icon?: ReactNode; shortcut?: string; onSelect: () => void }[]
}
```

## שימוש בסיסי
```tsx
import { Command, useCommandPalette } from "@tottemai/ui"

const { open, setOpen } = useCommandPalette("k")  // ⌘K / Ctrl+K

<Command
  open={open}
  onOpenChange={setOpen}
  groups={[
    {
      label: "ניווט",
      items: [
        { label: "דף הבית", icon: <HomeIcon />, onSelect: () => router.push("/") },
        { label: "הגדרות", onSelect: () => router.push("/settings") },
      ],
    },
  ]}
/>
```

## קוד מלא
```tsx
"use client"
// src/navigation/Command.tsx
import * as React from "react"
import { Command as Cmdk } from "cmdk"
import * as Dialog from "@radix-ui/react-dialog"
import { cn } from "../cn"

interface CommandItem { label: string; icon?: React.ReactNode; shortcut?: string; onSelect: () => void }
interface CommandGroup { label: string; items: CommandItem[] }

interface CommandProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groups: CommandGroup[]
  placeholder?: string
  className?: string
}

function Command({ open, onOpenChange, groups, placeholder = "חפש פקודה...", className }: CommandProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="cmd-overlay" />
        <Dialog.Content className={cn("cmd-dialog", className)}>
          <Cmdk className="cmd-root" shouldFilter>
            <div className="cmd-input-wrapper">
              <svg className="cmd-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.25" />
                <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
              </svg>
              <Cmdk.Input className="cmd-input" placeholder={placeholder} autoFocus />
              <kbd className="cmd-esc">esc</kbd>
            </div>
            <Cmdk.List className="cmd-list">
              <Cmdk.Empty className="cmd-empty">לא נמצאו תוצאות</Cmdk.Empty>
              {groups.map((group) => (
                <Cmdk.Group key={group.label} heading={group.label} className="cmd-group">
                  {group.items.map((item) => (
                    <Cmdk.Item
                      key={item.label}
                      value={item.label}
                      onSelect={() => { item.onSelect(); onOpenChange(false); }}
                      className="cmd-item"
                    >
                      {item.icon && <span className="cmd-item-icon">{item.icon}</span>}
                      <span className="cmd-item-label">{item.label}</span>
                      {item.shortcut && <kbd className="cmd-item-shortcut">{item.shortcut}</kbd>}
                    </Cmdk.Item>
                  ))}
                </Cmdk.Group>
              ))}
            </Cmdk.List>
          </Cmdk>
        </Dialog.Content>
      </Dialog.Portal>

      <style>{`
        .cmd-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 100; }
        .cmd-dialog {
          position: fixed; top: 20%; left: 50%; transform: translateX(-50%);
          width: 90vw; max-width: 560px; z-index: 101;
          background: var(--color-surface); border: 1px solid var(--color-border);
          border-radius: var(--radius-lg, 12px); box-shadow: 0 24px 48px rgba(0,0,0,0.3);
          overflow: hidden; animation: cmd-in 0.15s ease;
        }
        @keyframes cmd-in { from { opacity: 0; transform: translateX(-50%) translateY(-8px) scale(0.97); } to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); } }
        .cmd-root { display: flex; flex-direction: column; }
        .cmd-input-wrapper { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-bottom: 1px solid var(--color-border); }
        .cmd-search-icon { color: var(--color-text-muted); flex-shrink: 0; }
        .cmd-input { flex: 1; background: transparent; border: none; outline: none; font-size: 0.9375rem; color: var(--color-text); }
        .cmd-esc { font-size: 0.6875rem; padding: 2px 6px; background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: 4px; color: var(--color-text-muted); }
        .cmd-list { max-height: 360px; overflow-y: auto; padding: 8px; }
        .cmd-group [cmdk-group-heading] { font-size: 0.6875rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.07em; padding: 8px 10px 4px; }
        .cmd-item {
          display: flex; align-items: center; gap: 10px; padding: 8px 10px;
          border-radius: var(--radius-sm, 6px); font-size: 0.875rem; color: var(--color-text);
          cursor: pointer; outline: none;
        }
        .cmd-item[data-selected="true"] { background: var(--color-surface-2); }
        .cmd-item-icon { width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); }
        .cmd-item-label { flex: 1; }
        .cmd-item-shortcut { font-size: 0.6875rem; color: var(--color-text-muted); background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: 4px; padding: 1px 5px; }
        .cmd-empty { padding: 24px; text-align: center; color: var(--color-text-muted); font-size: 0.875rem; }
      `}</style>
    </Dialog.Root>
  )
}

function useCommandPalette(key = "k") {
  const [open, setOpen] = React.useState(false)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.key === key && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setOpen((o) => !o) } }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [key])
  return { open, setOpen }
}

export { Command, useCommandPalette }
```

## בדיקות סיום
- [ ] ⌘K / Ctrl+K פותח
- [ ] Fuzzy search פועל
- [ ] Keyboard navigation (↑↓ Enter Esc)
- [ ] CSS variables בלבד
- [ ] מיוצא ב-src/index.ts
- [ ] Story ב-Storybook

← [[00 - Library Overview & Build Plan]]
