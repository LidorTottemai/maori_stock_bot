# Section

> **קטגוריה:** layout
> **תלויות:** none
> **Storybook:** src/stories/layout/Section.stories.tsx
> **קוד:** src/layout/Section.tsx
> **עלות בנייה:** ~10 דקות

## מה זה
Vertical spacing wrapper לסקציות בדף. מוסיף `padding-block` עקבי, background אופציונלי, overflow control. כל section בדף עוטף ב-`<Section>`.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | spacing בינוני |
| Small spacing | עבור hero sub-sections |
| Large spacing | עבור hero |
| With background | background שונה מ-body |
| With overflow hidden | לאפקטים שגולשים |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | vertical padding |
| bg | `string` | — | CSS var or color |
| overflowHidden | `boolean` | false | — |
| as | `ElementType` | `'section'` | — |
| className | `string` | — | — |

## שימוש בסיסי
```tsx
import { Section, Container, SectionTitle } from "@tottemai/ui"

<Section>
  <Container>
    <SectionTitle title="השירותים שלנו" />
    {/* content */}
  </Container>
</Section>

<Section bg="var(--color-surface)" size="lg">
  <Container>hero content</Container>
</Section>
```

## קוד מלא
```tsx
// src/layout/Section.tsx
import * as React from "react"
import { cn } from "../cn"

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  size?: "sm" | "md" | "lg"
  bg?: string
  overflowHidden?: boolean
  as?: React.ElementType
}

function Section({ size = "md", bg, overflowHidden, as: Tag = "section", style, className, children, ...props }: SectionProps) {
  return (
    <Tag
      className={cn("section", `section--${size}`, overflowHidden && "section--overflow-hidden", className)}
      style={{ background: bg, ...style }}
      {...props}
    >
      {children}
      <style>{`
        .section { position: relative; }
        .section--sm { padding-block: clamp(32px, 6vw, 64px); }
        .section--md { padding-block: clamp(48px, 8vw, 96px); }
        .section--lg { padding-block: clamp(64px, 12vw, 128px); }
        .section--overflow-hidden { overflow: hidden; }
      `}</style>
    </Tag>
  )
}

export { Section }
```

## בדיקות סיום
- [ ] Spacing responsive
- [ ] Background נכון
- [ ] CSS variables בלבד
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
