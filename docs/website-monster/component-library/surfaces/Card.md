# Card

> **קטגוריה:** surfaces
> **תלויות:** none (native HTML)
> **Storybook:** src/stories/Card.stories.tsx
> **קוד:** src/surfaces/Card.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
קומפוננטת Card היא משטח מכיל גמיש עם תמיכה בתת-קומפוננטות (CardHeader, CardBody, CardFooter). מתאימה להצגת תוכן מקובץ עם מגוון עיצובים: ברירת מחדל, גבול, מוגבה ורפאים. כוללת אפקט ריחוף עם הרמה עדינה.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | כרטיס רגיל עם רקע ופינות מעוגלות |
| Bordered | גבול גלוי ללא צל |
| Elevated | צל מוגבה עם הרמה בריחוף |
| Ghost | שקוף ללא רקע, גבול דקיק |
| WithHeader | כרטיס עם CardHeader, CardBody, CardFooter |
| Interactive | כרטיס לחיץ עם cursor pointer |

## Props API / Return Value
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `"default" \| "bordered" \| "elevated" \| "ghost"` | `"default"` | סגנון הכרטיס |
| hover | `boolean` | `false` | הפעלת אפקט ריחוף עם הרמה |
| as | `React.ElementType` | `"div"` | אלמנט HTML בסיסי |
| className | `string` | `""` | CSS נוסף |
| children | `React.ReactNode` | — | תוכן הכרטיס |

### CardHeader Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| className | `string` | `""` | CSS נוסף |
| children | `React.ReactNode` | — | תוכן ה-header |

### CardBody Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| className | `string` | `""` | CSS נוסף |
| children | `React.ReactNode` | — | תוכן ה-body |

### CardFooter Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| className | `string` | `""` | CSS נוסף |
| children | `React.ReactNode` | — | תוכן ה-footer |

## שימוש בסיסי
\`\`\`tsx
import { Card, CardHeader, CardBody, CardFooter } from "@tottemai/ui"

<Card variant="elevated" hover>
  <CardHeader>
    <h3>כותרת</h3>
  </CardHeader>
  <CardBody>
    <p>תוכן הכרטיס</p>
  </CardBody>
  <CardFooter>
    <button>פעולה</button>
  </CardFooter>
</Card>
\`\`\`

## קוד מלא
\`\`\`tsx
import * as React from "react"

// ─── Types ───────────────────────────────────────────────────────────────────

type CardVariant = "default" | "bordered" | "elevated" | "ghost"

interface CardProps extends React.HTMLAttributes<HTMLElement> {
  variant?: CardVariant
  hover?: boolean
  as?: React.ElementType
}

interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

// ─── Style maps ──────────────────────────────────────────────────────────────

const variantStyles: Record<CardVariant, React.CSSProperties> = {
  default: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    boxShadow: "var(--shadow-sm)",
  },
  bordered: {
    background: "var(--color-surface)",
    border: "2px solid var(--color-border-strong)",
    boxShadow: "none",
  },
  elevated: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    boxShadow: "var(--shadow-md)",
  },
  ghost: {
    background: "transparent",
    border: "1px solid var(--color-border-subtle)",
    boxShadow: "none",
  },
}

// ─── Card ────────────────────────────────────────────────────────────────────

const Card = React.forwardRef<HTMLElement, CardProps>(
  (
    {
      variant = "default",
      hover = false,
      as: Tag = "div",
      className = "",
      style,
      children,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false)

    const baseStyle: React.CSSProperties = {
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      transition:
        "transform var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)",
      ...variantStyles[variant],
      ...(hover && isHovered
        ? {
            transform: "translateY(-4px)",
            boxShadow: "var(--shadow-lg)",
          }
        : {}),
      ...style,
    }

    return (
      <Tag
        ref={ref}
        className={className}
        style={baseStyle}
        onMouseEnter={hover ? () => setIsHovered(true) : undefined}
        onMouseLeave={hover ? () => setIsHovered(false) : undefined}
        {...props}
      >
        {children}
      </Tag>
    )
  }
)

Card.displayName = "Card"

// ─── CardHeader ──────────────────────────────────────────────────────────────

const CardHeader = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className = "", style, children, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      style={{
        padding: "var(--spacing-4) var(--spacing-6)",
        borderBottom: "1px solid var(--color-border)",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
)

CardHeader.displayName = "CardHeader"

// ─── CardBody ────────────────────────────────────────────────────────────────

const CardBody = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className = "", style, children, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      style={{
        padding: "var(--spacing-6)",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
)

CardBody.displayName = "CardBody"

// ─── CardFooter ──────────────────────────────────────────────────────────────

const CardFooter = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className = "", style, children, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      style={{
        padding: "var(--spacing-4) var(--spacing-6)",
        borderTop: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-3)",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
)

CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardBody, CardFooter }
export type { CardProps, CardSectionProps, CardVariant }
\`\`\`

## בדיקות סיום
- [ ] מרנדר בלי שגיאות
- [ ] כל ה-variants פועלים
- [ ] CSS variables בלבד
- [ ] Accessible
- [ ] RTL תמיכה
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
