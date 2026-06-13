# LampEffect

> **קטגוריה:** special
> **השראה:** Aceternity UI
> **תלויות:** framer-motion (motion/react)
> **Storybook:** src/stories/special/LampEffect.stories.tsx
> **קוד:** src/special/LampEffect.tsx
> **עלות בנייה:** ~30 דקות

## מה זה
אפקט "מנורה" בhero — קרן אור גדולה מהמרכז העליון יוצרת cone גלוי. SVG + gradient. Content מונח מעל. אנימציה ב-mount: cone מתרחב מרוחב 0.

## אפקט — איך זה עובד
SVG עם `conic-gradient` / `radial-gradient` + Framer Motion `width: 0 → 100%` animation ב-mount. רקע כהה מאחורה.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| color | `string` | `"var(--color-primary)"` | צבע הקרן |
| intensity | `number` | `0.6` | opacity max |
| children | `ReactNode` | — | content |
| className | `string` | — | — |

## שימוש
```tsx
import { LampEffect } from "@tottemai/ui"

<LampEffect color="var(--color-primary)">
  <h1 className="text-display-xl text-white text-center mt-16">
    כותרת מרשימה
  </h1>
</LampEffect>
```

## קוד מלא
```tsx
"use client"
// src/special/LampEffect.tsx
import * as React from "react"
import { motion } from "motion/react"
import { cn } from "../cn"

interface LampEffectProps {
  color?: string
  intensity?: number
  className?: string
  children?: React.ReactNode
}

export function LampEffect({ color = "var(--color-primary)", intensity = 0.6, className, children }: LampEffectProps) {
  return (
    <div className={cn("lamp-container", className)}>
      {/* Cone light from top */}
      <div className="lamp-cone-wrapper">
        <motion.div
          className="lamp-cone"
          initial={{ opacity: 0, width: "20%" }}
          animate={{ opacity: 1, width: "80%" }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          style={{
            background: `conic-gradient(from 180deg at 50% 0%, transparent 0deg, ${color} 90deg, ${color} 270deg, transparent 360deg)`,
            opacity: intensity,
          }}
        />
        {/* Glow blur */}
        <motion.div
          className="lamp-glow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          style={{
            background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${color}, transparent)`,
            opacity: intensity * 0.7,
          }}
        />
      </div>

      {/* Content */}
      <div className="lamp-content">{children}</div>

      <style>{`
        .lamp-container { position: relative; overflow: hidden; }
        .lamp-cone-wrapper { position: absolute; inset: 0; pointer-events: none; }
        .lamp-cone { position: absolute; top: 0; left: 50%; transform: translateX(-50%); height: 60%; }
        .lamp-glow { position: absolute; top: 0; left: 0; right: 0; height: 50%; }
        .lamp-content { position: relative; z-index: 10; }
      `}</style>
    </div>
  )
}
```

## בדיקות סיום
- [ ] Cone animation ב-mount
- [ ] Content מוצג מעל האפקט
- [ ] prefers-reduced-motion: ללא animation
- [ ] CSS variables בלבד
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
