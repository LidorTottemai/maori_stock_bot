# A11yProvider

> **קטגוריה:** a11y
> **קובץ:** `src/a11y/A11yProvider.tsx`
> **תלויות:** `useA11yStore`, `zustand`

---

## מה זה

הגשר בין Zustand store לDOM. נמצא פעם אחת ב-`layout.tsx`.
מאזין ל-`useA11yStore` ומתרגם כל שינוי להשפעה ויזואלית על `<html>`.

**לא מרנדר כלום** — `return null`. רק תופעת לוואי על DOM.

---

## מה כל option עושה בDOM

| Option | מנגנון | למה |
|--------|--------|-----|
| `fontSize` | `html.style.fontSize` → "100%" / "112%" / "130%" | CSS cascade — כל ה-rem units מדרגים אוטומטית |
| `lineHeight` | CSS var `--a11y-line-height` | `body * { line-height: var(--a11y-line-height, inherit) }` |
| `letterSpacing` | CSS var `--a11y-letter-spacing` | same pattern |
| `wordSpacing` | CSS var `--a11y-word-spacing` | same pattern |
| `readableFont` | CSS var `--a11y-font-family` | `body { font-family: var(--a11y-font-family, var(--font-heebo)) }` |
| `contrast` | `html.style.filter` | CSS filter על כל הדף — פשוט, מכסה תמונות וSVG |
| `stopAnimations` | class `a11y-no-motion` על `<html>` | CSS class → `animation/transition-duration: 0.01ms` |
| `highlightLinks` | class `a11y-hl-links` על `<html>` | CSS class → `a { background: yellow }` |
| `underlineLinks` | class `a11y-ul-links` על `<html>` | CSS class → `a { text-decoration: underline }` |
| `bigCursor` | class `a11y-big-cursor` על `<html>` | CSS class → `cursor: url(...)` |

---

## קוד

```tsx
// src/a11y/A11yProvider.tsx
"use client"
import { useEffect } from "react"
import { useA11yStore } from "./useA11yStore"

const FONT_SIZES  = ["100%", "112%", "130%"]
const LINE_HEIGHTS   = ["", "1.5", "2"]
const LETTER_SPACINGS = ["", "1px", "3px"]

export function A11yProvider() {
  const {
    fontSize, contrast, highlightLinks, underlineLinks,
    bigCursor, stopAnimations, readableFont,
    lineHeight, letterSpacing, wordSpacing,
  } = useA11yStore()

  useEffect(() => {
    const h = document.documentElement

    // ── CSS font-size → כל rem units מדרגים אוטומטית ──────────
    h.style.fontSize = FONT_SIZES[fontSize]

    // ── CSS variables ───────────────────────────────────────────
    const setVar = (key: string, val: string) =>
      val ? h.style.setProperty(key, val) : h.style.removeProperty(key)

    setVar("--a11y-line-height",    LINE_HEIGHTS[lineHeight])
    setVar("--a11y-letter-spacing", LETTER_SPACINGS[letterSpacing])
    setVar("--a11y-word-spacing",   wordSpacing ? "0.3em" : "")
    setVar("--a11y-font-family",    readableFont ? "Arial, system-ui, sans-serif" : "")

    // ── CSS filter (contrast) ────────────────────────────────────
    h.style.filter =
      contrast === "high"     ? "contrast(150%)" :
      contrast === "inverted" ? "invert(1) hue-rotate(180deg)" :
      ""

    // ── CSS classes (boolean toggles) ───────────────────────────
    h.classList.toggle("a11y-no-motion",   stopAnimations)
    h.classList.toggle("a11y-hl-links",    highlightLinks)
    h.classList.toggle("a11y-ul-links",    underlineLinks)
    h.classList.toggle("a11y-big-cursor",  bigCursor)

  }, [fontSize, contrast, highlightLinks, underlineLinks,
      bigCursor, stopAnimations, readableFont,
      lineHeight, letterSpacing, wordSpacing])

  return null
}
```

---

