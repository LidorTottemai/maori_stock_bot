# Avatar

> **קטגוריה:** primitives
> **תלויות:** @radix-ui/react-avatar, clsx
> **Storybook:** src/stories/Avatar.stories.tsx
> **קוד:** src/primitives/Avatar.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
תמונת פרופיל עם fallback לאותיות ראשונות. כולל AvatarGroup לערימת avatars מרובים עם overlap.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| WithImage | Avatar עם תמונה |
| WithFallback | Avatar עם אותיות fallback (כשאין תמונה) |
| Sizes | sm (24px), md (32px), lg (40px), xl (48px) |
| AvatarGroup | 3-5 avatars עם overlap וסכום +N |
| AvatarGroupMax | מגביל כמות מוצגת עם overflow counter |

## Props API

### Avatar
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| src | string | — | URL לתמונה |
| alt | string | — | טקסט alt לתמונה |
| fallback | string | — | אותיות fallback (1-2 תווים) |
| size | `"sm" \| "md" \| "lg" \| "xl"` | `"md"` | גודל ה-avatar |
| className | string | — | CSS classes נוספים |

### AvatarGroup
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| max | number | `5` | מספר מקסימלי של avatars מוצגים |
| size | `"sm" \| "md" \| "lg" \| "xl"` | `"md"` | גודל כל avatar בקבוצה |
| children | React.ReactNode | — | Avatar components |

## שימוש בסיסי
```tsx
import { Avatar, AvatarGroup } from "@tottemai/ui"

// Avatar בודד עם תמונה
<Avatar src="https://example.com/photo.jpg" alt="ישראל ישראלי" size="md" />

// Avatar עם fallback
<Avatar fallback="יי" size="lg" />

// קבוצת avatars
<AvatarGroup max={4} size="md">
  <Avatar src="https://example.com/alice.jpg" alt="Alice" />
  <Avatar src="https://example.com/bob.jpg" alt="Bob" />
  <Avatar fallback="CA" alt="Carol" />
  <Avatar fallback="DV" alt="Dave" />
  <Avatar fallback="EV" alt="Eve" />
</AvatarGroup>
```

## קוד מלא
```tsx
// src/primitives/Avatar.tsx
"use client"
import * as React from "react"
import * as RadixAvatar from "@radix-ui/react-avatar"
import { clsx } from "clsx"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AvatarSize = "sm" | "md" | "lg" | "xl"

export interface AvatarProps {
  src?: string
  alt?: string
  fallback?: string
  size?: AvatarSize
  className?: string
}

export interface AvatarGroupProps {
  max?: number
  size?: AvatarSize
  className?: string
  children: React.ReactNode
}

// ---------------------------------------------------------------------------
// Size map
// ---------------------------------------------------------------------------

const sizeMap: Record<AvatarSize, { px: number; text: string }> = {
  sm: { px: 24, text: "0.625rem" },
  md: { px: 32, text: "0.75rem" },
  lg: { px: 40, text: "0.875rem" },
  xl: { px: 48, text: "1rem" },
}

// ---------------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------------

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ src, alt, fallback, size = "md", className }, ref) => {
    const { px, text } = sizeMap[size]
    const dimension = `${px}px`

    return (
      <RadixAvatar.Root
        ref={ref}
        className={clsx("avatar-root", `avatar-root--${size}`, className)}
        style={
          {
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            verticalAlign: "middle",
            overflow: "hidden",
            userSelect: "none",
            width: dimension,
            height: dimension,
            minWidth: dimension,
            borderRadius: "9999px",
            background: "var(--color-muted)",
          } as React.CSSProperties
        }
      >
        {src && (
          <RadixAvatar.Image
            src={src}
            alt={alt ?? ""}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "inherit",
            }}
          />
        )}
        <RadixAvatar.Fallback
          delayMs={src ? 300 : 0}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--color-muted)",
            color: "var(--color-muted-fg)",
            fontSize: text,
            fontWeight: 600,
            lineHeight: 1,
            borderRadius: "inherit",
            letterSpacing: "0.02em",
          }}
        >
          {fallback?.slice(0, 2).toUpperCase() ?? "?"}
        </RadixAvatar.Fallback>
      </RadixAvatar.Root>
    )
  }
)

Avatar.displayName = "Avatar"

// ---------------------------------------------------------------------------
// AvatarGroup
// ---------------------------------------------------------------------------

export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ max = 5, size = "md", className, children }, ref) => {
    const childArray = React.Children.toArray(children)
    const visible = childArray.slice(0, max)
    const overflow = childArray.length - max

    const { px, text } = sizeMap[size]
    const dimension = `${px}px`
    const overlapOffset = `-${Math.round(px * 0.25)}px`

    return (
      <div
        ref={ref}
        role="group"
        aria-label={`${childArray.length} avatars`}
        className={clsx("avatar-group", className)}
        style={{
          display: "inline-flex",
          flexDirection: "row",
        }}
      >
        {visible.map((child, index) => (
          <span
            key={index}
            style={{
              display: "inline-flex",
              marginInlineStart: index === 0 ? 0 : overlapOffset,
              borderRadius: "9999px",
              outline: `2px solid var(--color-background)`,
              zIndex: visible.length - index,
              position: "relative",
            }}
          >
            {React.isValidElement(child)
              ? React.cloneElement(child as React.ReactElement<AvatarProps>, {
                  size,
                })
              : child}
          </span>
        ))}

        {overflow > 0 && (
          <span
            aria-label={`${overflow} more`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: dimension,
              height: dimension,
              minWidth: dimension,
              borderRadius: "9999px",
              background: "var(--color-muted)",
              color: "var(--color-muted-fg)",
              fontSize: text,
              fontWeight: 600,
              marginInlineStart: overlapOffset,
              outline: `2px solid var(--color-background)`,
              position: "relative",
              zIndex: 0,
              userSelect: "none",
            }}
          >
            +{overflow}
          </span>
        )}
      </div>
    )
  }
)

AvatarGroup.displayName = "AvatarGroup"
```

## עיקרון CSS Variables
```css
/* אין צבעים קשיחים */
background: var(--color-primary);
color: var(--color-text);
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
