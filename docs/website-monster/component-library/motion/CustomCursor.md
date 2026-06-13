# CustomCursor

> **קטגוריה:** motion
> **תלויות:** framer-motion (motion/react)
> **Storybook:** src/stories/motion/CustomCursor.stories.tsx
> **קוד:** src/motion/CustomCursor.tsx
> **עלות בנייה:** ~30 דקות

## מה זה
Custom cursor עם 2 עיגולים: dot קטן ומהיר + ring גדול עם lag. `mix-blend-mode: difference` — נראה על כל רקע. מתרחב ב-hover על כפתורים/links. Desktop בלבד.

## אנימציה — איך זה עובד
`useMotionValue` עבור x,y. `useSpring` עם stiffness/damping שונה לdot ולring → הדבקה מדורגת. `mix-blend-mode: difference` הופך את הצבע לcontrastive. ב-hover מגדיל `scale` ו-`opacity`.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| dotSize | `number` | `8` | px |
| ringSize | `number` | `36` | px |
| color | `string` | `"white"` | mix-blend-mode:difference |
| hoverScale | `number` | `2.5` | ring scale on hover |

## שימוש
```tsx
// app/layout.tsx
import { CustomCursor } from "@tottemai/ui"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <CustomCursor />
        {children}
      </body>
    </html>
  )
}
```

## קוד מלא
```tsx
"use client"
// src/motion/CustomCursor.tsx
import * as React from "react"
import { motion, useMotionValue, useSpring } from "motion/react"

interface CustomCursorProps {
  dotSize?: number
  ringSize?: number
  color?: string
  hoverScale?: number
}

export function CustomCursor({ dotSize = 8, ringSize = 36, color = "white", hoverScale = 2.5 }: CustomCursorProps) {
  const [hovering, setHovering] = React.useState(false)
  const [visible, setVisible] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(true)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Dot: fast
  const dotX = useSpring(mouseX, { stiffness: 800, damping: 30 })
  const dotY = useSpring(mouseY, { stiffness: 800, damping: 30 })

  // Ring: slow lag
  const ringX = useSpring(mouseX, { stiffness: 150, damping: 20 })
  const ringY = useSpring(mouseY, { stiffness: 150, damping: 20 })

  React.useEffect(() => {
    setIsMobile(window.matchMedia("(hover: none)").matches)

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      setVisible(true)
    }

    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    const onHoverStart = (e: MouseEvent) => {
      const target = e.target as Element
      if (target.closest("button, a, [data-cursor-hover]")) setHovering(true)
    }
    const onHoverEnd = (e: MouseEvent) => {
      const target = e.target as Element
      if (target.closest("button, a, [data-cursor-hover]")) setHovering(false)
    }

    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseleave", onLeave)
    document.addEventListener("mouseenter", onEnter)
    document.addEventListener("mouseover", onHoverStart)
    document.addEventListener("mouseout", onHoverEnd)

    return () => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseleave", onLeave)
      document.removeEventListener("mouseenter", onEnter)
      document.removeEventListener("mouseover", onHoverStart)
      document.removeEventListener("mouseout", onHoverEnd)
    }
  }, [mouseX, mouseY])

  if (isMobile) return null

  return (
    <>
      {/* Dot */}
      <motion.div
        style={{
          x: dotX, y: dotY,
          translateX: "-50%", translateY: "-50%",
          width: dotSize, height: dotSize, borderRadius: "50%",
          background: color, pointerEvents: "none",
          position: "fixed", top: 0, left: 0, zIndex: 9999,
          mixBlendMode: "difference",
          opacity: visible ? 1 : 0,
        }}
      />
      {/* Ring */}
      <motion.div
        animate={{ scale: hovering ? hoverScale : 1, opacity: hovering ? 0.4 : 0.6 }}
        style={{
          x: ringX, y: ringY,
          translateX: "-50%", translateY: "-50%",
          width: ringSize, height: ringSize, borderRadius: "50%",
          border: `1.5px solid ${color}`,
          pointerEvents: "none",
          position: "fixed", top: 0, left: 0, zIndex: 9998,
          mixBlendMode: "difference",
          opacity: visible ? 0.6 : 0,
        }}
      />
      <style>{`* { cursor: none !important; }`}</style>
    </>
  )
}
```

## בדיקות סיום
- [ ] Dot + Ring נעים
- [ ] Hover expand פועל
- [ ] Mobile: לא מוצג
- [ ] prefers-reduced-motion: מבטל
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
