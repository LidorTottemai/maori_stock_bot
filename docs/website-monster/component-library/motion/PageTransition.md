# PageTransition

> **קטגוריה:** motion
> **תלויות:** framer-motion
> **Storybook:** src/stories/motion/PageTransition.stories.tsx
> **קוד:** src/motion/PageTransition.tsx
> **עלות בנייה:** ~30 דקות

## מה זה
עוטף תוכן עמוד ומוסיף מעבר חלק בכניסה וביציאה. `AnimatePresence` עם `mode="wait"` מבטיח שהעמוד הישן יצא לגמרי לפני שהחדש נכנס. מתאים לכל Next.js app שרוצה navigation מלוטש. מוסיף ~400ms לכל מעבר — לא מעיק אבל מורגש. מניח שה-key של הcomponent משתנה בכל navigation.

## אנימציה — איך זה עובד
`AnimatePresence mode="wait"` שולט בתור: exit של העמוד הנוכחי → enter של העמוד הבא. Enter: `opacity:0, y:20` → `opacity:1, y:0`. Exit: `opacity:1, y:0` → `opacity:0, y:-20`. Y שונה (20 vs -20) יוצר תחושה של תנועה קדימה. ease `[0.22, 1, 0.36, 1]` על enter (expo out), ease `[0.76, 0, 0.24, 1]` על exit (expo in-out). 400ms לכל מצב.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | fade+slide, 400ms |
| SlideHorizontal | x:40→0 על enter, x:0→-40 על exit |
| FadeOnly | opacity בלבד, ללא y |
| SlowTransition | 700ms — דרמטי |
| FastTransition | 200ms — מינימלי |
| MultiPage | 3 עמודים עם כפתורי navigation |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | React.ReactNode | — | תוכן העמוד (חובה) |
| className | string | undefined | class נוסף על הwrapper |
| duration | number | 0.4 | משך כל phase (enter/exit) בשניות |

## שימוש
```tsx
import { PageTransition } from "@tottemai/ui"

// app/layout.tsx — Next.js App Router
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  )
}

// app/page.tsx — כל עמוד צריך key ייחודי
// Next.js App Router מטפל בזה אוטומטית עם pathname
```

## קוד מלא
```tsx
"use client"
// src/motion/PageTransition.tsx
import { AnimatePresence, motion } from "motion/react"
import { usePathname } from "next/navigation"

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
  duration?: number
}

export function PageTransition({
  children,
  className,
  duration = 0.4,
}: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        className={className}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
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
