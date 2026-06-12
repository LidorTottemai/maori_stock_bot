# TextReveal

> **קטגוריה:** motion
> **תלויות:** framer-motion
> **Storybook:** src/stories/motion/TextReveal.stories.tsx
> **קוד:** src/motion/TextReveal.tsx
> **עלות בנייה:** ~30 דקות

## מה זה
חושף טקסט מילה-מילה עם אנימציית slice מלמטה. כל מילה מוגנת ב-`overflow:hidden` כך שהtekst עולה מתוך הcontainer ויוצר מראה של כתיבה חיה. מתאים לכותרות ראשיות, תגיות עמוד, וכל טקסט שצריך להרגיש מוחשי ופרימיום. לא מתאים לפסקאות ארוכות.

## אנימציה — איך זה עובד
הטקסט מפוצל למילים. כל מילה עטופה ב-`<span style={{ overflow:"hidden", display:"inline-block" }}>`. בתוכה span פנימי שמתחיל ב-`y: "110%"` ומגיע ל-`y: 0`. ה-stagger מחושב עם `transition.delay = index * stagger`. האיזינג הוא custom cubic bezier `[0.22, 1, 0.36, 1]` (expo out) שנותן תחושת קפיצה אורגנית. `once: true` מונע חזרה בגלילה.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | משפט קצר עם stagger ברירת מחדל 0.07s |
| FastStagger | stagger 0.03s — מהיר יותר, מתאים לכותרות קצרות |
| SlowStagger | stagger 0.12s — דרמטי, מתאים לציטוטים |
| WithDelay | delay 0.5s — ממתין לפני שמתחיל |
| LongText | שורות מרובות — בדיקת עטיפה |
| DarkBackground | על רקע כהה |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| text | string | — | הטקסט לחשיפה (חובה) |
| className | string | undefined | class נוסף על הwrapper |
| delay | number | 0 | עיכוב בשניות לפני תחילת האנימציה |
| stagger | number | 0.07 | זמן בשניות בין מילה למילה |
| ease | [number,number,number,number] | [0.22,1,0.36,1] | cubic bezier לאיזינג |
| duration | number | 0.7 | משך האנימציה לכל מילה בשניות |
| as | keyof JSX.IntrinsicElements | "p" | אלמנט HTML לרינדור (h1, h2, span וכו') |

## שימוש
```tsx
import { TextReveal } from "@tottemai/ui"

// שימוש בסיסי
<TextReveal text="אנחנו בונים את העתיד" as="h1" />

// עם stagger מהיר וdelay
<TextReveal
  text="Welcome to the future of design"
  as="h2"
  delay={0.3}
  stagger={0.05}
  className="text-4xl font-bold"
/>
```

## קוד מלא
```tsx
"use client"
// src/motion/TextReveal.tsx
import { motion, useInView } from "motion/react"
import { useRef, useMemo } from "react"

interface TextRevealProps {
  text: string
  className?: string
  delay?: number
  stagger?: number
  ease?: [number, number, number, number]
  duration?: number
  as?: keyof JSX.IntrinsicElements
}

export function TextReveal({
  text,
  className,
  delay = 0,
  stagger = 0.07,
  ease = [0.22, 1, 0.36, 1],
  duration = 0.7,
  as: Tag = "p",
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref as React.RefObject<Element>, {
    once: true,
    margin: "-80px",
  })

  const words = useMemo(() => text.split(" "), [text])

  return (
    <Tag ref={ref as any} className={className} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          style={{
            overflow: "hidden",
            display: "inline-block",
            marginRight: "0.25em",
          }}
        >
          <motion.span
            aria-hidden="true"
            initial={{ y: "110%" }}
            animate={isInView ? { y: "0%" } : { y: "110%" }}
            transition={{
              duration,
              delay: delay + i * stagger,
              ease,
            }}
            style={{ display: "inline-block" }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
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
