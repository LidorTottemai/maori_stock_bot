# SkipLink

> **קטגוריה:** a11y
> **קובץ:** `src/a11y/SkipLink.tsx`
> **חובה:** מותקן בכל אתר — ראשון בDOM

---

## מה זה

קישור "דלג לתוכן הראשי" — נסתר מסיכוסים אך נגיש למשתמשי מקלדת ו-screen reader.
כשמשתמש מקלדת לוחץ Tab, הקישור מופיע בראש הדף לפני כל תוכן אחר.

---

## Props

```ts
interface SkipLinkProps {
  locale?: "he" | "en"   // default: "he"
  href?:   string        // default: "#main-content"
}
```

---

## קוד

```tsx
// src/a11y/SkipLink.tsx
const TEXT = {
  he: "דלג לתוכן הראשי",
  en: "Skip to main content",
}

export function SkipLink({ locale = "he", href = "#main-content" }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={[
        // נסתר כשלא ב-focus
        "sr-only",
        // נגלה ב-focus (Tailwind sr-only override)
        "focus:not-sr-only",
        "focus:fixed focus:top-4 focus:z-[10000]",
        locale === "he" ? "focus:right-4" : "focus:left-4",
        "focus:rounded-lg",
        "focus:bg-[var(--color-primary)] focus:text-white",
        "focus:px-4 focus:py-2",
        "focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2",
        "focus:no-underline focus:font-medium",
      ].join(" ")}
    >
      {TEXT[locale]}
    </a>
  )
}
```

---

## שימוש

```tsx
// app/[locale]/layout.tsx — ראשון בDOM, לפני כל תוכן!
import { SkipLink, AccessibilityWidget } from "@tottemai/ui"

export default function Layout({ children, params: { locale } }) {
  return (
    <html lang={locale} dir={locale === "he" ? "rtl" : "ltr"}>
      <body>
        <SkipLink locale={locale} />     {/* ← ראשון */}
        <Navbar />
        <main id="main-content">        {/* ← href חייב להתאים */}
          {children}
        </main>
        <Footer />
        <AccessibilityWidget locale={locale} ... />
      </body>
    </html>
  )
}
```

---

## בדיקות

- [ ] Tab ראשון בדף → SkipLink מופיע בפינה הנכונה (RTL/LTR)
- [ ] Enter על הקישור → קופץ ל-`#main-content`
- [ ] Tab שני → SkipLink נעלם, focus עובר לרכיב הבא
- [ ] Screen reader מכריז על הטקסט ("דלג לתוכן הראשי")
- [ ] `id="main-content"` קיים על `<main>`

← [[../00 - Library Overview & Build Plan]]
