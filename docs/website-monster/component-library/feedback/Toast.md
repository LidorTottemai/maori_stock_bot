# Toast

> **קטגוריה:** feedback
> **תלויות:** sonner, react, clsx
> **Storybook:** src/stories/Toast.stories.tsx
> **קוד:** src/feedback/Toast.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
התראות Toast מבוססות Sonner. מציג הודעות חולפות בפינת המסך עם וריאנטים: default/success/error/warning/loading. תומך בפעולות (actions), תיאורים, הבטחות (Promise), וניהול מיקום גמיש. הקומפוננטה עוטפת את Sonner ומחילה CSS variables לעיצוב אחיד עם שאר ספריית הרכיבים.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | Toast בסיסי בצבע ניטרלי |
| Success | Toast הצלחה עם אייקון וי ירוק |
| Error | Toast שגיאה עם אייקון X אדום |
| Warning | Toast אזהרה עם אייקון משולש צהוב |
| Loading | Toast טעינה עם ספינר |
| With Action | Toast עם כפתור פעולה |
| With Description | Toast עם כותרת ותיאור ארוך |
| Promise Toast | Toast שמתעדכן אוטומטית לפי מצב Promise |

## Props API

### Toaster Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| position | `'top-left' \| 'top-center' \| 'top-right' \| 'bottom-left' \| 'bottom-center' \| 'bottom-right'` | `'bottom-right'` | מיקום Toast-ים על המסך |
| richColors | `boolean` | `true` | שימוש בצבעים עשירים לוריאנטים |
| closeButton | `boolean` | `false` | כפתור X לסגירה ידנית |
| duration | `number` | `4000` | זמן הצגה במילישניות |
| dir | `'ltr' \| 'rtl' \| 'auto'` | `'auto'` | כיוון טקסט |

### toast() function API
| קריאה | תיאור |
|--------|-------|
| `toast(message)` | Toast ברירת מחדל |
| `toast.success(message, options?)` | Toast הצלחה |
| `toast.error(message, options?)` | Toast שגיאה |
| `toast.warning(message, options?)` | Toast אזהרה |
| `toast.loading(message, options?)` | Toast טעינה עם ספינר |
| `toast.promise(promise, options)` | Toast שמתעדכן לפי מצב Promise |
| `toast.dismiss(id?)` | סגירת Toast לפי ID או כל ה-Toasts |

## שימוש בסיסי
```tsx
import { Toaster, toast } from "@tottemai/ui"

// הוסף Toaster פעם אחת בשורש האפליקציה
function App() {
  return (
    <>
      <Toaster position="bottom-right" richColors />
      {/* שאר האפליקציה */}
    </>
  )
}

// שימוש בכל מקום
toast("ההגדרות נשמרו")
toast.success("הפעולה הצליחה!")
toast.error("שגיאה בטעינת הנתונים")
toast.warning("שים לב: הפגישה מתחילה בעוד 5 דקות")

// עם תיאור
toast.success("המשתמש נוסף", {
  description: "יגאל כהן נוסף בהצלחה לצוות.",
})

// עם פעולה
toast.error("הפעולה נכשלה", {
  action: {
    label: "נסה שוב",
    onClick: () => retryAction(),
  },
})

// Promise
toast.promise(saveData(), {
  loading: "שומר...",
  success: "נשמר בהצלחה!",
  error: "שגיאה בשמירה",
})
```

## קוד מלא
```tsx
// src/feedback/Toast.tsx
import React from "react"
import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner"
import clsx from "clsx"

// ─── Re-export the toast function directly ────────────────────────────────────
// All toast() calls go through sonner unchanged
export { sonnerToast as toast }

// ─── Toaster props ────────────────────────────────────────────────────────────
export interface ToasterProps {
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right"
  richColors?: boolean
  closeButton?: boolean
  duration?: number
  dir?: "ltr" | "rtl" | "auto"
  className?: string
  toastOptions?: React.ComponentProps<typeof SonnerToaster>["toastOptions"]
}

// ─── Toaster wrapper ──────────────────────────────────────────────────────────
export function Toaster({
  position = "bottom-right",
  richColors = true,
  closeButton = false,
  duration = 4000,
  dir = "auto",
  className,
  toastOptions,
}: ToasterProps) {
  // Resolve auto dir from document
  const resolvedDir = React.useMemo(() => {
    if (dir !== "auto") return dir
    if (typeof document === "undefined") return "ltr"
    return (document.documentElement.dir as "ltr" | "rtl") || "ltr"
  }, [dir])

  return (
    <SonnerToaster
      position={position}
      richColors={richColors}
      closeButton={closeButton}
      duration={duration}
      dir={resolvedDir}
      className={clsx("toaster", className)}
      toastOptions={{
        // Apply CSS variable theming via inline style overrides
        style: {
          "--normal-bg": "var(--color-surface, #ffffff)",
          "--normal-border": "var(--color-border, #e2e8f0)",
          "--normal-text": "var(--color-text-primary, #0f172a)",
          "--success-bg": "var(--color-success-subtle, #f0fdf4)",
          "--success-border": "var(--color-success-border, #bbf7d0)",
          "--success-text": "var(--color-success-fg, #15803d)",
          "--error-bg": "var(--color-error-subtle, #fef2f2)",
          "--error-border": "var(--color-error-border, #fecaca)",
          "--error-text": "var(--color-error-fg, #b91c1c)",
          "--warning-bg": "var(--color-warning-subtle, #fffbeb)",
          "--warning-border": "var(--color-warning-border, #fde68a)",
          "--warning-text": "var(--color-warning-fg, #b45309)",
          fontFamily: "var(--font-sans, inherit)",
          fontSize: "var(--font-size-sm, 0.875rem)",
          borderRadius: "var(--radius-lg, 0.75rem)",
          boxShadow: "var(--shadow-lg, 0 10px 30px rgba(0,0,0,0.12))",
        } as React.CSSProperties,
        className: "toast",
        ...toastOptions,
      }}
    />
  )
}

// ─── Convenience re-exports for named access ──────────────────────────────────
export type { ExternalToast } from "sonner"

/*
  Usage notes:
  ─────────────────────────────────────────────────────────────────────────────

  1. Mount <Toaster /> once at the root of your app (e.g., in App.tsx or
     layout.tsx). It renders the portal that displays all toasts.

  2. Call `toast()` from anywhere in your component tree — no context or
     prop-drilling needed.

  3. CSS variable mapping:
     Sonner uses its own set of CSS custom properties (--normal-bg, etc.).
     The Toaster wrapper bridges them to your design system's variables
     via the toastOptions.style object above. Override any mapping by
     passing your own toastOptions.

  4. RTL: pass dir="rtl" (or dir="auto" with a dir="rtl" on <html>) and
     Sonner will mirror the toast layout automatically.

  5. Promise example:
     const id = toast.loading("טוען נתונים...")
     fetchData()
       .then(() => toast.success("הנתונים נטענו!", { id }))
       .catch(() => toast.error("שגיאה בטעינה", { id }))

     // Or shorthand:
     toast.promise(fetchData(), {
       loading: "טוען...",
       success: (data) => `נטענו ${data.length} רשומות`,
       error: (err) => `שגיאה: ${err.message}`,
     })
*/
```

## בדיקות סיום
- [ ] מרנדר בלי שגיאות
- [ ] כל ה-variants פועלים
- [ ] CSS variables בלבד
- [ ] Accessible (aria-*, keyboard nav)
- [ ] RTL תמיכה
- [ ] מיוצא ב-src/index.ts
- [ ] Story ב-Storybook

← [[00 - Library Overview & Build Plan]]
