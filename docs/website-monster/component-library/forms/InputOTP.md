# InputOTP

> **קטגוריה:** forms
> **תלויות:** input-otp
> **Storybook:** src/stories/forms/InputOTP.stories.tsx
> **קוד:** src/forms/InputOTP.tsx
> **עלות בנייה:** ~25 דקות

## מה זה
OTP / verification code input. מציג N slots נפרדים, מתקדם אוטומטית, תומך ב-paste. שימושי ל-SMS verification, 2FA, PIN codes.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| 6 digits | standard OTP |
| 4 digits | PIN |
| With separator | XXX-XXX |
| Error state | כל ה-slots אדומים |
| Completed | כל ה-slots ירוקים |
| Disabled | — |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| length | `number` | `6` | מספר slots |
| value | `string` | — | controlled |
| onChange | `(value: string) => void` | — | — |
| onComplete | `(value: string) => void` | — | fires when all filled |
| disabled | `boolean` | false | — |
| error | `boolean` | false | red state |
| separator | `number` | — | adds separator after this index |

## שימוש בסיסי
```tsx
import { InputOTP } from "@tottemai/ui"

<InputOTP
  length={6}
  onComplete={(code) => verifyCode(code)}
/>
```

## קוד מלא
```tsx
"use client"
// src/forms/InputOTP.tsx
import * as React from "react"
import { OTPInput, SlotProps } from "input-otp"
import { cn } from "../cn"

interface InputOTPProps {
  length?: number
  value?: string
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  error?: boolean
  separator?: number
  className?: string
}

function InputOTP({ length = 6, value, onChange, onComplete, disabled, error, separator, className }: InputOTPProps) {
  return (
    <OTPInput
      maxLength={length}
      value={value}
      onChange={onChange}
      onComplete={onComplete}
      disabled={disabled}
      containerClassName={cn("otp-container", className)}
      render={({ slots }) => (
        <>
          {slots.map((slot, i) => (
            <React.Fragment key={i}>
              <OTPSlot slot={slot} error={error} />
              {separator && i === separator - 1 && <span className="otp-separator">–</span>}
            </React.Fragment>
          ))}
        </>
      )}
    />
  )
}

function OTPSlot({ slot, error }: { slot: SlotProps; error?: boolean }) {
  return (
    <div
      className={cn(
        "otp-slot",
        slot.isActive && "otp-slot--active",
        slot.char && "otp-slot--filled",
        error && "otp-slot--error",
      )}
    >
      {slot.char ?? <span className="otp-caret">{slot.isActive ? "|" : null}</span>}
      <style>{`
        .otp-container { display: flex; align-items: center; gap: 8px; }
        .otp-slot {
          width: 44px; height: 52px; display: flex; align-items: center; justify-content: center;
          border: 1.5px solid var(--color-border); border-radius: var(--radius-md, 8px);
          font-size: 1.25rem; font-weight: 600; color: var(--color-text);
          background: var(--color-surface); transition: border-color 0.15s, box-shadow 0.15s;
        }
        .otp-slot--active { border-color: var(--color-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent); }
        .otp-slot--error { border-color: var(--color-error, #ef4444); }
        .otp-caret { width: 1px; height: 1.2em; background: var(--color-primary); animation: otp-blink 1s step-end infinite; }
        .otp-separator { color: var(--color-text-muted); font-size: 1.25rem; }
        @keyframes otp-blink { 50% { opacity: 0; } }
      `}</style>
    </div>
  )
}

export { InputOTP }
```

## בדיקות סיום
- [ ] Auto-advance בהקלדה
- [ ] Paste עובד
- [ ] onComplete fires כשמלא
- [ ] CSS variables בלבד
- [ ] Accessible
- [ ] מיוצא ב-src/index.ts
- [ ] Story ב-Storybook

← [[00 - Library Overview & Build Plan]]
