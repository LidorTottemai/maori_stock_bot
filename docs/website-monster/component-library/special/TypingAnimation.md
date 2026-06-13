# TypingAnimation

> **קטגוריה:** special
> **תלויות:** none (pure React)
> **Storybook:** src/stories/special/TypingAnimation.stories.tsx
> **קוד:** src/special/TypingAnimation.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
Typewriter effect — מקליד טקסט אות-אות עם cursor מהבהב. Optional: מחיקה וחזרה (loop). Good לhero subtitle: "אנחנו עושים..." + rotating texts.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| text | `string \| string[]` | — | אם array — loop |
| speed | `number` | `60` | ms per char |
| deleteSpeed | `number` | `30` | ms per char deletion |
| pauseTime | `number` | `1500` | ms לפני מחיקה |
| cursor | `boolean` | true | cursor מהבהב |
| className | `string` | — | — |

## שימוש
```tsx
import { TypingAnimation } from "@tottemai/ui"

// static
<TypingAnimation text="ברוכים הבאים לסטודיו שלנו" />

// rotating
<TypingAnimation text={["ספא מרגיע", "עיסוי מקצועי", "חוויה ייחודית"]} />
```

## קוד מלא
```tsx
"use client"
// src/special/TypingAnimation.tsx
import * as React from "react"
import { cn } from "../cn"

interface TypingAnimationProps {
  text: string | string[]
  speed?: number
  deleteSpeed?: number
  pauseTime?: number
  cursor?: boolean
  className?: string
}

export function TypingAnimation({ text, speed = 60, deleteSpeed = 30, pauseTime = 1500, cursor = true, className }: TypingAnimationProps) {
  const texts = Array.isArray(text) ? text : [text]
  const [displayed, setDisplayed] = React.useState("")
  const [textIndex, setTextIndex] = React.useState(0)
  const [phase, setPhase] = React.useState<"typing" | "pausing" | "deleting">("typing")

  const prefersReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

  React.useEffect(() => {
    if (prefersReduced) { setDisplayed(texts[0]); return }
    const current = texts[textIndex]

    if (phase === "typing") {
      if (displayed.length < current.length) {
        const t = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), speed)
        return () => clearTimeout(t)
      } else {
        if (texts.length > 1) {
          const t = setTimeout(() => setPhase("deleting"), pauseTime)
          return () => clearTimeout(t)
        }
      }
    }

    if (phase === "deleting") {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), deleteSpeed)
        return () => clearTimeout(t)
      } else {
        setTextIndex((i) => (i + 1) % texts.length)
        setPhase("typing")
      }
    }
  }, [displayed, phase, textIndex, texts, speed, deleteSpeed, pauseTime, prefersReduced])

  return (
    <span className={cn("typing-anim", className)}>
      {displayed}
      {cursor && <span className="typing-cursor" aria-hidden>|</span>}
      <style>{`
        .typing-cursor { animation: typing-blink 0.8s step-end infinite; color: var(--color-primary); }
        @keyframes typing-blink { 50% { opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { .typing-cursor { animation: none; } }
      `}</style>
    </span>
  )
}
```

## בדיקות סיום
- [ ] Typing animation פועל
- [ ] Loop עם array texts
- [ ] Cursor מהבהב
- [ ] prefers-reduced-motion: מציג text מיד
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
