# Collapsible

> **קטגוריה:** surfaces
> **תלויות:** @radix-ui/react-collapsible
> **Storybook:** src/stories/Collapsible.stories.tsx
> **קוד:** src/surfaces/Collapsible.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
קומפוננטת Collapsible מבוססת Radix UI, מרחיבה ומכווצת תוכן עם אנימציה חלקה. מורכבת מ-Trigger (כפתור הפעלה) ו-Content (תוכן מוסתר). שימושית ל-FAQ, פאנלים מתכווצים, ותפריטי ניווט מורחבים.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | Collapsible בסיסי עם trigger ותוכן |
| DefaultOpen | פתוח כברירת מחדל |
| Controlled | מצב נשלט עם open/onOpenChange |
| WithAnimation | אנימציית גובה חלקה |
| Disabled | מצב מושבת |

## Props API / Return Value
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| open | `boolean` | `undefined` | מצב נשלט |
| defaultOpen | `boolean` | `false` | פתוח כברירת מחדל |
| onOpenChange | `(open: boolean) => void` | `undefined` | callback בשינוי |
| disabled | `boolean` | `false` | השבתת הכפתור |
| asChild | `boolean` | `false` | render ל-child |

### CollapsibleTrigger Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| asChild | `boolean` | `false` | render ל-child |
| children | `React.ReactNode` | — | תוכן הכפתור |

### CollapsibleContent Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| forceMount | `boolean` | `false` | render גם כשסגור (לנגישות) |
| children | `React.ReactNode` | — | תוכן המוסתר |

## שימוש בסיסי
\`\`\`tsx
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@tottemai/ui"

<Collapsible defaultOpen={false}>
  <CollapsibleTrigger asChild>
    <button>הצג פרטים נוספים</button>
  </CollapsibleTrigger>
  <CollapsibleContent>
    <p>תוכן נוסף שמוסתר בהתחלה</p>
  </CollapsibleContent>
</Collapsible>
\`\`\`

## קוד מלא
\`\`\`tsx
import * as React from "react"
import * as RadixCollapsible from "@radix-ui/react-collapsible"

// ─── Types ───────────────────────────────────────────────────────────────────

interface CollapsibleTriggerProps
  extends React.ComponentPropsWithoutRef<typeof RadixCollapsible.Trigger> {
  showIcon?: boolean
}

// ─── Root (re-export with display name) ─────────────────────────────────────

const Collapsible = RadixCollapsible.Root

// ─── CollapsibleTrigger ──────────────────────────────────────────────────────

const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof RadixCollapsible.Trigger>,
  CollapsibleTriggerProps
>(({ style, children, showIcon = true, ...props }, ref) => (
  <RadixCollapsible.Trigger
    ref={ref}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      padding: "var(--spacing-3) var(--spacing-4)",
      background: "none",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-md)",
      cursor: "pointer",
      fontSize: "var(--font-size-base)",
      fontWeight: "var(--font-weight-medium)",
      color: "var(--color-text)",
      textAlign: "start",
      transition: "background var(--duration-fast), border-color var(--duration-fast)",
      ...style,
    }}
    {...props}
  >
    {children}
    {showIcon && (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        data-collapsible-icon=""
        style={{ flexShrink: 0, transition: "transform var(--duration-normal) var(--ease-out)" }}
      >
        <path
          d="M4 6l4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </RadixCollapsible.Trigger>
))

CollapsibleTrigger.displayName = "CollapsibleTrigger"

// ─── CollapsibleContent ──────────────────────────────────────────────────────

const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof RadixCollapsible.Content>,
  React.ComponentPropsWithoutRef<typeof RadixCollapsible.Content>
>(({ style, children, ...props }, ref) => (
  <RadixCollapsible.Content
    ref={ref}
    style={{
      overflow: "hidden",
      ...style,
    }}
    {...props}
  >
    <div
      style={{
        padding: "var(--spacing-4)",
        color: "var(--color-text-muted)",
        fontSize: "var(--font-size-sm)",
        lineHeight: "var(--line-height-relaxed)",
      }}
    >
      {children}
    </div>
  </RadixCollapsible.Content>
))

CollapsibleContent.displayName = "CollapsibleContent"

/*
 * CSS for open/close animation and icon rotation:
 *
 * [data-radix-collapsible-content][data-state="open"] {
 *   animation: collapsible-down var(--duration-normal) var(--ease-out);
 * }
 * [data-radix-collapsible-content][data-state="closed"] {
 *   animation: collapsible-up var(--duration-normal) var(--ease-out);
 * }
 * [data-state="open"] [data-collapsible-icon] {
 *   transform: rotate(180deg);
 * }
 * @keyframes collapsible-down {
 *   from { height: 0 }
 *   to   { height: var(--radix-collapsible-content-height) }
 * }
 * @keyframes collapsible-up {
 *   from { height: var(--radix-collapsible-content-height) }
 *   to   { height: 0 }
 * }
 */

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
export type { CollapsibleTriggerProps }
\`\`\`

## בדיקות סיום
- [ ] מרנדר בלי שגיאות
- [ ] כל ה-variants פועלים
- [ ] CSS variables בלבד
- [ ] Accessible
- [ ] RTL תמיכה
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
