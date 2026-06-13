# 🎬 Phase 2 — מערכת האנימציות

> **מטרה:** 15 טכניקות אנימציה ברמת Awwwards, ממומשות כרכיבים ב-`@tottemai/ui`.
> **Repo:** `github:LidorTottemai/tottemai-ui` — תיקיית `src/motion/`
> **כלים:** motion/react (Framer Motion) + GSAP + ScrollTrigger + Lenis

---

## הכלים

| כלי | שימוש | גרסה |
|-----|-------|-------|
| **Framer Motion** (motion/react) | רכיבים React, page transitions, scroll reveals | ^11 |
| **GSAP + ScrollTrigger** | parallax, horizontal scroll, timelines מורכבות | ^3.12 |
| **Lenis** | smooth scroll עם momentum — גלובלי | ^1.1 |

> **חשוב:** Framer Motion שינה שם ל-`motion/react` בסוף 2024.
> השתמש ב: `import { motion, useScroll } from "motion/react"`

---

## Lenis — הגדרה גלובלית (חובה בכל אתר)

```tsx
// app/[locale]/layout.tsx או providers.tsx
"use client"
import Lenis from "lenis"
import { useEffect } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })
    gsap.registerPlugin(ScrollTrigger)
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)
    return () => { lenis.destroy(); gsap.ticker.remove(() => {}) }
  }, [])
  return <>{children}</>
}
```

---

## 15 האנימציות

### קבוצה א' — Text Animations

#### 1. TextReveal — מילה-מילה (הנפוץ ביותר)
```tsx
"use client"
import { motion } from "motion/react"

export function TextReveal({ text, className, delay = 0 }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((word, i) => (
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
    </span>
  )
}
```

#### 2. CharReveal — אות-אות (לhero דרמטי)
```tsx
// כמו TextReveal אבל text.split("") ו-stagger: i * 0.03
// אפקט: כל אות "קופצת" עם delay קטן — תחושה דרמטית
```

#### 3. ClipReveal — חשיפה בclip-path
```tsx
initial={{ clipPath: "inset(0 0 100% 0)" }}
animate={{ clipPath: "inset(0 0 0% 0)" }}
transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
```

### קבוצה ב' — Scroll Animations

#### 4. ScrollReveal — fade+slide (הוסף לכל section)
```tsx
export function ScrollReveal({ children, delay = 0, className }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
```

#### 5. Parallax — GSAP ScrollTrigger
```tsx
"use client"
import { useRef, useEffect } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"

export function Parallax({ children, speed = 0.3, className }) {
  const ref = useRef(null)
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    gsap.to(ref.current, {
      yPercent: -30 * speed,
      ease: "none",
      scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: 1.5 }
    })
  }, [speed])
  return <div ref={ref} className={className}>{children}</div>
}
```

#### 6. Stagger Grid — אלמנטים ברצף
```tsx
const container = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

<motion.ul variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}>
  {items.map(i => <motion.li key={i} variants={item}>{...}</motion.li>)}
</motion.ul>
```

#### 7. HorizontalScroll — גלריה אופקית
```tsx
// GSAP: גלריה scroll אופקי בתוך scroll אנכי
gsap.to(galleryRef.current, {
  xPercent: -100 * (items.length - 1),
  ease: "none",
  scrollTrigger: { trigger: container, pin: true, scrub: 1, snap: 1 / (items.length - 1) }
})
```

#### 8. CountUp — מספרים עולים (stats sections)
```tsx
import { useMotionValue, useInView, animate } from "motion/react"
// trigger whileInView → animate(0, target, { duration: 2, ease: "easeOut" })
```

### קבוצה ג' — Interaction

#### 9. MagneticButton
```tsx
const x = useMotionValue(0), y = useMotionValue(0)
const springX = useSpring(x, { stiffness: 150, damping: 15 })
const springY = useSpring(y, { stiffness: 150, damping: 15 })

const handleMove = (e) => {
  const rect = ref.current.getBoundingClientRect()
  x.set((e.clientX - rect.left - rect.width / 2) * 0.35)
  y.set((e.clientY - rect.top - rect.height / 2) * 0.35)
}
```

#### 10. CustomCursor — (desktop בלבד)
```tsx
// 2 עיגולים: dot (lag 0.1s) + ring (lag 0.4s)
// mix-blend-mode: difference → נראה על כל רקע
// מתרחב בhover על כפתורים וlinks
// כיבוי במובייל: hidden md:block
```

#### 11. Reveal3D — tilt על hover
```tsx
// rotateX + rotateY ביחס למיקום mouse בתוך הcard
// perspective: 1000px
// spring: stiffness 150, damping 15
// הefect: נותן תחושת עומק לcards
```

### קבוצה ד' — Layout

#### 12. PageTransition
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

#### 13. ScrollProgress — פס התקדמות
```tsx
const { scrollYProgress } = useScroll()
const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
return <motion.div className="fixed top-0 left-0 right-0 h-[3px] bg-[var(--color-primary)] origin-left z-50" style={{ scaleX }} />
```

#### 14. Marquee — רצועת לוגואים/טקסט
```tsx
// CSS animation: translateX(-50%) infinite
// duration: prop (slow=40s, medium=25s, fast=15s)
// pauseOnHover
```

#### 15. ImageClipReveal — חשיפת תמונה בscroll
```tsx
// clip-path reveal מלמעלה עם Intersection Observer
// combine with Parallax לאפקט עמוק
```

---

## accessibility — prefers-reduced-motion

```tsx
// hooks/useReducedMotion.ts
import { useReducedMotion } from "motion/react"

// בכל רכיב אנימציה:
const shouldReduce = useReducedMotion()
const transition = shouldReduce ? { duration: 0 } : { duration: 0.7, ease: [...] }
```

---

## בדיקות סיום שלב 2

- [ ] כל 15 הרכיבים קיימים ב-`src/motion/`
- [ ] TextReveal מאנים בgallery נפרד — מילה-מילה
- [ ] MagneticButton מגיב ל-hover על desktop, תקין במובייל
- [ ] CustomCursor פועל בdesktop, לא מופיע במובייל
- [ ] Parallax נראה חלק עם Lenis
- [ ] HorizontalScroll pins ועובד
- [ ] PageTransition מאנים בין דפים
- [ ] CountUp מופעל ב-whileInView
- [ ] prefers-reduced-motion: אין אנימציות
