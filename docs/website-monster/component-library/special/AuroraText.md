# AuroraText

> **קטגוריה:** special
> **השראה:** Magic UI / Aceternity UI
> **תלויות:** css-only
> **Storybook:** src/stories/special/AuroraText.stories.tsx
> **קוד:** src/special/AuroraText.tsx
> **עלות בנייה:** ~45 דקות

## מה זה
AuroraText הוא קומפוננט טקסט עם גרדיאנט אנימטיבי שמחליק בין צבעים כמו אורות הצפון (Aurora Borealis). מושלם לכותרות ראשיות בדפי נחיתה. הגרדיאנט נע לאורך הטקסט ברצף חלק, ויוצר אפקט "חי" ומרהיב שמושך תשומת לב מיד. כל האנימציה מבוססת CSS בלבד — ללא JavaScript רץ בזמן אמת, ללא framer-motion, ולכן הביצועים מצוינים גם על מכשירים חלשים.

## אפקט — איך זה עובד
האפקט משתמש ב-CSS `background-clip: text` ו-`background-image: linear-gradient(90deg, ...)` עם `background-size: 300% 100%`. ה-keyframe מנייד את `background-position` מ-`0% 50%` ל-`100% 50%` ובחזרה בלופ אינסופי. כך הגרדיאנט "זורם" על פני הטקסט ללא JavaScript כלל. שם ה-keyframe נוצר דינמית ע"י `useId` כדי למנוע התנגשות בין מספר מופעים באותו דף. תמיכה ב-`prefers-reduced-motion` מבטלת את האנימציה ומציגה את הגרדיאנט סטטי.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| text | string | — | הטקסט להצגה (required) |
| colors | string[] | ["#ff0080","#7928ca","#0070f3","#00dfd8"] | מערך צבעי CSS לגרדיאנט |
| speed | number | 3 | מהירות האנימציה בשניות (duration) |
| className | string | "" | CSS class נוסף לאלמנט |

## שימוש
```tsx
import { AuroraText } from "@tottemai/ui"

export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-black text-center">
        Build something{" "}
        <AuroraText
          text="extraordinary"
          colors={["#ff0080", "#7928ca", "#0070f3", "#00dfd8"]}
          speed={3}
        />
      </h1>
      <p className="mt-4 text-xl text-muted-foreground">
        The component library that wins Awwwards.
      </p>
    </section>
  )
}
```

## קוד מלא
```tsx
"use client"
// src/special/AuroraText.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface AuroraTextProps {
  text: string
  colors?: string[]
  speed?: number
  className?: string
}

export function AuroraText({
  text,
  colors = ["#ff0080", "#7928ca", "#0070f3", "#00dfd8"],
  speed = 3,
  className,
}: AuroraTextProps) {
  const rawId = React.useId()
  // useId can contain colons which are invalid in CSS identifiers — strip them
  const id = rawId.replace(/:/g, "")
  const animationName = `aurora-shift-${id}`

  // Build the gradient string: repeat first color at end to make the loop seamless
  const gradientColors = [...colors, colors[0]].join(", ")

  return (
    <>
      <style>{`
        @keyframes ${animationName} {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .aurora-text-${id} {
          display: inline-block;
          background-image: linear-gradient(
            90deg,
            ${gradientColors}
          );
          background-size: 300% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
          animation: ${animationName} var(--aurora-speed-${id}, 3s) ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .aurora-text-${id} {
            animation: none;
            background-position: 0% 50%;
          }
        }
      `}</style>
      <span
        className={cn(`aurora-text-${id}`, className)}
        style={
          {
            [`--aurora-speed-${id}`]: `${speed}s`,
          } as React.CSSProperties
        }
        aria-label={text}
      >
        {text}
      </span>
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
