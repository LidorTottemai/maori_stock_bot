# MagneticButton

> **קטגוריה:** motion
> **תלויות:** framer-motion
> **Storybook:** src/stories/motion/MagneticButton.stories.tsx
> **קוד:** src/motion/MagneticButton.tsx
> **עלות בנייה:** ~30 דקות

## מה זה
כפתור שמושך את עצמו לכיוון העכבר כשהעכבר נמצא בקרבתו — אפקט מגנטי. מוסיף תחושת interactivity פיזית ופרימיום לCTAs ראשיים. מתאים לכפתורי hero ("צרו קשר", "ראו עבודות"), כפתורי נביגציה חשובים, ולינקי social. **מושבת אוטומטית על mobile** — `matchMedia("(pointer:coarse)")` מזהה touch ומונע הפעלה.

## אנימציה — איך זה עובד
`onMouseMove` מחשב את מיקום העכבר ביחס למרכז האלמנט (`getBoundingClientRect`). המרחק ממרכז מוכפל ב-`strength` (ברירת מחדל 0.35) כדי לקבל את ה-offset. `useSpring` עם `stiffness:150, damping:15` מאנימט X ו-Y בנפרד, יוצר תנועה גומישה. ב-`onMouseLeave` הערכים חוזרים ל-0 בspring.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | כפתור בסיסי, strength 0.35 |
| StrongMagnet | strength 0.6 — גרוויטציה חזקה |
| WeakMagnet | strength 0.15 — עדין |
| Outlined | כפתור עם border בלבד |
| IconButton | כפתור עגול עם אייקון |
| Disabled | מושבת — ללא אנימציה |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | React.ReactNode | — | תוכן הכפתור (חובה) |
| className | string | undefined | class נוסף על הכפתור |
| strength | number | 0.35 | עוצמת המגנטיות (0–1) |
| onClick | () => void | undefined | handler לקליק |
| disabled | boolean | false | משבית את האנימציה והקליק |
| as | "button" \| "a" | "button" | אלמנט HTML |
| href | string | undefined | עבור as="a" |

## שימוש
```tsx
import { MagneticButton } from "@tottemai/ui"

// CTA ראשי
<MagneticButton onClick={() => router.push("/contact")}>
  צרו קשר
</MagneticButton>

// כפתור חזק
<MagneticButton strength={0.5} className="px-8 py-4 bg-[var(--color-primary)] rounded-full">
  ראו עבודות
</MagneticButton>

// לינק
<MagneticButton as="a" href="/about" strength={0.25}>
  קראו עלינו
</MagneticButton>
```

## קוד מלא
```tsx
"use client"
// src/motion/MagneticButton.tsx
import { motion, useSpring } from "motion/react"
import { useRef, useCallback, useEffect, useState } from "react"

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  strength?: number
  onClick?: () => void
  disabled?: boolean
  as?: "button" | "a"
  href?: string
}

export function MagneticButton({
  children,
  className,
  strength = 0.35,
  onClick,
  disabled = false,
  as: Tag = "button",
  href,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches)
  }, [])

  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 }
  const x = useSpring(0, springConfig)
  const y = useSpring(0, springConfig)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (isTouch || disabled || !ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const deltaX = (e.clientX - centerX) * strength
      const deltaY = (e.clientY - centerY) * strength
      x.set(deltaX)
      y.set(deltaY)
    },
    [isTouch, disabled, strength, x, y]
  )

  const handleMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  const MotionTag = motion[Tag] as typeof motion.button

  return (
    <MotionTag
      ref={ref as any}
      className={className}
      style={{ x, y, display: "inline-block" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={disabled ? undefined : onClick}
      href={href as any}
      disabled={disabled}
      whileTap={!disabled && !isTouch ? { scale: 0.95 } : undefined}
    >
      {children}
    </MotionTag>
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
