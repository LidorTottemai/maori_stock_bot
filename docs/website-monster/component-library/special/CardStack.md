# CardStack

> **קטגוריה:** special
> **השראה:** Aceternity UI
> **תלויות:** framer-motion (motion/react)
> **Storybook:** src/stories/special/CardStack.stories.tsx
> **קוד:** src/special/CardStack.tsx
> **עלות בנייה:** ~30 דקות

## מה זה
מחסנית כרטיסים שמסתובבת אוטומטית. כל N שניות, הכרטיס העליון עובר מאחורה. Cards מעט offset זה מזה. טוב לtestimonials, features. Drag to dismiss אופציונלי.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| items | `{ id: number; name: string; content: ReactNode; designation?: string }[]` | — | — |
| offset | `number` | `10` | px offset בין כרטיסים |
| scaleFactor | `number` | `0.06` | scale diff בין כרטיסים |
| interval | `number` | `5000` | ms בין החלפות |

## שימוש
```tsx
import { CardStack } from "@tottemai/ui"

<CardStack
  items={[
    { id: 1, name: "רחל כהן", designation: "לקוחה מרוצה", content: <p>"הטיפול היה מדהים!"</p> },
    { id: 2, name: "דוד לוי", designation: "לקוח חוזר", content: <p>"ממליץ בחום"</p> },
    { id: 3, name: "שרה מזרחי", content: <p>"חוויה יוצאת דופן"</p> },
  ]}
/>
```

## קוד מלא
```tsx
"use client"
// src/special/CardStack.tsx
import * as React from "react"
import { motion, AnimatePresence } from "motion/react"

interface CardItem { id: number | string; name: string; designation?: string; content: React.ReactNode }

interface CardStackProps {
  items: CardItem[]
  offset?: number
  scaleFactor?: number
  interval?: number
}

export function CardStack({ items, offset = 10, scaleFactor = 0.06, interval = 5000 }: CardStackProps) {
  const [cards, setCards] = React.useState(items)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCards((prev) => {
        const next = [...prev]
        next.unshift(next.pop()!)
        return next
      })
    }, interval)
    return () => clearInterval(timer)
  }, [interval])

  return (
    <div className="card-stack-root">
      {cards.map((card, i) => (
        <motion.div
          key={card.id}
          className="card-stack-card"
          style={{ transformOrigin: "top center" }}
          animate={{
            top: i * -offset,
            scale: 1 - i * scaleFactor,
            zIndex: cards.length - i,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="card-stack-content">{card.content}</div>
          <div className="card-stack-footer">
            <p className="card-stack-name">{card.name}</p>
            {card.designation && <p className="card-stack-role">{card.designation}</p>}
          </div>
        </motion.div>
      ))}
      <style>{`
        .card-stack-root { position: relative; width: 100%; max-width: 420px; height: 200px; }
        .card-stack-card {
          position: absolute; left: 0; right: 0;
          background: var(--color-surface); border: 1px solid var(--color-border);
          border-radius: var(--radius-lg, 16px); padding: 20px 24px;
          display: flex; flex-direction: column; gap: 12px;
        }
        .card-stack-content { flex: 1; font-size: 0.9375rem; color: var(--color-text); line-height: 1.6; }
        .card-stack-footer { display: flex; flex-direction: column; gap: 2px; }
        .card-stack-name { font-size: 0.875rem; font-weight: 600; color: var(--color-text); }
        .card-stack-role { font-size: 0.8125rem; color: var(--color-text-muted); }
      `}</style>
    </div>
  )
}
```

## בדיקות סיום
- [ ] Cards מתחלפות אוטומטית
- [ ] Stack offset נכון
- [ ] Scale factor נכון
- [ ] CSS variables בלבד
- [ ] מיוצא ב-src/index.ts

← [[00 - Library Overview & Build Plan]]
