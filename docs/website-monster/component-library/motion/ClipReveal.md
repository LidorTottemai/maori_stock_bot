# ClipReveal

> **קטגוריה:** motion
> **תלויות:** framer-motion
> **Storybook:** src/stories/motion/ClipReveal.stories.tsx
> **קוד:** src/motion/ClipReveal.tsx
> **עלות בנייה:** ~30 דקות

## מה זה
חושף תוכן עם אנימציית clip-path — כאילו וילון מרים את עצמו מלמטה ומגלה את התוכן. האפקט חד ומדויק יותר מfade רגיל ומתאים לתמונות, כרטיסים גדולים, וסקשנים שלמים. יוצר תחושה של "לפתוח" תוכן. הבחירה ב-clip-path על פני overflow+translate היא שהוא עובד גם על תמונות עם border-radius ושומר על הצללים והגבולות.

## אנימציה — איך זה עובד
clip-path מתחיל ב-`inset(0 0 100% 0)` — מסתיר הכל ע"י חיתוך 100% מהתחתית. מסיים ב-`inset(0 0 0% 0)` — מראה הכל. `0.8s` עם ease `[0.76, 0, 0.24, 1]` (ease-in-out חזק) יוצר תנועה שמתחילה לאט, מאיצה באמצע, ומאטה בסוף. framer-motion מאנימט clip-path ישירות בCSS, ללא כפל דומיננטי.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | reveal מלמטה, 0.8s |
| FromTop | inset(100% 0 0% 0) → inset(0% 0 0% 0) — מלמעלה |
| FromLeft | inset(0 100% 0 0) → inset(0 0% 0 0) — מימין לשמאל |
| Image | על תמונה עם border-radius |
| WithDelay | delay 0.3s |
| SlowReveal | duration 1.4s — אפקט סינמטי |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | React.ReactNode | — | התוכן לחשיפה (חובה) |
| className | string | undefined | class נוסף על הwrapper |
| delay | number | 0 | עיכוב בשניות |
| duration | number | 0.8 | משך האנימציה בשניות |
| ease | [number,number,number,number] | [0.76,0,0.24,1] | cubic bezier לאיזינג |
| from | "bottom" \| "top" \| "left" \| "right" | "bottom" | כיוון החשיפה |

## שימוש
```tsx
import { ClipReveal } from "@tottemai/ui"

// תמונה עם clip reveal
<ClipReveal>
  <img src="/hero.jpg" alt="Hero" className="w-full rounded-2xl" />
</ClipReveal>

// כרטיס עם delay
<ClipReveal delay={0.2} duration={1.0}>
  <div className="bg-[var(--color-surface)] p-8 rounded-xl">
    <h2>פרויקט מיוחד</h2>
  </div>
</ClipReveal>

// reveal מלמעלה
<ClipReveal from="top">
  <HeroSection />
</ClipReveal>
```

## קוד מלא
```tsx
"use client"
// src/motion/ClipReveal.tsx
import { motion, useInView } from "motion/react"
import { useRef } from "react"

type ClipDirection = "bottom" | "top" | "left" | "right"

interface ClipRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  ease?: [number, number, number, number]
  from?: ClipDirection
}

function getClipPath(from: ClipDirection): { hidden: string; visible: string } {
  switch (from) {
    case "bottom":
      return {
        hidden: "inset(0 0 100% 0)",
        visible: "inset(0 0 0% 0)",
      }
    case "top":
      return {
        hidden: "inset(100% 0 0% 0)",
        visible: "inset(0% 0 0% 0)",
      }
    case "left":
      return {
        hidden: "inset(0 100% 0 0)",
        visible: "inset(0 0% 0 0)",
      }
    case "right":
      return {
        hidden: "inset(0 0 0 100%)",
        visible: "inset(0 0 0 0%)",
      }
  }
}

export function ClipReveal({
  children,
  className,
  delay = 0,
  duration = 0.8,
  ease = [0.76, 0, 0.24, 1],
  from = "bottom",
}: ClipRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const { hidden, visible } = getClipPath(from)

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ clipPath: hidden }}
      animate={isInView ? { clipPath: visible } : { clipPath: hidden }}
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
