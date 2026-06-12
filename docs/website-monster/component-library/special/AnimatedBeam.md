# AnimatedBeam

> **קטגוריה:** special
> **השראה:** Magic UI / Aceternity UI
> **תלויות:** framer-motion
> **Storybook:** src/stories/special/AnimatedBeam.stories.tsx
> **קוד:** src/special/AnimatedBeam.tsx
> **עלות בנייה:** ~45 דקות

## מה זה
AnimatedBeam מצייר קרן אור SVG שמחברת שני אלמנטים בדף — למשל לוגואים, אייקונים, או קארדים. הקרן נעה לאורך הנתיב בלופ, כמו "זרם נתונים" שזורם בין רכיבים. נפוץ בדיאגרמות ארכיטקטורה, integration pages, ו-feature showcases.

## אפקט — איך זה עובד
הקומפוננט מקבל `fromRef` ו-`toRef` — refs לאלמנטים ב-DOM. הוא מחשב את מיקומי המרכזים שלהם (`getBoundingClientRect`) ומצייר `<path>` SVG עם Bezier curve ביניהם. `framer-motion` מאניימט `pathLength` מ-0 ל-1 על gradient path (gradient נע בתוך ה-stroke ע"י `stroke-dasharray/offset` combinedעם gradient). `ResizeObserver` מחשב מחדש את הנתיב כשגודל הדף משתנה.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| containerRef | React.RefObject\<HTMLElement\> | — | ref ל-container המכיל (required) |
| fromRef | React.RefObject\<HTMLElement\> | — | ref לאלמנט מוצא (required) |
| toRef | React.RefObject\<HTMLElement\> | — | ref לאלמנט יעד (required) |
| duration | number | 3 | משך האנימציה בשניות |
| delay | number | 0 | עיכוב לפני תחילה (שניות) |
| pathColor | string | "#6366f1" | צבע הנתיב הבסיסי |
| pathWidth | number | 2 | עובי הקו |
| pathOpacity | number | 0.2 | שקיפות הנתיב הבסיסי |
| gradientStartColor | string | "#a855f7" | צבע ראשית של הקרן |
| gradientStopColor | string | "#3b82f6" | צבע סיום של הקרן |
| curvature | number | 0 | כמות העקמה של ה-Bezier (px) |
| reverse | boolean | false | האם לנוע בכיוון הפוך |
| startXOffset | number | 0 | היסט X מהמרכז של fromRef |
| startYOffset | number | 0 | היסט Y מהמרכז של fromRef |
| endXOffset | number | 0 | היסט X מהמרכז של toRef |
| endYOffset | number | 0 | היסט Y מהמרכז של toRef |

## שימוש
```tsx
import { AnimatedBeam } from "@tottemai/ui"
import { useRef } from "react"

export default function IntegrationsSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const centerRef = useRef<HTMLDivElement>(null)
  const targetRef = useRef<HTMLDivElement>(null)

  return (
    <section className="relative flex items-center justify-center gap-24 min-h-[400px]" ref={containerRef}>
      <div ref={logoRef} className="w-16 h-16 rounded-full bg-card flex items-center justify-center shadow-lg">
        <img src="/logos/github.svg" alt="GitHub" />
      </div>

      <div ref={centerRef} className="w-24 h-24 rounded-full bg-card flex items-center justify-center shadow-xl border">
        <img src="/logos/your-app.svg" alt="App" />
      </div>

      <div ref={targetRef} className="w-16 h-16 rounded-full bg-card flex items-center justify-center shadow-lg">
        <img src="/logos/slack.svg" alt="Slack" />
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={logoRef}
        toRef={centerRef}
        gradientStartColor="#a855f7"
        gradientStopColor="#6366f1"
        duration={3}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={centerRef}
        toRef={targetRef}
        gradientStartColor="#6366f1"
        gradientStopColor="#3b82f6"
        duration={3}
        delay={0.5}
      />
    </section>
  )
}
```

## קוד מלא
```tsx
"use client"
// src/special/AnimatedBeam.tsx
import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface AnimatedBeamProps {
  containerRef: React.RefObject<HTMLElement>
  fromRef: React.RefObject<HTMLElement>
  toRef: React.RefObject<HTMLElement>
  duration?: number
  delay?: number
  pathColor?: string
  pathWidth?: number
  pathOpacity?: number
  gradientStartColor?: string
  gradientStopColor?: string
  curvature?: number
  reverse?: boolean
  startXOffset?: number
  startYOffset?: number
  endXOffset?: number
  endYOffset?: number
  className?: string
}

export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  duration = 3,
  delay = 0,
  pathColor = "#6366f1",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = "#a855f7",
  gradientStopColor = "#3b82f6",
  curvature = 0,
  reverse = false,
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
  className,
}: AnimatedBeamProps) {
  const id = React.useId().replace(/:/g, "")
  const [path, setPath] = React.useState("")
  const [svgDimensions, setSvgDimensions] = React.useState({ width: 0, height: 0 })
  const gradientId = `gradient-${id}`

  const updatePath = React.useCallback(() => {
    if (!containerRef.current || !fromRef.current || !toRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const fromRect = fromRef.current.getBoundingClientRect()
    const toRect = toRef.current.getBoundingClientRect()

    const svgWidth = containerRect.width
    const svgHeight = containerRect.height
    setSvgDimensions({ width: svgWidth, height: svgHeight })

    const startX = fromRect.left - containerRect.left + fromRect.width / 2 + startXOffset
    const startY = fromRect.top - containerRect.top + fromRect.height / 2 + startYOffset
    const endX = toRect.left - containerRect.left + toRect.width / 2 + endXOffset
    const endY = toRect.top - containerRect.top + toRect.height / 2 + endYOffset

    const controlX = (startX + endX) / 2
    const controlY = (startY + endY) / 2 - curvature

    setPath(`M ${startX},${startY} Q ${controlX},${controlY} ${endX},${endY}`)
  }, [containerRef, fromRef, toRef, curvature, startXOffset, startYOffset, endXOffset, endYOffset])

  React.useEffect(() => {
    updatePath()
    const resizeObserver = new ResizeObserver(updatePath)
    if (containerRef.current) resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [updatePath])

  const strokeDashoffset = reverse ? -1 : 1

  return (
    <svg
      className={cn("pointer-events-none absolute inset-0", className)}
      width={svgDimensions.width}
      height={svgDimensions.height}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={gradientStartColor} stopOpacity="0" />
          <stop offset="40%" stopColor={gradientStartColor} stopOpacity="1" />
          <stop offset="60%" stopColor={gradientStopColor} stopOpacity="1" />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Base path — always visible, faint */}
      <path
        d={path}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        fill="none"
        strokeLinecap="round"
      />

      {/* Animated beam */}
      <motion.path
        d={path}
        stroke={`url(#${gradientId})`}
        strokeWidth={pathWidth}
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0, pathOffset: strokeDashoffset }}
        animate={{ pathLength: 0.3, pathOffset: -strokeDashoffset }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
      />
    </svg>
  )
}
```

## בדיקות סיום
- [ ] אפקט נראה ב-Chrome ו-Safari
- [ ] ביצועים: לא גורם ל-layout thrashing
- [ ] prefers-reduced-motion: מבטל אנימציה, מציג content בלבד
- [ ] CSS variables בלבד
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
