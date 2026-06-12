# AuroraText

> **קטגוריה:** special
> **השראה:** Magic UI / Aceternity UI
> **תלויות:** css-only
> **Storybook:** src/stories/special/AuroraText.stories.tsx
> **קוד:** src/special/AuroraText.tsx
> **עלות בנייה:** ~45 דקות

## מה זה
AuroraText הוא קומפוננט טקסט עם גרדיאנט אנימטיבי שמחליק בין צבעים כמו אורות הצפון (Aurora Borealis). מושלם לכותרות ראשיות בדפי נחיתה. הגרדיאנט נע לאורך הטקסט ברצף חלק, ויוצר אפקט "חי" ומרהיב שמושך תשומת לב מיד.

## אפקט — איך זה עובד
האפקט משתמש ב-CSS `background-clip: text` ו-`background-image: linear-gradient(...)` עם `background-size: 300%`. ה-keyframe מנייד את `background-position` מ-`0% 50%` ל-`100% 50%` בלופ. כך הגרדיאנט "זורם" על פני הטקסט ללא JavaScript בכלל. ניתן להגדיר כמה צבעים שרוצים — הם יתחברו אוטומטית ל-gradient אחד רב-צבעוני.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| text | string | — | הטקסט להצגה (required) |
| colors | string[] | ["#a855f7","#ec4899","#3b82f6"] | מערך צבעי CSS לגרדיאנט |
| speed | number | 4 | מהירות האנימציה בשניות (duration) |
| className | string | "" | CSS class נוסף לאלמנט |
| as | keyof JSX.IntrinsicElements | "span" | תג HTML לרנדור (h1, h2, p…) |

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
          colors={["#a855f7", "#ec4899", "#f97316", "#3b82f6"]}
          speed={5}
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
  as?: keyof JSX.IntrinsicElements
}

export function AuroraText({
  text,
  colors = ["#a855f7", "#ec4899", "#3b82f6"],
  speed = 4,
  className,
  as: Tag = "span",
}: AuroraTextProps) {
  const gradientStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(90deg, ${[...colors, colors[0]].join(", ")})`,
    backgroundSize: "300% 100%",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    animationDuration: `${speed}s`,
  }

  return (
    <>
      <style>{`
        @keyframes aurora-shift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .aurora-text {
          animation: aurora-shift var(--aurora-speed, 4s) ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .aurora-text {
            animation: none;
            background-position: 0% 50%;
          }
        }
      `}</style>
      <Tag
        className={cn("aurora-text inline-block", className)}
        style={
          {
            ...gradientStyle,
            "--aurora-speed": `${speed}s`,
          } as React.CSSProperties
        }
        aria-label={text}
      >
        {text}
      </Tag>
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
