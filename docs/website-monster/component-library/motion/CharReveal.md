# CharReveal

> **קטגוריה:** motion
> **תלויות:** framer-motion
> **Storybook:** src/stories/motion/CharReveal.stories.tsx
> **קוד:** src/motion/CharReveal.tsx
> **עלות בנייה:** ~30 דקות

## מה זה
חושף טקסט תו-תו — דרמטי יותר מ-TextReveal ומתאים לכותרות hero. כשכל אות מופיעה בנפרד, האפקט כבד ועוצמתי. מתאים ל-hero headings קצרות (עד 30 תווים), לוגואים אנימטיביים, ולמספרים גדולים. לא מתאים לטקסט ארוך — stagger של 0.03s על 100 תווים יקח 3 שניות.

## אנימציה — איך זה עובד
הטקסט מפוצל לתווים (כולל רווחים, שנשמרים כ-` `). כל תו עטוף ב-`overflow:hidden` span. ה-inner span עולה מ-`y: "110%"` + `opacity: 0` ל-`y: 0` + `opacity: 1`. stagger של 0.03s בין תו לתו. האיזינג `[0.22, 1, 0.36, 1]` זהה ל-TextReveal לעקביות ויזואלית. שימוש ב-`useInView` עם `margin: "-80px"` מפעיל את האנימציה כשהאלמנט נכנס לtviewport.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | כותרת קצרה, stagger 0.03s |
| HeroHeading | טקסט גדול על רקע כהה |
| SlowDramatic | stagger 0.06s, duration 0.9s — אפקט סינמטי |
| WithDelay | delay 0.8s — לאחרי pageTransition |
| Numbers | מספרים גדולים — מחיר / סטטיסטיקה |
| Colorful | כל תו בצבע שונה דרך className |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| text | string | — | הטקסט לחשיפה (חובה) |
| className | string | undefined | class נוסף על הwrapper |
| delay | number | 0 | עיכוב בשניות לפני תחילת האנימציה |
| stagger | number | 0.03 | זמן בשניות בין תו לתו |
| ease | [number,number,number,number] | [0.22,1,0.36,1] | cubic bezier לאיזינג |
| duration | number | 0.7 | משך האנימציה לכל תו בשניות |
| as | keyof JSX.IntrinsicElements | "h1" | אלמנט HTML לרינדור |

## שימוש
```tsx
import { CharReveal } from "@tottemai/ui"

// כותרת hero
<CharReveal text="Hello World" as="h1" className="text-6xl font-black" />

// עם delay אחרי page transition
<CharReveal
  text="Studio"
  as="h1"
  delay={0.4}
  stagger={0.04}
  duration={0.8}
  className="text-8xl font-bold tracking-tight"
/>
```

## קוד מלא
```tsx
"use client"
// src/motion/CharReveal.tsx
import { motion, useInView } from "motion/react"
import { useRef, useMemo } from "react"

interface CharRevealProps {
  text: string
  className?: string
  delay?: number
  stagger?: number
  ease?: [number, number, number, number]
  duration?: number
  as?: keyof JSX.IntrinsicElements
}

export function CharReveal({
  text,
  className,
  delay = 0,
  stagger = 0.03,
  ease = [0.22, 1, 0.36, 1],
  duration = 0.7,
  as: Tag = "h1",
}: CharRevealProps) {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref as React.RefObject<Element>, {
    once: true,
    margin: "-80px",
  })

  const chars = useMemo(
    () => text.split("").map((c) => (c === " " ? " " : c)),
    [text]
  )

  return (
    <Tag ref={ref as any} className={className} aria-label={text}>
      {chars.map((char, i) => (
        <span
          key={i}
          style={{
            overflow: "hidden",
            display: "inline-block",
          }}
        >
          <motion.span
            aria-hidden="true"
            initial={{ y: "110%", opacity: 0 }}
            animate={
              isInView
                ? { y: "0%", opacity: 1 }
                : { y: "110%", opacity: 0 }
            }
            transition={{
              duration,
              delay: delay + i * stagger,
              ease,
            }}
            style={{ display: "inline-block" }}
          >
            {char}
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
