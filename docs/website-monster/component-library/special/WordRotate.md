# WordRotate

> **קטגוריה:** special
> **תלויות:** framer-motion (motion/react)
> **Storybook:** src/stories/special/WordRotate.stories.tsx
> **קוד:** src/special/WordRotate.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
Rotating words — מציג מילה אחת בכל פעם, מחליף עם animation. `AnimatePresence` mode="wait". טוב ל-"אנחנו מתמחים ב-[**עיסוי / ספא / רפלקסולוגיה**]".

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| words | `string[]` | — | — |
| interval | `number` | `2500` | ms |
| animation | `'fade' \| 'slide' \| 'flip'` | `'slide'` | סוג האנימציה |
| className | `string` | — | — |

## שימוש
```tsx
import { WordRotate } from "@tottemai/ui"

<h1>
  אנחנו מתמחים ב-{" "}
  <WordRotate
    className="text-primary"
    words={["עיסוי שוודי", "ספא יוקרתי", "רפלקסולוגיה", "טיפולי פנים"]}
  />
</h1>
```

## קוד מלא
```tsx
"use client"
// src/special/WordRotate.tsx
import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "../cn"

const animations = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },
  slide: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  flip: {
    initial: { opacity: 0, rotateX: -90 },
    animate: { opacity: 1, rotateX: 0 },
    exit: { opacity: 0, rotateX: 90 },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

interface WordRotateProps {
  words: string[]
  interval?: number
  animation?: "fade" | "slide" | "flip"
  className?: string
}

export function WordRotate({ words, interval = 2500, animation = "slide", className }: WordRotateProps) {
  const [index, setIndex] = React.useState(0)
  const anim = animations[animation]

  React.useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % words.length), interval)
    return () => clearInterval(t)
  }, [words.length, interval])

  return (
    <span className={cn("word-rotate-wrapper", className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          className="word-rotate-word"
          initial={anim.initial}
          animate={anim.animate}
          exit={anim.exit}
          transition={anim.transition}
          style={{ display: "inline-block" }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
      <style>{`
        .word-rotate-wrapper { display: inline-block; position: relative; overflow: hidden; }
        @media (prefers-reduced-motion: reduce) { .word-rotate-word { animation: none !important; transition: none !important; } }
      `}</style>
    </span>
  )
}
```

## בדיקות סיום
- [ ] Words מתחלפות
- [ ] Fade / Slide / Flip animations
- [ ] prefers-reduced-motion
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
