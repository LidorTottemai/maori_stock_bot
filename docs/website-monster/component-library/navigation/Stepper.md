# Stepper

> **קטגוריה:** navigation
> **תלויות:** none (pure React + CSS)
> **Storybook:** src/stories/navigation/Stepper.stories.tsx
> **קוד:** src/navigation/Stepper.tsx
> **עלות בנייה:** ~25 דקות

## מה זה
Stepper / wizard navigator — מציג שלבים בתהליך רב-שלבי. מתאים לonboarding, checkout, multi-step forms. תומך ב-horizontal/vertical, completed/active/error states.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Horizontal | ברירת מחדל |
| Vertical | פריסה אנכית |
| With descriptions | כל שלב עם תיאור |
| Error state | שלב עם שגיאה |
| Completed | כל השלבים הושלמו |
| Clickable | ניתן ללחוץ על שלבים קודמים |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| steps | `Step[]` | — | רשימת שלבים |
| currentStep | `number` | `0` | index של השלב הנוכחי |
| orientation | `'horizontal' \| 'vertical'` | `'horizontal'` | — |
| onStepClick | `(index: number) => void` | — | לחיצה על שלב |

```ts
interface Step {
  label: string
  description?: string
  status?: 'pending' | 'active' | 'completed' | 'error'
}
```

## שימוש בסיסי
```tsx
import { Stepper } from "@tottemai/ui"

<Stepper
  currentStep={1}
  steps={[
    { label: "פרטים אישיים" },
    { label: "כתובת" },
    { label: "תשלום" },
    { label: "אישור" },
  ]}
/>
```

## קוד מלא
```tsx
// src/navigation/Stepper.tsx
import * as React from "react"
import { cn } from "../cn"

interface Step { label: string; description?: string; error?: boolean }

interface StepperProps {
  steps: Step[]
  currentStep: number
  orientation?: "horizontal" | "vertical"
  onStepClick?: (index: number) => void
  className?: string
}

function Stepper({ steps, currentStep, orientation = "horizontal", onStepClick, className }: StepperProps) {
  return (
    <div className={cn("stepper", `stepper--${orientation}`, className)}>
      {steps.map((step, i) => {
        const isCompleted = i < currentStep
        const isActive = i === currentStep
        const isError = step.error

        return (
          <React.Fragment key={i}>
            <div
              className={cn(
                "stepper-step",
                isCompleted && "stepper-step--completed",
                isActive && "stepper-step--active",
                isError && "stepper-step--error",
                onStepClick && isCompleted && "stepper-step--clickable",
              )}
              onClick={() => isCompleted && onStepClick?.(i)}
            >
              <div className="stepper-circle">
                {isCompleted && !isError ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : isError ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 4v4M7 10v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <div className="stepper-content">
                <span className="stepper-label">{step.label}</span>
                {step.description && <span className="stepper-desc">{step.description}</span>}
              </div>
            </div>
            {i < steps.length - 1 && <div className={cn("stepper-connector", isCompleted && "stepper-connector--completed")} />}
          </React.Fragment>
        )
      })}

      <style>{`
        .stepper { display: flex; align-items: flex-start; }
        .stepper--horizontal { flex-direction: row; align-items: center; gap: 0; }
        .stepper--vertical { flex-direction: column; gap: 0; }

        .stepper-step { display: flex; align-items: center; gap: 10px; }
        .stepper--vertical .stepper-step { flex-direction: row; }
        .stepper--horizontal .stepper-step { flex-direction: column; align-items: center; gap: 8px; }

        .stepper-step--clickable { cursor: pointer; }

        .stepper-circle {
          width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          background: var(--color-surface-2); border: 2px solid var(--color-border);
          font-size: 0.8125rem; font-weight: 600; color: var(--color-text-muted);
          flex-shrink: 0; transition: all 0.2s;
        }
        .stepper-step--active .stepper-circle { border-color: var(--color-primary); color: var(--color-primary); background: color-mix(in srgb, var(--color-primary) 10%, transparent); }
        .stepper-step--completed .stepper-circle { border-color: var(--color-primary); background: var(--color-primary); color: white; }
        .stepper-step--error .stepper-circle { border-color: var(--color-error, #ef4444); background: var(--color-error, #ef4444); color: white; }

        .stepper-content { display: flex; flex-direction: column; gap: 2px; }
        .stepper--horizontal .stepper-content { align-items: center; }
        .stepper-label { font-size: 0.875rem; font-weight: 500; color: var(--color-text-muted); white-space: nowrap; }
        .stepper-step--active .stepper-label, .stepper-step--completed .stepper-label { color: var(--color-text); }
        .stepper-desc { font-size: 0.75rem; color: var(--color-text-muted); }

        .stepper-connector { background: var(--color-border); flex-shrink: 0; }
        .stepper--horizontal .stepper-connector { height: 2px; flex: 1; min-width: 24px; }
        .stepper--vertical .stepper-connector { width: 2px; height: 32px; margin-inline-start: 15px; margin-block: 4px; }
        .stepper-connector--completed { background: var(--color-primary); }
      `}</style>
    </div>
  )
}

export { Stepper }
```

## בדיקות סיום
- [ ] Horizontal + Vertical פועלים
- [ ] Completed/Active/Error states נכונים
- [ ] CSS variables בלבד
- [ ] RTL תמיכה (margin-inline-start)
- [ ] מיוצא ב-src/index.ts
- [ ] Story ב-Storybook

← [[00 - Library Overview & Build Plan]]
