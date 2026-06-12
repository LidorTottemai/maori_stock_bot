# BorderBeam

> **קטגוריה:** special
> **השראה:** Magic UI / Aceternity UI
> **תלויות:** css-only
> **Storybook:** src/stories/special/BorderBeam.stories.tsx
> **קוד:** src/special/BorderBeam.tsx
> **עלות בנייה:** ~45 דקות

## מה זה
BorderBeam מוסיף גבול "זוהר" שנע סביב קונטיינר — נקודת אור נוסעת לאורך ה-border של קארד או כל אלמנט. יוצר אפקט "הייטק" מרשים. נפוץ בכרטיסי פרייסינג, feature cards, ו-hero section callouts.

## אפקט — איך זה עובד
הקומפוננט הוא `div` עם `position: absolute inset-0` שמוסיף גבול זוהר ל-parent (ה-parent חייב להיות `position: relative; overflow: hidden`). ה-border נוצר ע"י `conic-gradient` שמסתובב סביב המרכז באמצעות `@keyframes` על `--angle` (custom property). `@property` מאפשר אנימציה חלקה של ה-angle. הגרדיאנט עובר מ-`colorFrom` ל-`colorTo` ואז לשקוף.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | number | 300 | גודל ה-beam (px) — רדיוס הגרדיאנט |
| duration | number | 4 | מהירות סיבוב בשניות |
| colorFrom | string | "var(--color-accent, #a855f7)" | צבע ראשית של ה-beam |
| colorTo | string | "var(--color-primary, #3b82f6)" | צבע סיום של ה-beam |
| borderWidth | number | 2 | עובי הגבול בפיקסלים |
| className | string | "" | CSS class נוסף |

## שימוש
```tsx
import { BorderBeam } from "@tottemai/ui"

export default function PricingCard() {
  return (
    <div className="relative rounded-2xl bg-card p-6 overflow-hidden">
      <BorderBeam
        colorFrom="#a855f7"
        colorTo="#ec4899"
        duration={3}
        borderWidth={2}
      />
      <h3 className="text-xl font-bold">Pro Plan</h3>
      <p className="text-muted-foreground mt-2">$49 / month</p>
      <ul className="mt-4 space-y-2">
        <li>✓ Unlimited projects</li>
        <li>✓ Priority support</li>
        <li>✓ Custom domain</li>
      </ul>
    </div>
  )
}
```

## קוד מלא
```tsx
"use client"
// src/special/BorderBeam.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface BorderBeamProps {
  size?: number
  duration?: number
  colorFrom?: string
  colorTo?: string
  borderWidth?: number
  className?: string
}

export function BorderBeam({
  size = 300,
  duration = 4,
  colorFrom = "var(--color-accent, #a855f7)",
  colorTo = "var(--color-primary, #3b82f6)",
  borderWidth = 2,
  className,
}: BorderBeamProps) {
  const id = React.useId().replace(/:/g, "")

  return (
    <>
      <style>{`
        @property --border-angle-${id} {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }
        @keyframes border-beam-rotate-${id} {
          to { --border-angle-${id}: 360deg; }
        }
        .border-beam-${id} {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: ${borderWidth}px;
          background: conic-gradient(
            from var(--border-angle-${id}),
            transparent 75%,
            ${colorFrom},
            ${colorTo},
            transparent
          );
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          animation: border-beam-rotate-${id} ${duration}s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .border-beam-${id} {
            animation: none;
            background: conic-gradient(
              from 45deg,
              transparent 75%,
              ${colorFrom},
              ${colorTo},
              transparent
            );
          }
        }
      `}</style>
      <div
        className={cn(`border-beam-${id}`, className)}
        aria-hidden="true"
      />
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
