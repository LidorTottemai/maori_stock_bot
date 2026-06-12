# ShimmerButton

> **קטגוריה:** special
> **השראה:** Magic UI / Aceternity UI
> **תלויות:** css-only
> **Storybook:** src/stories/special/ShimmerButton.stories.tsx
> **קוד:** src/special/ShimmerButton.tsx
> **עלות בנייה:** ~45 דקות

## מה זה
ShimmerButton הוא כפתור CTA עם אפקט שימר נע — פס אור חולף עליו מצד שמאל לצד ימין בלופ אינסופי. נותן תחושה של "כפתור חי" שמזמין לחיצה. מושלם לכפתורי Get Started, Sign Up, או כל CTA ראשי בדף נחיתה.

## אפקט — איך זה עובד
הכפתור עצמו הוא `<button>` רגיל עם `overflow: hidden` ו-`position: relative`. האפקט נוצר ע"י pseudo-element `::before` עם `background: linear-gradient(90deg, transparent, var(--shimmer-color), transparent)` שמונע באמצעות `@keyframes` על `translateX(-100%)` עד `translateX(100%)`. כך פס הזוהר חוצה את הכפתור. כל הצבעים מוגדרים ב-CSS variables.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | React.ReactNode | — | תוכן הכפתור (required) |
| shimmerColor | string | "var(--color-accent)" | צבע פס השימר |
| shimmerSize | string | "0.1em" | עובי פס השימר |
| shimmerDuration | string | "1.5s" | מהירות מעבר השימר |
| background | string | "var(--color-primary)" | צבע רקע הכפתור |
| borderRadius | string | "100px" | border-radius הכפתור |
| className | string | "" | CSS class נוסף |
| onClick | () => void | — | handler ללחיצה |
| disabled | boolean | false | האם הכפתור מושבת |

## שימוש
```tsx
import { ShimmerButton } from "@tottemai/ui"

export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-5xl font-black">Ready to ship?</h1>
      <ShimmerButton
        shimmerColor="#ffffff"
        background="linear-gradient(135deg, #6366f1, #a855f7)"
        onClick={() => console.log("clicked")}
      >
        Get started for free →
      </ShimmerButton>
    </section>
  )
}
```

## קוד מלא
```tsx
"use client"
// src/special/ShimmerButton.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string
  shimmerSize?: string
  shimmerDuration?: string
  background?: string
  borderRadius?: string
}

export function ShimmerButton({
  children,
  shimmerColor = "rgba(255,255,255,0.4)",
  shimmerSize = "0.1em",
  shimmerDuration = "1.5s",
  background = "var(--color-primary, #6366f1)",
  borderRadius = "100px",
  className,
  style,
  ...props
}: ShimmerButtonProps) {
  return (
    <>
      <style>{`
        .shimmer-btn {
          position: relative;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          padding: 0.65em 1.75em;
          font-size: 1rem;
          font-weight: 600;
          color: #ffffff;
          transition: opacity 0.2s, transform 0.15s;
        }
        .shimmer-btn:hover {
          transform: translateY(-1px);
          opacity: 0.92;
        }
        .shimmer-btn:active {
          transform: translateY(0px);
        }
        .shimmer-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        .shimmer-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            var(--shimmer-color) 50%,
            transparent 100%
          );
          width: 50%;
          transform: translateX(-150%);
          animation: shimmer-slide var(--shimmer-duration) ease-in-out infinite;
        }
        @keyframes shimmer-slide {
          0%   { transform: translateX(-150%); }
          100% { transform: translateX(350%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .shimmer-btn::before {
            animation: none;
            display: none;
          }
        }
      `}</style>
      <button
        className={cn("shimmer-btn", className)}
        style={
          {
            background,
            borderRadius,
            "--shimmer-color": shimmerColor,
            "--shimmer-size": shimmerSize,
            "--shimmer-duration": shimmerDuration,
            ...style,
          } as React.CSSProperties
        }
        {...props}
      >
        <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
      </button>
    </>
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
