# TextReveal

> **קטגוריה:** motion
> **תלויות:** framer-motion
> **Storybook:** src/stories/motion/TextReveal.stories.tsx
> **קוד:** src/motion/TextReveal.tsx
> **עלות בנייה:** ~30 דקות

## מה זה
חשיפת טקסט מילה-מילה בכניסה לעמוד. כל מילה עטופה בקונטיינר עם `overflow:hidden`, והספאן הפנימי עולה מלמטה (y:110%→0). מתאים לכותרות ראשיות, לייבלים גדולים ולטקסטי hero. נותן תחושה של טקסט שנחשף בצורה קינמטית.

## אנימציה — איך זה עובד
1. הטקסט מפוצל למילים עם `split(" ")`
2. כל מילה עטופה ב-`<span style={{ overflow:"hidden", display:"inline-block" }}`
3. ספאן פנימי מתחיל ב-`y:"110%"` (מחוץ לקונטיינר, בלתי-נראה)
4. `motion.span` מאניממ ל-`y:0` עם stagger על כל מילה
5. `viewport once:true` — מופעל פעם אחת בכניסה לview

```
word container [overflow:hidden]
  └── inner span: y: 110% → 0
```

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | ביטוי אחד, stagger ברירת מחדל 0.07s |
| SlowStagger | stagger=0.15s, אנימציה איטית ומושכת |
| Delayed | delay=0.5s, מחכה לפני התחלה |
| LongText | משפט ארוך עם הרבה מילים |
| CustomEase | ease שונה, תחושת bounce קל |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| text | string | — | הטקסט להצגה (required) |
| className | string | "" | CSS class נוסף על ה-wrapper |
| delay | number | 0 | עיכוב לפני תחילת האנימציה (שניות) |
| stagger | number | 0.07 | עיכוב בין מילה למילה (שניות) |
| ease | number[] | [0.22,1,0.36,1] | cubic-bezier curve |
| duration | number | 0.8 | משך האנימציה של כל מילה (שניות) |
| as | ElementType | "p" | תג ה-HTML של ה-wrapper |

## שימוש
```tsx
import { TextReveal } from "@tottemai/ui"

<TextReveal
  text="Building the future of web"
  stagger={0.07}
  delay={0.2}
  as="h1"
  className="text-5xl font-bold"
/>
```

## קוד מלא
```tsx
"use client"
// src/motion/TextReveal.tsx
import { motion, useInView } from "motion/react"
import { useRef, ElementType } from "react"

interface TextRevealProps {
  text: string
  className?: string
  delay?: number
  stagger?: number
  ease?: [number, number, number, number]
  duration?: number
  as?: ElementType
}

export function TextReveal({
  text,
  className = "",
  delay = 0,
  stagger = 0.07,
  ease = [0.22, 1, 0.36, 1],
  duration = 0.8,
  as: Tag = "p",
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref as React.RefObject<Element>, {
    once: true,
    margin: "-80px",
  })

  const words = text.split(" ")

  const prefersReduced =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            overflow: "hidden",
            verticalAlign: "bottom",
            marginRight: "0.25em",
          }}
        >
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: "110%" }}
            animate={isInView ? { y: "0%" } : { y: "110%" }}
            transition={
              prefersReduced
                ? { duration: 0 }
                : {
                    duration,
                    delay: delay + i * stagger,
                    ease,
                  }
            }
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
