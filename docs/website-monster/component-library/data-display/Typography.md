# Typography

> **קטגוריה:** data-display
> **תלויות:** react, clsx
> **Storybook:** src/stories/Typography.stories.tsx
> **קוד:** src/data-display/Typography.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
סקאלת כותרות (h1-h6 ממופות ל-display-2xl עד body), גודל רספונסיבי מבוסס clamp. מספקת מערכת טיפוגרפיה עקבית לכל האפליקציה, עם גדלי פונטים רספונסיביים שמשתנים בין מסך קטן לגדול ותמיכה מלאה ב-RTL.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Heading Scale | כל רמות הכותרות h1-h6 |
| Body Text | גדלי טקסט גוף: xl עד xs |
| Display | וריאנטי תצוגה גדולים לגיבורים |
| Truncated | טקסט עם גלישה וסיום ב-... |
| All Variants | כל הוריאנטים בדף אחד |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'display-2xl' \| 'display-xl' \| 'display-lg' \| 'display-md' \| 'display-sm' \| 'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6' \| 'body-xl' \| 'body-lg' \| 'body-md' \| 'body-sm' \| 'body-xs'` | `'body-md'` | וריאנט הטיפוגרפיה |
| as | `ElementType` | — | עקיפת תג HTML (ברירת מחדל לפי variant) |
| weight | `'regular' \| 'medium' \| 'semibold' \| 'bold'` | `'regular'` | עובי הפונט |
| color | `string` | — | CSS variable או ערך צבע |
| truncate | `boolean` | `false` | קיצור עם ellipsis |
| className | `string` | — | קלאס CSS נוסף |
| children | `ReactNode` | required | התוכן להצגה |

## שימוש בסיסי
```tsx
import { Typography } from "@tottemai/ui"

export default function Demo() {
  return (
    <div>
      <Typography variant="display-lg" weight="bold">
        כותרת גדולה
      </Typography>
      <Typography variant="h2" weight="semibold">
        כותרת משנה
      </Typography>
      <Typography variant="body-md">
        טקסט גוף רגיל עם גודל בינוני.
      </Typography>
      <Typography variant="body-sm" color="var(--color-text-muted)">
        הערה קטנה בצבע מאופק.
      </Typography>
      <Typography variant="body-lg" truncate>
        טקסט ארוך מאוד שייקצר עם שלוש נקודות בסוף השורה...
      </Typography>
    </div>
  )
}
```

## קוד מלא
```tsx
// src/data-display/Typography.tsx
import React from "react"
import clsx from "clsx"

export type TypographyVariant =
  | "display-2xl"
  | "display-xl"
  | "display-lg"
  | "display-md"
  | "display-sm"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "body-xl"
  | "body-lg"
  | "body-md"
  | "body-sm"
  | "body-xs"

export type TypographyWeight = "regular" | "medium" | "semibold" | "bold"

export interface TypographyProps {
  variant?: TypographyVariant
  as?: React.ElementType
  weight?: TypographyWeight
  color?: string
  truncate?: boolean
  className?: string
  children: React.ReactNode
  id?: string
  htmlFor?: string
}

// ── scale definitions ─────────────────────────────────────────────────────────
// Each entry: [defaultTag, clamp(min, preferred, max)]
// min/max in rem, preferred uses a vw-based fluid value

const variantMap: Record<
  TypographyVariant,
  { tag: React.ElementType; clamp: string; lineHeight: string; letterSpacing?: string }
