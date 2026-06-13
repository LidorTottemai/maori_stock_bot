# SparklesText

> **קטגוריה:** special
> **תלויות:** framer-motion (motion/react)
> **Storybook:** src/stories/special/SparklesText.stories.tsx
> **קוד:** src/special/SparklesText.tsx
> **עלות בנייה:** ~25 דקות

## מה זה
טקסט עם ניצוצות/כוכבים צפים סביבו. קאנבס / SVG stars שמופיעים ונעלמים בזמנים אקראיים. מתאים לCTA כפתורים, כותרות premium.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | `ReactNode` | — | הטקסט |
| sparkleCount | `number` | `8` | כמות ניצוצות |
| colors | `string[]` | `["var(--color-primary)", "var(--color-accent)", "white"]` | — |
| size | `number` | `16` | max sparkle size px |
| className | `string` | — | — |

## שימוש
```tsx
import { SparklesText } from "@tottemai/ui"

<SparklesText>
  <span className="text-display-xl font-bold">קבע תור עכשיו</span>
</SparklesText>
```

## קוד מלא
```tsx
"use client"
// src/special/SparklesText.tsx
import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "../cn"

interface Sparkle { id: number; x: string; y: string; size: number; color: string }

function generateSparkle(colors: string[], size: number): Sparkle {
  return {
    id: Math.random(),
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    size: Math.floor(Math.random() * size + 4),
    color: colors[Math.floor(Math.random() * colors.length)],
  }
}

interface SparklesTextProps {
  sparkleCount?: number
  colors?: string[]
  size?: number
  className?: string
  children?: React.ReactNode
}

export function SparklesText({
  sparkleCount = 8,
  colors = ["var(--color-primary)", "var(--color-accent, gold)", "white"],
  size = 16,
  className,
  children,
}: SparklesTextProps) {
  const [sparkles, setSparkles] = React.useState<Sparkle[]>([])
  const prefersReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

  React.useEffect(() => {
    if (prefersReduced) return

    const interval = setInterval(() => {
      const newSparkle = generateSparkle(colors, size)
      setSparkles((prev) => [...prev.slice(-sparkleCount + 1), newSparkle])
      setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => s.id !== newSparkle.id))
      }, 700)
    }, 300)

    return () => clearInterval(interval)
  }, [sparkleCount, colors, size, prefersReduced])

  return (
    <span className={cn("sparkles-wrapper", className)}>
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.svg
            key={sparkle.id}
            className="sparkle-svg"
            style={{ left: sparkle.x, top: sparkle.y, width: sparkle.size, height: sparkle.size }}
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{ opacity: 1, scale: 1, rotate: 90 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.35 }}
            viewBox="0 0 160 160"
          >
            <path
              d="M80 7C80 7 84.2846 45.2987 101.496 62.5C118.706 79.7013 157 84 157 84C157 84 118.706 88.2987 101.496 105.5C84.2846 122.701 80 161 80 161C80 161 75.7154 122.701 58.504 105.5C41.2926 88.2987 3 84 3 84C3 84 41.2926 79.7013 58.504 62.5C75.7154 45.2987 80 7 80 7Z"
              fill={sparkle.color}
            />
          </motion.svg>
        ))}
      </AnimatePresence>
      <span className="sparkles-content">{children}</span>
      <style>{`
        .sparkles-wrapper { position: relative; display: inline-block; }
        .sparkle-svg { position: absolute; pointer-events: none; z-index: 10; transform-origin: center; }
        .sparkles-content { position: relative; z-index: 1; }
      `}</style>
    </span>
  )
}
```

## בדיקות סיום
- [ ] Sparkles מופיעים ונעלמים
- [ ] Colors אקראיים
- [ ] prefers-reduced-motion: ללא sparkles
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
