# CharReveal

> **קטגוריה:** motion
> **תלויות:** framer-motion
> **Storybook:** src/stories/motion/CharReveal.stories.tsx
> **קוד:** src/motion/CharReveal.tsx
> **עלות בנייה:** ~30 דקות

## מה זה
חשיפת טקסט תו-תו — דרמטי יותר מ-TextReveal. כל תו עולה מלמטה בנפרד עם stagger של 0.03s. מיועד לכותרות hero גדולות, לוגואים מונפשים ומקומות שבהם רוצים רושם ראשוני חזק. **לא מתאים לגוש טקסט ארוך** — רק לכותרות קצרות.

## אנימציה — איך זה עובד
1. הטקסט מפוצל לתווים עם `split("")`
2. רווחים מקבלים `&nbsp;` כדי לשמור עליהם
3. כל תו עטוף ב-`<span style={{ overflow:"hidden" }}`
4. ספאן פנימי מתחיל ב-`y:"110%"` + `opacity:0`
5. stagger של 0.03s בין תו לתו
6. `useInView` עם `once:true` מפעיל את הסדרה

```
char container [overflow:hidden]
  └── inner span: y: 110%, opacity: 0 → y: 0, opacity: 1
```

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | מילה בודדת, stagger 0.03s |
| HeroHeading | כותרת ארוכה, טקסט גדול |
| WithOpacity | כולל fade-in על כל תו |
| FastReveal | stagger=0.015s, חשיפה מהירה |
| Scramble | אפקט extra: תווים rנ"ד לפני settle (variant מתקדם) |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| text | string | — | הטקסט להצגה (required) |
| className | string | "" | CSS class נוסף על ה-wrapper |
| delay | number | 0 | עיכוב לפני תחילת האנימציה (שניות) |
| stagger | number | 0.03 | עיכוב בין תו לתו (שניות) |
| ease | number[] | [0.22,1,0.36,1] | cubic-bezier curve |
| duration | number | 0.6 | משך האנימציה של כל תו (שניות) |
| as | ElementType | "h2" | תג ה-HTML של ה-wrapper |
| withOpacity | boolean | true | האם לכלול fade-in |

## שימוש
```tsx
import { CharReveal } from "@tottemai/ui"

<CharReveal
  text="Hello World"
  stagger={0.03}
  delay={0}
  as="h1"
  className="text-8xl font-black tracking-tight"
/>
```

## קוד מלא
```tsx
"use client"
// src/motion/CharReveal.tsx
import { motion, useInView } from "motion/react"
import { useRef, ElementType } from "react"

interface CharRevealProps {
  text: string
  className?: string
  delay?: number
  stagger?: number
  ease?: [number, number, number, number]
  duration?: number
  as?: ElementType
  withOpacity?: boolean
}

export function CharReveal({
  text,
  className = "",
  delay = 0,
  stagger = 0.03,
  ease = [0.22, 1, 0.36, 1],
  duration = 0.6,
  as: Tag = "h2",
  withOpacity = true,
}: CharRevealProps) {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref as React.RefObject<Element>, {
    once: true,
    margin: "-80px",
  })

  const prefersReduced =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false

  // Split into chars, preserving spaces
  const chars = text.split("")
  let charIndex = 0

  // Group chars into words so spaces render correctly
  const words = text.split(" ")

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((word, wordIdx) => (
        <span key={wordIdx} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
          {word.split("").map((char) => {
            const currentIndex = charIndex++
            return (
              <span
                key={currentIndex}
                style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}
              >
                <motion.span
                  style={{ display: "inline-block" }}
                  initial={{ y: "110%", opacity: withOpacity ? 0 : 1 }}
                  animate={
                    isInView
                      ? { y: "0%", opacity: 1 }
                      : { y: "110%", opacity: withOpacity ? 0 : 1 }
                  }
                  transition={
                    prefersReduced
                      ? { duration: 0 }
                      : {
                          duration,
                          delay: delay + currentIndex * stagger,
                          ease,
                        }
                  }
                >
                  {char}
                </motion.span>
              </span>
            )
          })}
          {/* Space between words — not animated */}
          {wordIdx < words.length - 1 && (
            <span style={{ display: "inline-block" }}>&nbsp;</span>
          )}
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
