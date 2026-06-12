# Phase 2: Animation System — 15 האנימציות

> **תלות:** Phase 1 (maori-ui קיים)  
> **משך משוער:** כלול בPhase 1  
> **תוצר:** כל רכיבי `src/motion/` מיושמים ונבדקים

---

## הכלים

| כלי | גרסה | שימוש |
|-----|------|-------|
| **motion/react** (Framer Motion) | ^11 | רכיבי React, page transitions, scroll reveals |
| **GSAP + ScrollTrigger** | ^3.12 | parallax, horizontal scroll, timelines |
| **Lenis** | ^1.1 | smooth scroll עם momentum |
| **Three.js** (אופציונלי) | ^0.170 | hero backgrounds תלת-ממדיות |

> [!WARNING]
> Framer Motion שינה שם בסוף 2024: `framer-motion` → `motion/react`.  
> ב-package.json: `"framer-motion": "^11"`. ב-imports: `import { motion } from "framer-motion"` עדיין עובד.

---

## Lenis — הגדרה גלובלית (חייב בכל אתר)

```tsx
// app/[locale]/layout.tsx
"use client"
import Lenis from "lenis"
import { useEffect } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function SmoothScrollProvider({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })
    // GSAP integration
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)
    return () => { lenis.destroy(); gsap.ticker.remove() }
  }, [])
  return <>{children}</>
}
```

---

## 15 האנימציות — קוד מלא

### 1. TextReveal — מילה-מילה

```tsx
"use client"
import { motion } from "framer-motion"

interface Props {
  text: string
  className?: string
  delay?: number
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span"
}

export function TextReveal({ text, className, delay = 0, as: Tag = "span" }: Props) {
  const words = text.split(" ")
  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block will-change-transform"
            initial={{ y: "110%", opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: delay + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}&nbsp;
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}
```

### 2. CharReveal — אות-אות (hero קיצוני)

```tsx
export function CharReveal({ text, className, delay = 0 }) {
  return (
    <span className={className} aria-label={text}>
      {text.split("").map((char, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: delay + i * 0.03, ease: [0.22, 1, 0.36, 1] }}
          >
            {char === " " ? " " : char}
          </motion.span>
        </span>
      ))}
    </span>
  )
}
```

### 3. ScrollReveal — fade+slide (הכי נפוץ)

```tsx
export function ScrollReveal({ children, delay = 0, className, direction = "up" }) {
  const variants = {
    up:    { initial: { opacity: 0, y: 40 },  animate: { opacity: 1, y: 0 } },
    down:  { initial: { opacity: 0, y: -40 }, animate: { opacity: 1, y: 0 } },
    left:  { initial: { opacity: 0, x: 40 },  animate: { opacity: 1, x: 0 } },
    right: { initial: { opacity: 0, x: -40 }, animate: { opacity: 1, x: 0 } },
  }
  return (
    <motion.div
      className={className}
      initial={variants[direction].initial}
      whileInView={variants[direction].animate}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
```

### 4. MagneticButton — כפתור מגנטי

