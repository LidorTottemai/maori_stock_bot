# Reveal3D

> **קטגוריה:** motion
> **תלויות:** framer-motion (motion/react)
> **Storybook:** src/stories/motion/Reveal3D.stories.tsx
> **קוד:** src/motion/Reveal3D.tsx
> **עלות בנייה:** ~25 דקות

## מה זה
3D tilt effect ב-hover. Card שנוטה בכיוון ה-mouse. `rotateX + rotateY` מבוסס על מיקום ה-mouse בתוך ה-element. Spring animation לתנועה smooth. `perspective: 1000px`.

## אנימציה — איך זה עובד
`onMouseMove` → חשב `normalizedX, normalizedY` (0 עד 1). `rotateY = (normalizedX - 0.5) * intensity`. `rotateX = -(normalizedY - 0.5) * intensity`. Framer Motion spring stiffness:150, damping:15.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| intensity | `number` | `15` | max rotation degrees |
| perspective | `number` | `1000` | CSS perspective px |
| scale | `number` | `1.02` | scale on hover |
| glare | `boolean` | false | glare overlay effect |
| children | `ReactNode` | — | — |
| className | `string` | — | — |

## שימוש
```tsx
import { Reveal3D } from "@tottemai/ui"

<Reveal3D intensity={12}>
  <ServiceCard title="שירות" description="תיאור" />
</Reveal3D>
```

## קוד מלא
```tsx
"use client"
// src/motion/Reveal3D.tsx
import * as React from "react"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"
import { cn } from "../cn"

interface Reveal3DProps {
  intensity?: number
  perspective?: number
  scale?: number
  glare?: boolean
  className?: string
  children?: React.ReactNode
}

export function Reveal3D({ intensity = 15, perspective = 1000, scale = 1.02, glare = false, className, children }: Reveal3DProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const prefersReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const glareX = useMotionValue(50)
  const glareY = useMotionValue(50)

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [intensity, -intensity]), { stiffness: 150, damping: 15 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-intensity, intensity]), { stiffness: 150, damping: 15 })
  const scaleSpring = useSpring(1, { stiffness: 200, damping: 20 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const normalX = (e.clientX - rect.left) / rect.width - 0.5
    const normalY = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(normalX)
    mouseY.set(normalY)
    glareX.set(((e.clientX - rect.left) / rect.width) * 100)
    glareY.set(((e.clientY - rect.top) / rect.height) * 100)
  }

  const handleMouseEnter = () => scaleSpring.set(scale)
  const handleMouseLeave = () => {
    mouseX.set(0); mouseY.set(0)
    glareX.set(50); glareY.set(50)
    scaleSpring.set(1)
  }

  if (prefersReduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, scale: scaleSpring, transformPerspective: perspective, transformStyle: "preserve-3d" }}
      className={cn("reveal3d", className)}
    >
      {children}
      {glare && (
        <motion.div
          className="reveal3d-glare"
          style={{
            background: useTransform([glareX, glareY], ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.15), transparent 60%)`),
          }}
        />
      )}
      <style>{`
        .reveal3d { position: relative; }
        .reveal3d-glare { position: absolute; inset: 0; pointer-events: none; border-radius: inherit; }
      `}</style>
    </motion.div>
  )
}
```

## בדיקות סיום
- [ ] Tilt מגיב למיקום mouse
- [ ] Reset ב-mouseLeave
- [ ] Glare overlay (אם enabled)
- [ ] prefers-reduced-motion: ללא effect
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
