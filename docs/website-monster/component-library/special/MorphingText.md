# MorphingText

> **קטגוריה:** special
> **תלויות:** framer-motion (motion/react)
> **Storybook:** src/stories/special/MorphingText.stories.tsx
> **קוד:** src/special/MorphingText.tsx
> **עלות בנייה:** ~30 דקות

## מה זה
טקסט שמתמרף בין מחרוזות עם SVG filter blur. `feGaussianBlur` stdDeviation משתנה → האותיות "מתפוצצות" ומתגבשות מחדש. אפקט ייחודי לhero headings.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| texts | `string[]` | — | — |
| interval | `number` | `3000` | ms |
| className | `string` | — | — |

## שימוש
```tsx
import { MorphingText } from "@tottemai/ui"

<MorphingText
  texts={["חדשני", "מרשים", "מקצועי", "ייחודי"]}
  className="text-display-xl font-bold"
/>
```

## קוד מלא
```tsx
"use client"
// src/special/MorphingText.tsx
import * as React from "react"
import { motion, animate, useMotionValue } from "motion/react"
import { cn } from "../cn"

interface MorphingTextProps {
  texts: string[]
  interval?: number
  className?: string
}

export function MorphingText({ texts, interval = 3000, className }: MorphingTextProps) {
  const [index, setIndex] = React.useState(0)
  const blurValue = useMotionValue(0)
  const [displayed, setDisplayed] = React.useState(texts[0])

  React.useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) return

    const t = setInterval(async () => {
      // Blur out
      await animate(blurValue, 20, { duration: 0.4, ease: "easeIn" })
      setIndex((i) => {
        const next = (i + 1) % texts.length
        setDisplayed(texts[next])
        return next
      })
      // Blur in
      await animate(blurValue, 0, { duration: 0.5, ease: "easeOut" })
    }, interval)

    return () => clearInterval(t)
  }, [texts, interval, blurValue])

  return (
    <>
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="morphing-blur">
            <motion.feGaussianBlur
              stdDeviation={blurValue as unknown as string}
              in="SourceGraphic"
              result="blur"
            />
          </filter>
        </defs>
      </svg>
      <span
        className={cn("morphing-text", className)}
        style={{ filter: "url(#morphing-blur)" }}
      >
        {displayed}
      </span>
    </>
  )
}
```

## בדיקות סיום
- [ ] Blur morph animation
- [ ] Texts מתחלפות
- [ ] prefers-reduced-motion: ללא blur
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