```tsx
export function MagneticButton({ children, className, strength = 0.35 }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0), y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 150, damping: 15 })
  const springY = useSpring(y, { stiffness: 150, damping: 15 })

  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect()
    x.set((e.clientX - rect.left - rect.width / 2) * strength)
    y.set((e.clientY - rect.top - rect.height / 2) * strength)
  }

  return (
    <motion.div ref={ref} style={{ x: springX, y: springY }}
      onMouseMove={handleMove}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

### 5. CustomCursor — סמן מותאם (desktop בלבד)

```tsx
export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) return
    const move = (e: MouseEvent) => {
      gsap.to(dot.current,  { x: e.clientX, y: e.clientY, duration: 0.08 })
      gsap.to(ring.current, { x: e.clientX, y: e.clientY, duration: 0.4  })
    }
    const grow  = () => gsap.to(ring.current, { scale: 2.5, duration: 0.3 })
    const shrink= () => gsap.to(ring.current, { scale: 1,   duration: 0.3 })
    window.addEventListener("mousemove", move)
    document.querySelectorAll("a,button").forEach(el => {
      el.addEventListener("mouseenter", grow)
      el.addEventListener("mouseleave", shrink)
    })
    return () => window.removeEventListener("mousemove", move)
  }, [])

  return (
    <>
      <div ref={dot}  className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference bg-white" />
      <div ref={ring} className="fixed top-0 left-0 w-8 h-8 rounded-full border border-white pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference" />
    </>
  )
}
```

### 6. PageTransition

```tsx
export function PageTransition({ children }) {
  const pathname = usePathname()
  return (
    <AnimatePresence mode="wait">
      <motion.div key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

### 7. ScrollProgress — פס התקדמות

```tsx
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] origin-left z-50"
      style={{ scaleX, backgroundColor: "var(--color-primary)" }}
    />
  )
}
```

### 8. Parallax (GSAP)

```tsx
export function Parallax({ children, speed = 0.3, className }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    gsap.to(el, {
      yPercent: -100 * speed,
      ease: "none",
      scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1.5 }
    })
    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [speed])
  return <div ref={ref} className={className}>{children}</div>
}
```

### 9. Marquee — רצועה נעה

```tsx
export function Marquee({ children, speed = "normal", pause = true, className }) {
  const duration = { slow: "40s", normal: "25s", fast: "15s" }[speed]
  return (
    <div className={cn("overflow-hidden", className)}>
      <div
        className={cn("flex w-max gap-8 animate-marquee", pause && "hover:[animation-play-state:paused]")}
        style={{ animationDuration: duration }}
      >
        {children}{children}
      </div>
    </div>
  )
}
// globals.css: @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
```

### 10. CountUp — מספרים עולים

```tsx
export function CountUp({ end, duration = 2, suffix = "", className }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))

  useEffect(() => {
    if (isInView) animate(count, end, { duration, ease: "easeOut" })
  }, [isInView])

  return <motion.span ref={ref} className={className}>{rounded}{suffix}</motion.span>
}
```

### 11. Reveal3D — tilt על hover

```tsx
export function Reveal3D({ children, className }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0), y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]),  { stiffness: 150, damping: 20 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 20 })

  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top)  / rect.height - 0.5)
  }
  return (
    <motion.div ref={ref} style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      onMouseMove={handleMove} onMouseLeave={() => { x.set(0); y.set(0) }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

### 12. ClipReveal — חשיפת clip-path

```tsx
export function ClipReveal({ children, className, delay = 0 }) {
  return (
    <motion.div
      className={cn("overflow-hidden", className)}
      initial={{ clipPath: "inset(0 0 100% 0)" }}
      whileInView={{ clipPath: "inset(0 0 0% 0)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay, ease: [0.76, 0, 0.24, 1] }}
    >
      {children}
    </motion.div>
  )
}
```

### 13. HorizontalScroll — גלריה אופקית

```tsx
export function HorizontalScroll({ children, className }) {
  const trackRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const track = trackRef.current
    const totalWidth = track!.scrollWidth - track!.offsetWidth
    gsap.to(track, {
      x: -totalWidth,
      ease: "none",
      scrollTrigger: { trigger: track, pin: true, scrub: 1,
                        start: "top top", end: `+=${totalWidth}` }
    })
  }, [])
  return (
    <div className="overflow-hidden">
      <div ref={trackRef} className={cn("flex gap-6 w-max", className)}>
        {children}
      </div>
    </div>
  )
}
```

### 14. Stagger Container — ילדים בtiming מדורג

```tsx
const staggerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
}
const itemVariants = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
}

export function StaggerContainer({ children, className }) {
  return (
    <motion.div className={className} variants={staggerVariants}
      initial="hidden" whileInView="visible" viewport={{ once: true }}>
      {children}
    </motion.div>
  )
}
export function StaggerItem({ children, className }) {
  return <motion.div className={className} variants={itemVariants}>{children}</motion.div>
}
```

### 15. ImageReveal — תמונה מתגלה

```tsx
export function ImageReveal({ src, alt, className }) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <motion.div
        className="absolute inset-0 bg-[var(--color-surface)] z-10 origin-top"
        initial={{ scaleY: 1 }}
        whileInView={{ scaleY: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.img src={src} alt={alt} className="w-full h-full object-cover"
        initial={{ scale: 1.2 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}
```

---

## Accessibility — חובה

```tsx
// hooks/useReducedMotion.ts
import { useReducedMotion as _useReducedMotion } from "framer-motion"
export { _useReducedMotion as useReducedMotion }

// בכל אנימציה: אם useReducedMotion() → החלף transition ב: { duration: 0.01 }
```

---

## בדיקות סוף שלב

- [ ] כל 15 רכיבי motion קיימים ב-`src/motion/`
- [ ] `TextReveal` עובד עם כל ה-`as` props
- [ ] `MagneticButton` לא פעיל במסכי touch
- [ ] `CustomCursor` לא גורם לflicker
- [ ] `Parallax` לא גורם לscroll jank
- [ ] `HorizontalScroll` מסתנכרן עם Lenis
- [ ] `useReducedMotion` מכבה אנימציות כשנדרש
- [ ] כל הרכיבים מיוצאים מ-`src/index.ts`