## a11y.css — הCSS שמגיב לclasses ולvariables

```css
/* @tottemai/ui/a11y.css */

/* ── spacing via CSS variables ─────────────────────── */
body * {
  line-height:    var(--a11y-line-height,    inherit);
  letter-spacing: var(--a11y-letter-spacing, inherit);
  word-spacing:   var(--a11y-word-spacing,   inherit);
}

body {
  font-family: var(--a11y-font-family, var(--font-heebo, system-ui, sans-serif));
}

/* ── boolean classes ────────────────────────────────── */
.a11y-no-motion *,
.a11y-no-motion *::before,
.a11y-no-motion *::after {
  animation-duration:       0.01ms !important;
  animation-iteration-count: 1    !important;
  transition-duration:      0.01ms !important;
}

.a11y-hl-links a {
  background-color: yellow   !important;
  color:            #000000  !important;
}

.a11y-ul-links a {
  text-decoration: underline !important;
}

.a11y-big-cursor,
.a11y-big-cursor * {
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M4 4l10 26 4-10 10-4z' fill='%23000' stroke='%23fff' stroke-width='2'/%3E%3C/svg%3E") 4 4, auto !important;
}
```

> **הערה:** CSS filter על `html` (contrast) מיושם דרך JS ישיר ב-`A11yProvider`, לא דרך CSS class, כי filter: על `html` עלול להפריע ל-`position: fixed` — נבדוק בבדיקות אם יש בעיות.

---

## שילוב ב-layout.tsx

```tsx
// app/[locale]/layout.tsx
import { SkipLink, AccessibilityWidget, A11yProvider } from "@tottemai/ui"
import "@tottemai/ui/a11y.css"

export default function RootLayout({ children, params: { locale } }) {
  return (
    <html lang={locale} dir={locale === "he" ? "rtl" : "ltr"}>
      <body>
        <A11yProvider />              {/* ← מאזין לstore, אין render */}
        <SkipLink locale={locale} />
        <Navbar />
        <main id="main-content">{children}</main>
        <Footer />
        <AccessibilityWidget
          locale={locale}
          businessName={process.env.NEXT_PUBLIC_BUSINESS_NAME!}
          phone={process.env.NEXT_PUBLIC_PHONE!}
          email={process.env.NEXT_PUBLIC_EMAIL}
          statementUrl={`/${locale}/accessibility-statement`}
        />
      </body>
    </html>
  )
}
```

**סדר DOM חשוב:**
1. `A11yProvider` — ראשון (אין render, רק effect)
2. `SkipLink` — ראשון שניתן לראות ב-Tab
3. תוכן האתר
4. `AccessibilityWidget` — אחרון (כפתור צף)

---

## flow מלא

```
משתמש לוחץ "גדל גופן" ב-AccessibilityWidget
    ↓
useA11yStore().setFontSize(1)          ← Zustand action
    ↓
persist middleware → localStorage.setItem("tottemai-a11y", ...)
    ↓
A11yProvider useEffect מופעל
    ↓
document.documentElement.style.fontSize = "112%"
    ↓
כל rem unit בכל הCSS מדרג ×1.12 אוטומטית
    ↓
גופן, padding, icon size, spacing — הכל גדל יחסית
```

---

## בדיקות

- [ ] הגדלת גופן → `html.style.fontSize` משתנה
- [ ] גופן גדול → rem units בכל האתר מדרגים (כולל Navbar, כפתורים, spacing)
- [ ] ניגודיות גבוהה → `html.style.filter = "contrast(150%)"`
- [ ] עצור אנימציות → class `a11y-no-motion` על `<html>`, TextReveal נעצר
- [ ] הדגש קישורים → רקע צהוב על כל `<a>`
- [ ] position:fixed רכיבים (Navbar, Widget) לא נפגעים מ-filter (בדוק!)
- [ ] localStorage → רענון → הגדרות נשמרות
- [ ] A11yProvider לא מרנדר אף אלמנט HTML

← [[../00 - Library Overview & Build Plan]]
