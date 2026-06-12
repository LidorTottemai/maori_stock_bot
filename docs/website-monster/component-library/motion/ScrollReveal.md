# ScrollReveal

> **קטגוריה:** motion
> **תלויות:** framer-motion
> **Storybook:** src/stories/motion/ScrollReveal.stories.tsx
> **קוד:** src/motion/ScrollReveal.tsx
> **עלות בנייה:** ~30 דקות

## מה זה
עוטף כל תוכן ומוסיף אנימציית fade+slide כשהאלמנט נכנס לviewport. זה הcomponent הכי שימושי בספרייה — אפשר לעטוף בו כרטיסים, כותרות, תמונות, רשימות. מתאים לכל עמוד שצריך תחושת גילוי בגלילה. כיוון האנימציה (up/down/left/right) מאפשר גיוון ויזואלי בין סקשנים שונים.

## אנימציה — איך זה עובד
`whileInView` של framer-motion מפעיל אנימציה כש-80px מהאלמנט נכנסים לviewport (`margin: "-80px"`). `viewport={{ once: true }}` מונע חזרה. המצב ההתחלתי מחושב לפי `direction`: up→`y: distance`, down→`y: -distance`, left→`x: distance`, right→`x: -distance`. תמיד גם `opacity: 0`. המצב הסופי הוא `{ x: 0, y: 0, opacity: 1 }`. ease `[0.22, 1, 0.36, 1]`.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | fade+slide מלמטה, 40px |
| DirectionUp | מלמעלה למטה |
| DirectionLeft | מימין לשמאל |
| DirectionRight | משמאל לימין |
| CustomDistance | distance 80px — נסיעה ארוכה |
| WithDelay | delay 0.2s לstagger ידני בין elements |
| Grid | 4 כרטיסים עם delay גדל ב-0.1s לכל אחד |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | React.ReactNode | — | התוכן לעטוף (חובה) |
| direction | "up" \| "down" \| "left" \| "right" | "up" | כיוון תנועת הכניסה |
| distance | number | 40 | מרחק בפיקסלים להזזה ההתחלתית |
| delay | number | 0 | עיכוב בשניות |
| duration | number | 0.6 | משך האנימציה בשניות |
| className | string | undefined | class נוסף על הwrapper |
| ease | [number,number,number,number] | [0.22,1,0.36,1] | cubic bezier לאיזינג |

## שימוש
```tsx
import { ScrollReveal } from "@tottemai/ui"

// כרטיס בסיסי
<ScrollReveal>
  <Card />
</ScrollReveal>

// רשת עם stagger
{items.map((item, i) => (
  <ScrollReveal key={item.id} delay={i * 0.1} direction="up">
    <ProjectCard {...item} />
  </ScrollReveal>
))}

// slide מהצד
<ScrollReveal direction="left" distance={60}>
  <FeatureSection />
</ScrollReveal>
```

## קוד מלא
```tsx
"use client"
// src/motion/ScrollReveal.tsx
import { motion } from "motion/react"

interface ScrollRevealProps {
  children: React.ReactNode
  direction?: "up" | "down" | "left" | "right"
  distance?: number
  delay?: number
  duration?: number
  className?: string
  ease?: [number, number, number, number]
}

function getInitial(
  direction: "up" | "down" | "left" | "right",
  distance: number
): { x?: number; y?: number; opacity: number } {
  switch (direction) {
    case "up":
      return { y: distance, opacity: 0 }
    case "down":
      return { y: -distance, opacity: 0 }
    case "left":
      return { x: distance, opacity: 0 }
    case "right":
      return { x: -distance, opacity: 0 }
  }
}

export function ScrollReveal({
  children,
  direction = "up",
  distance = 40,
  delay = 0,
  duration = 0.6,
  className,
  ease = [0.22, 1, 0.36, 1],
}: ScrollRevealProps) {
  const initial = getInitial(direction, distance)

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{ x: 0, y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration, delay, ease }}
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
