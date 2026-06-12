# KbdKey

> **קטגוריה:** data-display
> **תלויות:** react, clsx
> **Storybook:** src/stories/KbdKey.stories.tsx
> **קוד:** src/data-display/KbdKey.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
קומפוננטה להצגת קיצורי מקלדת בסגנון מקש פיזי, כגון ⌘K או ⌃⇧P. תומכת הן במחרוזת בודדת (כמו `"⌘K"`) והן במערך מפתחות (כמו `["Ctrl", "Shift", "P"]`), עם מפריד מותאם בין מפתחות ושלוש רמות גודל.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Single Key | מפתח בודד, למשל `Escape` |
| Combination | שילוב מפתחות כמערך `["Ctrl", "K"]` |
| Mac Symbols | סמלי Mac כמחרוזת `"⌘⇧P"` |
| Windows Style | סגנון Windows `["Win", "R"]` |
| In Context | KbdKey בתוך פסקת טקסט הסברתית |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| keys | `string \| string[]` | — (required) | מפתח בודד כמחרוזת, או מערך מפתחות להצגה בשילוב |
| separator | `string` | `'+'` | תו המפריד המוצג בין המפתחות |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | גודל הטקסט ו-padding של המפתחות |
| className | `string` | — | מחלקות CSS נוספות לעטיפה החיצונית |

## שימוש בסיסי
```tsx
import { KbdKey } from "@tottemai/ui"

{/* מפתח בודד */}
<KbdKey keys="Escape" />

{/* שילוב מפתחות */}
<KbdKey keys={["Ctrl", "Shift", "P"]} />

{/* סמלי Mac */}
<KbdKey keys="⌘K" size="lg" />

{/* מפריד מותאם */}
<KbdKey keys={["Alt", "F4"]} separator=" " />

{/* בתוך טקסט */}
<p>
  לחץ <KbdKey keys={["Ctrl", "S"]} size="sm" /> לשמירה
</p>
```

## קוד מלא
```tsx
// src/data-display/KbdKey.tsx
import clsx from "clsx"
import React from "react"

export interface KbdKeyProps {
  /** מפתח בודד כמחרוזת, או מערך מפתחות להצגה בשילוב */
  keys: string | string[]
  /** תו המפריד המוצג בין המפתחות */
  separator?: string
  /** גודל הטקסט ו-padding של המפתחות */
  size?: "sm" | "md" | "lg"
  /** מחלקות CSS נוספות לעטיפה החיצונית */
  className?: string
}

const SIZE_CLASSES: Record<NonNullable<KbdKeyProps["size"]>, string> = {
  sm: "kbd-key--sm",
  md: "kbd-key--md",
  lg: "kbd-key--lg",
}

/**
 * Splits a plain string shortcut like "⌘K" or "⌃⇧P" into individual
 * key tokens. If the string contains ASCII letters/digits only separated
 * by a known separator character we split on that; otherwise we treat
 * each Unicode character as its own token.
 */
function splitKeys(keys: string, separator: string): string[] {
  if (separator && keys.includes(separator)) {
    return keys.split(separator).map((k) => k.trim()).filter(Boolean)
  }
  // Split on common ASCII separators even when separator prop differs
  if (keys.includes("+") || keys.includes("-")) {
    const parts = keys.split(/[+\-]/).map((k) => k.trim()).filter(Boolean)
    if (parts.length > 1) return parts
  }
  // Treat each Unicode grapheme as a separate key token (e.g. "⌘K" → ["⌘", "K"])
  // Using Array.from handles surrogate pairs and multi-codepoint chars safely.
  const chars = Array.from(keys)
  return chars.length > 1 ? chars : [keys]
}

export function KbdKey({
  keys,
  separator = "+",
  size = "md",
  className,
}: KbdKeyProps) {
  const tokens: string[] =
    Array.isArray(keys) ? keys : splitKeys(keys, separator)

  return (
    <span
      className={clsx("kbd-key-group", className)}
      // Compose a readable label for screen readers
      aria-label={tokens.join(" ")}
      // Prevent the separator from being read aloud — it's decorative
      aria-hidden={undefined}
      dir="ltr" // keyboard shortcuts are always LTR regardless of page direction
    >
      {tokens.map((token, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="kbd-key-separator" aria-hidden="true">
              {separator}
            </span>
          )}
          <kbd className={clsx("kbd-key", SIZE_CLASSES[size])}>
            {token}
          </kbd>
        </React.Fragment>
      ))}
    </span>
  )
}

/*
  CSS (add to your global stylesheet or CSS module):

  .kbd-key-group {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-0-5, 2px);
    /* dir="ltr" is set inline so the group always reads left-to-right */
  }

  .kbd-key-separator {
    color: var(--color-text-muted, var(--color-neutral-500));
    font-size: var(--font-size-xs, 0.75rem);
    user-select: none;
    padding-inline: var(--spacing-0-5, 2px);
  }

  .kbd-key {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-family-mono, ui-monospace, monospace);
    font-weight: var(--font-weight-medium, 500);
    line-height: 1;
    white-space: nowrap;
    border-radius: var(--radius-xs, 3px);
    background-color: var(--color-kbd-bg, var(--color-neutral-100));
    color: var(--color-kbd-fg, var(--color-neutral-800));
    border: 1px solid var(--color-kbd-border, var(--color-neutral-300));
    border-block-end-width: 2px; /* physical bottom border for keycap look */
    box-shadow: var(--shadow-kbd, inset 0 -1px 0 var(--color-kbd-shadow, var(--color-neutral-300)));
    user-select: none;
  }

  /* Size variants */
  .kbd-key--sm {
    font-size: var(--font-size-2xs, 0.625rem);
    padding-block: var(--spacing-0-5, 2px);
    padding-inline: var(--spacing-1, 4px);
    min-width: 1.25rem;
  }

  .kbd-key--md {
    font-size: var(--font-size-xs, 0.75rem);
    padding-block: var(--spacing-1, 4px);
    padding-inline: var(--spacing-1-5, 6px);
    min-width: 1.5rem;
  }

  .kbd-key--lg {
    font-size: var(--font-size-sm, 0.875rem);
    padding-block: var(--spacing-1-5, 6px);
    padding-inline: var(--spacing-2, 8px);
    min-width: 2rem;
  }

  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    .kbd-key {
      background-color: var(--color-kbd-bg, var(--color-neutral-800));
      color: var(--color-kbd-fg, var(--color-neutral-100));
      border-color: var(--color-kbd-border, var(--color-neutral-600));
      box-shadow: var(--shadow-kbd, inset 0 -1px 0 var(--color-kbd-shadow, var(--color-neutral-600)));
    }
  }

  /* RTL host pages: the group itself has dir="ltr" so the key order is
     always correct. The surrounding text flow is unaffected. */
*/
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
