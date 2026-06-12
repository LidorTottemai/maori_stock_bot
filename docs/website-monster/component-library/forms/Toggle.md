# Toggle

> **קטגוריה:** forms
> **תלויות:** @radix-ui/react-toggle
> **Storybook:** src/stories/Toggle.stories.tsx
> **קוד:** src/forms/Toggle.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
כפתור Toggle בודד שמייצג מצב pressed / not-pressed. מבוסס על @radix-ui/react-toggle עם תמיכה ב-variants (default, outline, ghost), גדלים שונים, icon בלבד, וכיוון RTL. מתאים לכפתורי Bold/Italic בעורך טקסט, סינונים, ועוד.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | Toggle רגיל עם טקסט |
| Outline | גרסת מסגרת |
| Ghost | גרסה שקופה |
| WithIcon | Toggle עם אייקון בלבד |
| Sizes | sm / md / lg |
| Disabled | מצב נטרול |
| RTL | כיוון מימין לשמאל |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| pressed | boolean | — | מצב נוכחי (controlled) |
| defaultPressed | boolean | false | ברירת מחדל (uncontrolled) |
| onPressedChange | (pressed: boolean) => void | — | callback בשינוי מצב |
| variant | "default" \| "outline" \| "ghost" | "default" | סגנון ויזואלי |
| size | "sm" \| "md" \| "lg" | "md" | גודל הכפתור |
| disabled | boolean | false | האם הכפתור מנוטרל |
| asChild | boolean | false | האם לרנדר כ-child |
| className | string | — | class נוסף |
| children | React.ReactNode | — | תוכן הכפתור |
| dir | "ltr" \| "rtl" | "ltr" | כיוון |

## שימוש בסיסי
```tsx
import { Toggle } from "@tottemai/ui"

// Toggle פשוט
<Toggle onPressedChange={(v) => console.log(v)}>
  Bold
</Toggle>

// Outline variant
<Toggle variant="outline" defaultPressed>
  מודגש
</Toggle>

// עם אייקון
<Toggle aria-label="הדגשה">
  <BoldIcon />
</Toggle>
```

## קוד מלא
```tsx
// src/forms/Toggle.tsx
"use client"
import * as React from "react"
import * as RadixToggle from "@radix-ui/react-toggle"

export type ToggleVariant = "default" | "outline" | "ghost"
export type ToggleSize = "sm" | "md" | "lg"

export interface ToggleProps
  extends React.ComponentPropsWithoutRef<typeof RadixToggle.Root> {
  variant?: ToggleVariant
  size?: ToggleSize
  dir?: "ltr" | "rtl"
}

const SIZE_STYLES: Record<ToggleSize, React.CSSProperties> = {
  sm: {
    height: "32px",
    minWidth: "32px",
    padding: "0 var(--spacing-2)",
    fontSize: "var(--font-size-sm)",
    borderRadius: "var(--radius-sm)",
    gap: "var(--spacing-1)",
  },
  md: {
    height: "40px",
    minWidth: "40px",
    padding: "0 var(--spacing-3)",
    fontSize: "var(--font-size-base)",
    borderRadius: "var(--radius-md)",
    gap: "var(--spacing-2)",
  },
  lg: {
    height: "48px",
    minWidth: "48px",
    padding: "0 var(--spacing-4)",
    fontSize: "var(--font-size-lg)",
    borderRadius: "var(--radius-md)",
    gap: "var(--spacing-2)",
  },
}

function getVariantStyle(
  variant: ToggleVariant,
  pressed: boolean,
  disabled: boolean
): React.CSSProperties {
  const base: React.CSSProperties = {
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    outline: "none",
    border: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
    transition:
      "background-color var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast)",
    fontWeight: pressed ? "var(--font-weight-semibold)" as React.CSSProperties["fontWeight"] : "var(--font-weight-normal)" as React.CSSProperties["fontWeight"],
  }

  if (variant === "default") {
    return {
      ...base,
      backgroundColor: pressed
        ? "var(--color-primary)"
        : "var(--color-surface-subtle)",
      color: pressed ? "var(--color-primary-foreground)" : "var(--color-text)",
      border: "1px solid transparent",
    }
  }

  if (variant === "outline") {
    return {
      ...base,
      backgroundColor: pressed
        ? "var(--color-primary-subtle)"
        : "transparent",
      color: pressed ? "var(--color-primary)" : "var(--color-text)",
      border: `1px solid ${
        pressed ? "var(--color-primary)" : "var(--color-border)"
      }`,
    }
  }

  // ghost
  return {
    ...base,
    backgroundColor: pressed
      ? "var(--color-surface-subtle)"
      : "transparent",
    color: pressed ? "var(--color-text)" : "var(--color-text-muted)",
    border: "1px solid transparent",
  }
}

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      variant = "default",
      size = "md",
      dir = "ltr",
      disabled = false,
      pressed,
      defaultPressed,
      onPressedChange,
      className,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const [internalPressed, setInternalPressed] = React.useState(
      defaultPressed ?? false
    )
    const isControlled = pressed !== undefined
    const currentPressed = isControlled ? pressed : internalPressed

    const handlePressedChange = (next: boolean) => {
      if (!isControlled) setInternalPressed(next)
      onPressedChange?.(next)
    }

    const variantStyle = getVariantStyle(variant, currentPressed, !!disabled)
    const sizeStyle = SIZE_STYLES[size]

    return (
      <RadixToggle.Root
        ref={ref}
        pressed={currentPressed}
        onPressedChange={handlePressedChange}
        disabled={disabled}
        dir={dir}
        data-variant={variant}
        data-size={size}
        className={className}
        style={{
          ...variantStyle,
          ...sizeStyle,
          ...style,
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            if (variant === "default") {
              e.currentTarget.style.filter = "brightness(0.92)"
            } else {
              e.currentTarget.style.backgroundColor = currentPressed
                ? "var(--color-primary-subtle)"
                : "var(--color-surface-subtle)"
            }
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.filter = ""
            e.currentTarget.style.backgroundColor =
              variantStyle.backgroundColor as string
          }
        }}
        onFocus={(e) => {
          if (!disabled) {
            e.currentTarget.style.boxShadow =
              "0 0 0 3px var(--color-primary-alpha)"
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = "none"
        }}
        {...props}
      >
        {children}
      </RadixToggle.Root>
    )
  }
)

Toggle.displayName = "Toggle"
```

## עיקרון CSS Variables
```css
/* אין צבעים קשיחים */
background: var(--color-primary);
color: var(--color-primary-foreground);
border-color: var(--color-border);
box-shadow: 0 0 0 3px var(--color-primary-alpha);
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
