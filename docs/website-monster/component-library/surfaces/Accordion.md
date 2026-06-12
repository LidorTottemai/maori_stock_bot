# Accordion

> **קטגוריה:** surfaces
> **תלויות:** @radix-ui/react-accordion
> **Storybook:** src/stories/Accordion.stories.tsx
> **קוד:** src/surfaces/Accordion.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
קומפוננטת Accordion מבוססת Radix UI, מאפשרת פתיחה של פסקה אחת או מרובות בו-זמנית. כוללת אנימציית התרחבות חלקה, אייקון חץ מסתובב, ונגישות מלאה מחוץ לקופסה.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| SingleOpen | רק פריט אחד פתוח בכל פעם |
| MultipleOpen | מרובה פריטים פתוחים בו-זמנית |
| DefaultOpen | פריט פתוח מראש בטעינה |
| CustomIcon | אייקון trigger מותאם אישית |
| Disabled | פריט מושבת |

## Props API / Return Value
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | `"single" \| "multiple"` | `"single"` | מצב פתיחה |
| defaultValue | `string \| string[]` | `undefined` | ערך פתוח כברירת מחדל |
| value | `string \| string[]` | `undefined` | ערך נשלט |
| onValueChange | `(value: string \| string[]) => void` | `undefined` | callback בשינוי |
| collapsible | `boolean` | `true` | אפשרות לסגור את הפריט הפתוח (רק ב-single) |
| className | `string` | `""` | CSS נוסף |

### AccordionItem Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `string` | — | מזהה ייחודי (חובה) |
| disabled | `boolean` | `false` | השבתת הפריט |

### AccordionTrigger Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| icon | `React.ReactNode` | `<ChevronDown>` | אייקון מותאם |
| children | `React.ReactNode` | — | טקסט הכותרת |

## שימוש בסיסי
\`\`\`tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@tottemai/ui"

<Accordion type="single" collapsible defaultValue="item-1">
  <AccordionItem value="item-1">
    <AccordionTrigger>שאלה ראשונה</AccordionTrigger>
    <AccordionContent>תשובה לשאלה הראשונה</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>שאלה שנייה</AccordionTrigger>
    <AccordionContent>תשובה לשאלה השנייה</AccordionContent>
  </AccordionItem>
</Accordion>
\`\`\`

## קוד מלא
\`\`\`tsx
import * as React from "react"
import * as RadixAccordion from "@radix-ui/react-accordion"

// ─── Types ───────────────────────────────────────────────────────────────────

interface AccordionTriggerProps extends React.ComponentPropsWithoutRef<typeof RadixAccordion.Trigger> {
  icon?: React.ReactNode
}

// ─── ChevronDown icon (inline, no extra dep) ─────────────────────────────────

function ChevronDownIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={style}
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Accordion (root) ────────────────────────────────────────────────────────

const Accordion = React.forwardRef<
  React.ElementRef<typeof RadixAccordion.Root>,
  React.ComponentPropsWithoutRef<typeof RadixAccordion.Root>
>(({ style, ...props }, ref) => (
  <RadixAccordion.Root
    ref={ref}
    style={{
      width: "100%",
      ...style,
    }}
    {...props}
  />
))

Accordion.displayName = "Accordion"

// ─── AccordionItem ───────────────────────────────────────────────────────────

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof RadixAccordion.Item>,
  React.ComponentPropsWithoutRef<typeof RadixAccordion.Item>
>(({ style, ...props }, ref) => (
  <RadixAccordion.Item
    ref={ref}
    style={{
      borderBottom: "1px solid var(--color-border)",
      ...style,
    }}
    {...props}
  />
))

AccordionItem.displayName = "AccordionItem"

// ─── AccordionTrigger ────────────────────────────────────────────────────────

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof RadixAccordion.Trigger>,
  AccordionTriggerProps
>(({ style, children, icon, ...props }, ref) => (
  <RadixAccordion.Header style={{ margin: 0 }}>
    <RadixAccordion.Trigger
      ref={ref}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        padding: "var(--spacing-4) 0",
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: "var(--font-size-base)",
        fontWeight: "var(--font-weight-medium)",
        color: "var(--color-text)",
        textAlign: "start",
        ...style,
      }}
      {...props}
    >
      {children}
      <span
        aria-hidden="true"
        style={{
          display: "inline-flex",
          flexShrink: 0,
          transition: "transform var(--duration-normal) var(--ease-out)",
        }}
        data-accordion-icon=""
      >
        {icon ?? <ChevronDownIcon />}
      </span>
    </RadixAccordion.Trigger>
  </RadixAccordion.Header>
))

AccordionTrigger.displayName = "AccordionTrigger"

// ─── AccordionContent ────────────────────────────────────────────────────────

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof RadixAccordion.Content>,
  React.ComponentPropsWithoutRef<typeof RadixAccordion.Content>
>(({ style, children, ...props }, ref) => (
  <RadixAccordion.Content
    ref={ref}
    style={{
      overflow: "hidden",
      ...style,
    }}
    {...props}
  >
    <div
      style={{
        paddingBottom: "var(--spacing-4)",
        color: "var(--color-text-muted)",
        fontSize: "var(--font-size-sm)",
        lineHeight: "var(--line-height-relaxed)",
      }}
    >
      {children}
    </div>
  </RadixAccordion.Content>
))

AccordionContent.displayName = "AccordionContent"

/*
 * CSS to add in your global stylesheet for the open/close animation:
 *
 * [data-radix-accordion-content] {
 *   animation: accordion-down var(--duration-normal) var(--ease-out);
 * }
 * [data-radix-accordion-content][data-state="closed"] {
 *   animation: accordion-up var(--duration-normal) var(--ease-out);
 * }
 * [data-radix-accordion-trigger][data-state="open"] [data-accordion-icon] {
 *   transform: rotate(180deg);
 * }
 * @keyframes accordion-down {
 *   from { height: 0 }
 *   to   { height: var(--radix-accordion-content-height) }
 * }
 * @keyframes accordion-up {
 *   from { height: var(--radix-accordion-content-height) }
 *   to   { height: 0 }
 * }
 */

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
export type { AccordionTriggerProps }
\`\`\`

## בדיקות סיום
- [ ] מרנדר בלי שגיאות
- [ ] כל ה-variants פועלים
- [ ] CSS variables בלבד
- [ ] Accessible
- [ ] RTL תמיכה
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
