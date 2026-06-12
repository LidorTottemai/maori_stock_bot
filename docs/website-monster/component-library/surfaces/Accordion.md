# Accordion

> **קטגוריה:** surfaces
> **תלויות:** @radix-ui/react-accordion
> **Storybook:** src/stories/Accordion.stories.tsx
> **קוד:** src/surfaces/Accordion.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
קומפוננטת Accordion המבוססת על Radix UI. תומכת בפתיחת פריט בודד (single) או מספר פריטים בו-זמנית (multiple), עם אנימציית expand מוחלקת ואפשרות לאייקון trigger מותאם אישית.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Single | רק פריט אחד פתוח בכל פעם |
| Multiple | מספר פריטים פתוחים בו-זמנית |
| CustomIcon | Trigger עם אייקון חץ מותאם |
| DefaultOpen | פריט פתוח מראש |
| Disabled | פריט מושבת |

## Props API / Return Value
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | `"single" \| "multiple"` | `"single"` | מצב פתיחה |
| defaultValue | `string \| string[]` | `undefined` | ערך פתוח ברירת מחדל |
| value | `string \| string[]` | `undefined` | ערך נשלט |
| onValueChange | `(value) => void` | `undefined` | callback לשינוי ערך |
| collapsible | `boolean` | `true` | האם ניתן לסגור כולם (single בלבד) |
| className | `string` | `undefined` | class נוסף |

**AccordionItem Props**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `string` | — | מזהה ייחודי של הפריט |
| disabled | `boolean` | `false` | השבתת הפריט |

**AccordionTrigger Props**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| icon | `React.ReactNode` | ChevronDown | אייקון trigger מותאם |
| children | `React.ReactNode` | — | טקסט הכותרת |

**AccordionContent Props**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | `React.ReactNode` | — | תוכן הפריט |

## שימוש בסיסי
```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@tottemai/ui"

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>שאלה ראשונה</AccordionTrigger>
    <AccordionContent>תשובה לשאלה הראשונה</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>שאלה שנייה</AccordionTrigger>
    <AccordionContent>תשובה לשאלה השנייה</AccordionContent>
  </AccordionItem>
</Accordion>
```

## קוד מלא
```tsx
import * as RadixAccordion from "@radix-ui/react-accordion"
import React from "react"

// --- Keyframes injected once ---
const KEYFRAMES = `
@keyframes accordion-down {
  from { height: 0; opacity: 0; }
  to { height: var(--radix-accordion-content-height); opacity: 1; }
}
@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height); opacity: 1; }
  to { height: 0; opacity: 0; }
}
`

function injectKeyframes() {
  if (typeof document === "undefined") return
  if (document.getElementById("tottemai-accordion-kf")) return
  const style = document.createElement("style")
  style.id = "tottemai-accordion-kf"
  style.textContent = KEYFRAMES
  document.head.appendChild(style)
}

// Accordion root
interface AccordionProps {
  type?: "single" | "multiple"
  defaultValue?: string | string[]
  value?: string | string[]
  onValueChange?: ((value: string) => void) | ((value: string[]) => void)
  collapsible?: boolean
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

export function Accordion({
  type = "single",
  defaultValue,
  value,
  onValueChange,
  collapsible = true,
  className,
  style,
  children,
}: AccordionProps) {
  React.useEffect(() => { injectKeyframes() }, [])

  const sharedProps = {
    style: {
      width: "100%",
      border: "1px solid var(--accordion-border, var(--color-border))",
      borderRadius: "var(--accordion-radius, var(--radius-md, 8px))",
      overflow: "hidden",
      ...style,
    },
    className,
  }

  if (type === "multiple") {
    return (
      <RadixAccordion.Root
        type="multiple"
        defaultValue={defaultValue as string[] | undefined}
        value={value as string[] | undefined}
        onValueChange={onValueChange as ((value: string[]) => void) | undefined}
        {...sharedProps}
      >
        {children}
      </RadixAccordion.Root>
    )
  }

  return (
    <RadixAccordion.Root
      type="single"
      collapsible={collapsible}
      defaultValue={defaultValue as string | undefined}
      value={value as string | undefined}
      onValueChange={onValueChange as ((value: string) => void) | undefined}
      {...sharedProps}
    >
      {children}
    </RadixAccordion.Root>
  )
}

// AccordionItem
interface AccordionItemProps {
  value: string
  disabled?: boolean
  children: React.ReactNode
  className?: string
}

export function AccordionItem({ value, disabled, children, className }: AccordionItemProps) {
  return (
    <RadixAccordion.Item
      value={value}
      disabled={disabled}
      className={className}
      style={{
        borderBottom: "1px solid var(--accordion-border, var(--color-border))",
      }}
    >
      {children}
    </RadixAccordion.Item>
  )
}

// ChevronDown SVG
function ChevronDown() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{
        transition: "transform var(--duration-200, 200ms) var(--ease-out, ease-out)",
      }}
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// AccordionTrigger
interface AccordionTriggerProps {
  children: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

export function AccordionTrigger({ children, icon, className }: AccordionTriggerProps) {
  return (
    <RadixAccordion.Header style={{ margin: 0 }}>
      <RadixAccordion.Trigger
        className={className}
        style={{
          all: "unset",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "var(--accordion-trigger-padding, var(--spacing-4, 16px) var(--spacing-5, 20px))",
          fontSize: "var(--accordion-trigger-font-size, var(--text-base, 1rem))",
          fontWeight: "var(--accordion-trigger-font-weight, 500)",
          color: "var(--accordion-trigger-color, var(--color-text))",
          background: "var(--accordion-trigger-bg, transparent)",
          cursor: "pointer",
          boxSizing: "border-box",
        }}
      >
        {children}
        <span
          style={{
            display: "inline-flex",
            transition: "transform var(--duration-200, 200ms) var(--ease-out, ease-out)",
          }}
          // Radix adds data-state="open" on the parent trigger; rotate via CSS
          aria-hidden
        >
          {icon ?? <ChevronDown />}
        </span>
      </RadixAccordion.Trigger>
    </RadixAccordion.Header>
  )
}

// AccordionContent
interface AccordionContentProps {
  children: React.ReactNode
  className?: string
}

export function AccordionContent({ children, className }: AccordionContentProps) {
  return (
    <RadixAccordion.Content
      className={className}
      style={{
        overflow: "hidden",
        animationDuration: "var(--duration-300, 300ms)",
        animationTimingFunction: "var(--ease-out, ease-out)",
      }}
      // Radix adds data-state so we animate via inline style fallback
    >
      <div
        style={{
          padding: "var(--accordion-content-padding, var(--spacing-4, 16px) var(--spacing-5, 20px) var(--spacing-5, 20px))",
          color: "var(--accordion-content-color, var(--color-text-muted))",
          fontSize: "var(--accordion-content-font-size, var(--text-sm, 0.875rem))",
          lineHeight: "var(--accordion-content-line-height, 1.6)",
        }}
      >
        {children}
      </div>
    </RadixAccordion.Content>
  )
}
```

## בדיקות סיום
- [ ] מרנדר בלי שגיאות
- [ ] כל ה-variants פועלים
- [ ] CSS variables בלבד
- [ ] Accessible
- [ ] RTL תמיכה
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