> = {
  "display-2xl": {
    tag: "h1",
    clamp: "clamp(2.75rem, 5vw + 1rem, 4.5rem)",   // 44px → 72px
    lineHeight: "1.1",
    letterSpacing: "-0.02em",
  },
  "display-xl": {
    tag: "h1",
    clamp: "clamp(2.25rem, 4vw + 0.75rem, 3.75rem)", // 36px → 60px
    lineHeight: "1.15",
    letterSpacing: "-0.02em",
  },
  "display-lg": {
    tag: "h2",
    clamp: "clamp(1.875rem, 3.5vw + 0.5rem, 3rem)",  // 30px → 48px
    lineHeight: "1.2",
    letterSpacing: "-0.015em",
  },
  "display-md": {
    tag: "h2",
    clamp: "clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)", // 24px → 36px
    lineHeight: "1.25",
    letterSpacing: "-0.01em",
  },
  "display-sm": {
    tag: "h3",
    clamp: "clamp(1.25rem, 2vw + 0.25rem, 1.875rem)", // 20px → 30px
    lineHeight: "1.3",
    letterSpacing: "-0.01em",
  },
  h1: {
    tag: "h1",
    clamp: "clamp(1.75rem, 3vw + 0.5rem, 2.5rem)",   // 28px → 40px
    lineHeight: "1.2",
    letterSpacing: "-0.015em",
  },
  h2: {
    tag: "h2",
    clamp: "clamp(1.5rem, 2.5vw + 0.25rem, 2rem)",   // 24px → 32px
    lineHeight: "1.25",
    letterSpacing: "-0.01em",
  },
  h3: {
    tag: "h3",
    clamp: "clamp(1.25rem, 2vw + 0.25rem, 1.75rem)", // 20px → 28px
    lineHeight: "1.3",
  },
  h4: {
    tag: "h4",
    clamp: "clamp(1.125rem, 1.5vw + 0.25rem, 1.5rem)", // 18px → 24px
    lineHeight: "1.35",
  },
  h5: {
    tag: "h5",
    clamp: "clamp(1rem, 1vw + 0.25rem, 1.25rem)",    // 16px → 20px
    lineHeight: "1.4",
  },
  h6: {
    tag: "h6",
    clamp: "clamp(0.875rem, 0.75vw + 0.25rem, 1.125rem)", // 14px → 18px
    lineHeight: "1.45",
  },
  "body-xl": {
    tag: "p",
    clamp: "clamp(1.125rem, 1.25vw + 0.25rem, 1.25rem)", // 18px → 20px
    lineHeight: "1.6",
  },
  "body-lg": {
    tag: "p",
    clamp: "clamp(1rem, 1vw + 0.125rem, 1.125rem)",  // 16px → 18px
    lineHeight: "1.65",
  },
  "body-md": {
    tag: "p",
    clamp: "clamp(0.875rem, 0.75vw + 0.125rem, 1rem)", // 14px → 16px
    lineHeight: "1.7",
  },
  "body-sm": {
    tag: "p",
    clamp: "clamp(0.8125rem, 0.5vw + 0.125rem, 0.875rem)", // 13px → 14px
    lineHeight: "1.6",
  },
  "body-xs": {
    tag: "p",
    clamp: "clamp(0.6875rem, 0.375vw + 0.125rem, 0.75rem)", // 11px → 12px
    lineHeight: "1.5",
  },
}

// ── weight map ────────────────────────────────────────────────────────────────

const weightMap: Record<TypographyWeight, string> = {
  regular: "var(--font-weight-regular, 400)",
  medium: "var(--font-weight-medium, 500)",
  semibold: "var(--font-weight-semibold, 600)",
  bold: "var(--font-weight-bold, 700)",
}

// ── component ─────────────────────────────────────────────────────────────────

export function Typography({
  variant = "body-md",
  as,
  weight = "regular",
  color,
  truncate = false,
  className,
  children,
  id,
  htmlFor,
}: TypographyProps) {
  const def = variantMap[variant]
  const Tag = (as ?? def.tag) as React.ElementType

  const isHeading =
    variant.startsWith("display") ||
    variant === "h1" ||
    variant === "h2" ||
    variant === "h3" ||
    variant === "h4" ||
    variant === "h5" ||
    variant === "h6"

  const style: React.CSSProperties = {
    margin: 0,
    padding: 0,
    fontSize: def.clamp,
    lineHeight: def.lineHeight,
    fontWeight: weightMap[weight] as React.CSSProperties["fontWeight"],
    letterSpacing: def.letterSpacing,
    color: color ?? (isHeading ? "var(--color-text-heading, var(--color-text-primary, inherit))" : "var(--color-text-primary, inherit)"),
    fontFamily: isHeading
      ? "var(--font-family-heading, var(--font-family-base, inherit))"
      : "var(--font-family-base, inherit)",
    direction: "auto" as React.CSSProperties["direction"],
    ...(truncate
      ? {
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          display: "block",
          maxWidth: "100%",
        }
      : {}),
  }

  const extraProps: Record<string, unknown> = {}
  if (id) extraProps.id = id
  if (htmlFor) extraProps.htmlFor = htmlFor

  return (
    <Tag
      style={style}
      className={clsx(
        "tui-typography",
        `tui-typography--${variant}`,
        `tui-typography--${weight}`,
        { "tui-typography--truncate": truncate },
        className,
      )}
      {...extraProps}
    >
      {children}
    </Tag>
  )
}

export default Typography
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
