# ScrollReveal

> **קטגוריה:** motion
> **תלויות:** framer-motion
> **Storybook:** src/stories/motion/ScrollReveal.stories.tsx
> **קוד:** src/motion/ScrollReveal.tsx
> **עלות בנייה:** ~30 דקות

## מה זה
עוטף כל תוכן ומוסיף אנימציית fade + slide כשהאלמנט נכנס לviewport. עובד עם כיוונים: up, down, left, right. מתאים לקארדים, סקשנים, תמונות וכל אלמנט שרוצים להדגיש בגלילה. ה-wrapper שקוף לחלוטין מבחינת עיצוב — כל הסטיילינג מגיע מה-children.

## אנימציה — איך זה עובד
1. `whileInView` מגדיר את הstate הסופי `{ opacity:1, x:0, y:0 }`
2. `initial` מחושב לפי `direction` + `distance`
3. `viewport={{ once: true, margin: "-80px" }}` — מופעל פעם אחת, מעט לפני שהאלמנט נכנס למסך
4. `ease: [0.22,1,0.36,1]` — expo-like ease out

```
direction: "up"   → initial: { y: +distance, opacity: 0 }
direction: "down" → initial: { y: -distance, opacity: 0 }
direction: "left" → initial: { x: +distance, opacity: 0 }
direction: "right"→ initial: { x: -distance, opacity: 0 }
```

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Up | fade+slide מלמטה (ברירת מחדל) |
| Down | fade+slide מלמעלה |
| Left | fade+slide משמאל |
| Right | fade+slide מימין |
| Staggered | רשימת קארדים, כל אחד delayed |
| LargeDistance | distance=100px, תנועה דרמטית יותר |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | — | תוכן לעטוף (required) |
| direction | "up" \| "down" \| "left" \| "right" | "up" | כיוון הslide |
| distance | number | 40 | מרחק הslide בpixels |
| delay | number | 0 | עיכוב לפני האנימציה (שניות) |
| duration | number | 0.7 | משך האנימציה (שניות) |
| ease | number[] | [0.22,1,0.36,1] | cubic-bezier curve |
| className | string | "" | CSS class על ה-wrapper |
| margin | string | "-80px" | viewport intersection margin |

## שימוש
```tsx
import { ScrollReveal } from "@tottemai/ui"

<ScrollReveal direction="up" delay={0.1}>
  <Card title="Feature" description="Some feature description" />
</ScrollReveal>

{/* Staggered list */}
{items.map((item, i) => (
  <ScrollReveal key={item.id} direction="up" delay={i * 0.1}>
    <FeatureCard {...item} />
  </ScrollReveal>
))}
```

## קוד מלא
```tsx
"use client"
// src/motion/ScrollReveal.tsx
import { motion } from "motion/react"
import { ReactNode } from "react"

type Direction = "up" | "down" | "left" | "right"

interface ScrollRevealProps {
  children: ReactNode
  direction?: Direction
  distance?: number
  delay?: number
  duration?: number
  ease?: [number, number, number, number]
  className?: string
  margin?: string
}

function getInitial(direction: Direction, distance: number) {
  switch (direction) {
    case "up":
      return { opacity: 0, y: distance }
    case "down":
      return { opacity: 0, y: -distance }
    case "left":
      return { opacity: 0, x: distance }
    case "right":
      return { opacity: 0, x: -distance }
  }
}

export function ScrollReveal({
  children,
  direction = "up",
  distance = 40,
  delay = 0,
  duration = 0.7,
  ease = [0.22, 1, 0.36, 1],
  className = "",
  margin = "-80px",
}: ScrollRevealProps) {
  const prefersReduced =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false

  const initial = prefersReduced
    ? { opacity: 0 }
    : getInitial(direction, distance)

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin }}
      transition={
        prefersReduced
          ? { duration: 0.15 }
          : { duration, delay, ease }
      }
    >
      {children}
    </motion.div>
  )
}
```

## בדיקות סיום
- [ ] אנימציה פועלת בdevelopment
- [ ] prefers-reduced-motion מבטל אנימציות
- [ ] אין JS errors בconsole
- [ ] CSS variables בלבד (אין hexcodes קשיחים)
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
