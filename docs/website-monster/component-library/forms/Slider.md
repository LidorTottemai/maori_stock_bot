# Slider

> **קטגוריה:** forms
> **תלויות:** @radix-ui/react-slider
> **Storybook:** src/stories/Slider.stories.tsx
> **קוד:** src/forms/Slider.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
קומפוננטת Slider מאפשרת בחירת ערך מתוך טווח רציף. תומכת בטווח יחיד (single handle) ובטווח כפול (range, dual handle). בנויה על גבי @radix-ui/react-slider עם עיצוב מלא ב-CSS variables ותמיכה ב-RTL.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | Slider יחיד עם min=0, max=100 |
| WithStep | Slider עם step=10 |
| Range | Dual handle לבחירת טווח |
| Disabled | Slider לא פעיל |
| WithLabels | Slider עם תצוגת ערכים |
| RTL | Slider בכיוון מימין לשמאל |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| min | number | 0 | ערך מינימלי |
| max | number | 100 | ערך מקסימלי |
| step | number | 1 | גודל צעד |
| value | number[] | [0] | ערכים נוכחיים (מערך) |
| onValueChange | (value: number[]) => void | — | callback בשינוי ערך |
| disabled | boolean | false | האם הסליידר מנוטרל |
| range | boolean | false | מצב dual-handle לבחירת טווח |
| showValue | boolean | false | האם להציג את הערך |
| className | string | — | class נוסף |
| dir | "ltr" \| "rtl" | "ltr" | כיוון הטקסט |

## שימוש בסיסי
```tsx
import { Slider } from "@tottemai/ui"

// Slider יחיד
<Slider
  min={0}
  max={100}
  step={1}
  value={[42]}
  onValueChange={(val) => console.log(val)}
/>

// Range slider
<Slider
  range
  min={0}
  max={100}
  value={[20, 80]}
  onValueChange={(val) => console.log(val)}
/>
```

## קוד מלא
```tsx
// src/forms/Slider.tsx
"use client"
import * as React from "react"
import * as RadixSlider from "@radix-ui/react-slider"

export interface SliderProps {
  min?: number
  max?: number
  step?: number
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
  disabled?: boolean
  range?: boolean
  showValue?: boolean
  className?: string
  dir?: "ltr" | "rtl"
  "aria-label"?: string
}

const sliderStyles: React.CSSProperties & Record<string, string> = {}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      min = 0,
      max = 100,
      step = 1,
      value,
      defaultValue,
      onValueChange,
      disabled = false,
      range = false,
      showValue = false,
      className = "",
      dir = "ltr",
      "aria-label": ariaLabel,
    },
    ref
  ) => {
    const resolvedDefault = defaultValue ?? (range ? [0, 100] : [0])
    const [internalValue, setInternalValue] = React.useState<number[]>(
      value ?? resolvedDefault
    )
    const controlled = value !== undefined
    const currentValue = controlled ? value : internalValue

    const handleValueChange = (newValue: number[]) => {
      if (!controlled) setInternalValue(newValue)
      onValueChange?.(newValue)
    }

    const thumbCount = range ? 2 : 1

    return (
      <div
        ref={ref}
        dir={dir}
        className={`slider-wrapper ${className}`}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-2)",
          width: "100%",
        }}
      >
        {showValue && (
          <div
            style={{
              display: "flex",
              justifyContent: range ? "space-between" : "flex-end",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-muted)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {range ? (
              <>
                <span>{currentValue[0]}</span>
                <span>{currentValue[1]}</span>
              </>
            ) : (
              <span>{currentValue[0]}</span>
            )}
          </div>
        )}

        <RadixSlider.Root
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onValueChange={handleValueChange}
          disabled={disabled}
          dir={dir}
          aria-label={ariaLabel}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            userSelect: "none",
            touchAction: "none",
            width: "100%",
            height: "20px",
          }}
        >
          <RadixSlider.Track
            style={{
              backgroundColor: "var(--color-border)",
              position: "relative",
              flexGrow: 1,
              borderRadius: "9999px",
              height: "4px",
            }}
          >
            <RadixSlider.Range
              style={{
                position: "absolute",
                backgroundColor: disabled
                  ? "var(--color-text-disabled)"
                  : "var(--color-primary)",
                borderRadius: "9999px",
                height: "100%",
                transition: "background-color var(--transition-fast)",
              }}
            />
          </RadixSlider.Track>

          {Array.from({ length: thumbCount }).map((_, i) => (
            <RadixSlider.Thumb
              key={i}
              aria-label={
                range
                  ? i === 0
                    ? "ערך מינימלי"
                    : "ערך מקסימלי"
                  : (ariaLabel ?? "ערך")
              }
              style={{
                display: "block",
                width: "20px",
                height: "20px",
                backgroundColor: disabled
                  ? "var(--color-surface-disabled)"
                  : "var(--color-surface)",
                border: `2px solid ${
                  disabled ? "var(--color-border-disabled)" : "var(--color-primary)"
                }`,
                borderRadius: "50%",
                boxShadow: "var(--shadow-sm)",
                cursor: disabled ? "not-allowed" : "grab",
                transition:
                  "box-shadow var(--transition-fast), transform var(--transition-fast)",
                outline: "none",
              }}
              onMouseDown={(e) => {
                const el = e.currentTarget
                el.style.transform = "scale(1.15)"
                el.style.boxShadow =
                  "0 0 0 4px var(--color-primary-alpha), var(--shadow-sm)"
                el.style.cursor = "grabbing"
              }}
              onMouseUp={(e) => {
                const el = e.currentTarget
                el.style.transform = "scale(1)"
                el.style.boxShadow = "var(--shadow-sm)"
                el.style.cursor = "grab"
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 0 4px var(--color-primary-alpha), var(--shadow-sm)"
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-sm)"
              }}
            />
          ))}
        </RadixSlider.Root>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-muted)",
          }}
        >
          <span>{dir === "rtl" ? max : min}</span>
          <span>{dir === "rtl" ? min : max}</span>
        </div>
      </div>
    )
  }
)

Slider.displayName = "Slider"
```

## עיקרון CSS Variables
```css
/* אין צבעים קשיחים */
background: var(--color-primary);
color: var(--color-text);
border-color: var(--color-border);
box-shadow: 0 0 0 4px var(--color-primary-alpha);
```

## בדיקות סיום
- [ ] מרנדר בלי שגיאות
- [ ] כל ה-variants פועלים  
- [ ] CSS variables בלבד (אין hexcodes קשיחים)
- [ ] Accessible (aria-*, keyboard nav)
- [ ] RTL תמיכה
- [ ] prefers-reduced-motion
- [ ] מיוצא ב-src/index.ts
- [ ] Story ב-Storybook

← [[00 - Library Overview & Build Plan]]
