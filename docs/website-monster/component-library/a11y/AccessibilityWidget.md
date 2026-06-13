# AccessibilityWidget

> **קטגוריה:** a11y
> **קובץ:** `src/a11y/AccessibilityWidget.tsx`
> **חובה:** מותקן בכל אתר — תקן ישראלי 5568

---

## מה זה

כפתור נגישות צף (fixed) עם פאנל 10 כלים. נבנה מאפס — ללא EqualWeb / UserWay.
הצבעים אוטומטיים לפי `var(--color-primary)` של האתר.
תומך עברית ואנגלית דרך `locale` prop, ללא תלות ב-next-intl.

---

## Props

```ts
interface AccessibilityWidgetProps {
  businessName: string
  phone:        string
  email?:       string
  statementUrl?: string           // default: "/accessibility-statement"
  locale?:      "he" | "en"      // default: "he"
  // position נגזר אוטומטית מlocale: he → bottom-start, en → bottom-end
}
```

---

## 10 הכלים

| # | כלי | סוג | ערכים |
|---|-----|-----|-------|
| 1 | גודל גופן / Text Size | cycle3 | רגיל → +12% → +30% |
| 2 | ניגודיות / Contrast | cycle3 | רגיל → גבוהה → הפוכה |
| 3 | הדגש קישורים / Highlight Links | bool | רקע צהוב על `<a>` |
| 4 | קו תחת קישורים / Underline Links | bool | underline תמידי |
| 5 | סמן גדול / Big Cursor | bool | cursor גדול |
| 6 | עצור אנימציות / Stop Animations | bool | duration → 0.01ms |
| 7 | גופן קריא / Readable Font | bool | Arial / system-ui |
| 8 | גובה שורה / Line Height | cycle3 | רגיל → 1.5x → 2x |
| 9 | רווח אותיות / Letter Spacing | cycle3 | רגיל → +1px → +3px |
| 10 | רווח מילים / Word Spacing | bool | +0.3em |

---

## ארכיטקטורה — data-attributes

כל כלי מפעיל `data-a11y-*` attribute על `<html>` → CSS ב-`a11y.css` מגיב:

```ts
document.documentElement.dataset.a11yFontSize   = String(opts.fontSize)   // "0" | "1" | "2"
document.documentElement.dataset.a11yContrast   = opts.contrast            // "normal" | "high" | "inverted"
document.documentElement.dataset.a11yHighlight  = String(opts.highlightLinks)
// ...וכן הלאה לכל 10 אפשרויות
```

יתרון: CSS בלבד → אין overhead על כל render, עובד עם SSR.

---

## i18n — ללא תלות חיצונית

```ts
const LABELS = {
  he: {
    title:         "כלי נגישות",
    fontSize:      "גודל גופן",
    contrast:      "ניגודיות",
    highlightLinks:"הדגש קישורים",
    underlineLinks:"קו תחת קישורים",
    bigCursor:     "סמן גדול",
    stopAnimations:"עצור אנימציות",
    readableFont:  "גופן קריא",
    lineHeight:    "גובה שורה",
    letterSpacing: "רווח אותיות",
    wordSpacing:   "רווח מילים",
    reset:         "איפוס הגדרות",
    statement:     "הצהרת נגישות",
    open:          "פתח תפריט נגישות",
    values: { normal: "רגיל", large: "גדול", xlarge: "גדול מאוד", on: "פעיל", off: "כבוי",
              high: "גבוהה", inverted: "הפוכה", x15: "1.5×", x2: "2×", p1: "+1px", p3: "+3px" },
  },
  en: {
    title:         "Accessibility Tools",
    fontSize:      "Text Size",
    contrast:      "Contrast",
    highlightLinks:"Highlight Links",
    underlineLinks:"Underline Links",
    bigCursor:     "Large Cursor",
    stopAnimations:"Stop Animations",
    readableFont:  "Readable Font",
    lineHeight:    "Line Height",
    letterSpacing: "Letter Spacing",
    wordSpacing:   "Word Spacing",
    reset:         "Reset Settings",
    statement:     "Accessibility Statement",
    open:          "Open accessibility menu",
    values: { normal: "Normal", large: "Large", xlarge: "X-Large", on: "On", off: "Off",
              high: "High", inverted: "Inverted", x15: "1.5×", x2: "2×", p1: "+1px", p3: "+3px" },
  },
}
```

---

## קוד מלא

```tsx
// src/a11y/AccessibilityWidget.tsx
"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "../cn"

interface A11yOptions {
  fontSize:       0 | 1 | 2
  contrast:       "normal" | "high" | "inverted"
  highlightLinks: boolean
  underlineLinks: boolean
  bigCursor:      boolean
  stopAnimations: boolean
  readableFont:   boolean
  lineHeight:     0 | 1 | 2
  letterSpacing:  0 | 1 | 2
  wordSpacing:    boolean
}

const DEFAULT: A11yOptions = {
  fontSize: 0, contrast: "normal",
  highlightLinks: false, underlineLinks: false,
  bigCursor: false, stopAnimations: false, readableFont: false,
  lineHeight: 0, letterSpacing: 0, wordSpacing: false,
}

interface AccessibilityWidgetProps {
  businessName:  string
  phone:         string
  email?:        string
  statementUrl?: string
  locale?:       "he" | "en"
}

export function AccessibilityWidget({
  businessName,
  phone,
  email,
  statementUrl = "/accessibility-statement",
  locale = "he",
}: AccessibilityWidgetProps) {
  const [open, setOpen] = useState(false)
  const [opts, setOpts] = useState<A11yOptions>(DEFAULT)
  const panelRef = useRef<HTMLDivElement>(null)
  const t = LABELS[locale]
  const isRTL = locale === "he"

  // Restore from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("a11y-opts")
      if (saved) setOpts(JSON.parse(saved))
    } catch {}
  }, [])

  // Apply to <html> data-attributes + persist
  useEffect(() => {
    const h = document.documentElement
    h.dataset.a11yFontSize    = String(opts.fontSize)
    h.dataset.a11yContrast    = opts.contrast
    h.dataset.a11yHighlight   = String(opts.highlightLinks)
    h.dataset.a11yUnderline   = String(opts.underlineLinks)
    h.dataset.a11yCursor      = String(opts.bigCursor)
    h.dataset.a11yAnimations  = String(opts.stopAnimations)
    h.dataset.a11yFont        = String(opts.readableFont)
    h.dataset.a11yLineHeight  = String(opts.lineHeight)
    h.dataset.a11yLetterSpace = String(opts.letterSpacing)
    h.dataset.a11yWordSpace   = String(opts.wordSpacing)
    try { localStorage.setItem("a11y-opts", JSON.stringify(opts)) } catch {}
  }, [opts])

  // Close on Escape / outside click
  useEffect(() => {
    const onKey   = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    const onClick = (e: MouseEvent)    => {
      if (open && panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("keydown",   onKey)
    document.addEventListener("mousedown", onClick)
    return () => {
      document.removeEventListener("keydown",   onKey)
      document.removeEventListener("mousedown", onClick)
    }
  }, [open])

  const cycle3 = useCallback((key: keyof A11yOptions) =>
    setOpts(p => ({ ...p, [key]: ((p[key] as number) + 1) % 3 })), [])

  const toggle = useCallback((key: keyof A11yOptions) =>
    setOpts(p => ({ ...p, [key]: !p[key] })), [])

  const positionClass = isRTL ? "bottom-6 start-6" : "bottom-6 end-6"
  const panelPosClass = isRTL ? "bottom-16 start-0" : "bottom-16 end-0"

  return (
    <div ref={panelRef} className={cn("fixed z-[9999]", positionClass)} dir={isRTL ? "rtl" : "ltr"}>
      {/* כפתור צף */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={t.open}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          "w-14 h-14 rounded-full shadow-xl",
          "bg-[var(--color-primary)] text-white",
          "flex items-center justify-center",
          "focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)] focus:ring-offset-2",
          "transition-transform hover:scale-110",
        )}
      >
        {/* Wheelchair icon — embedded SVG, no deps */}
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="4" r="2"/>
          <path d="M10 9L8 17h8l1-5H10V9z"/>
          <path d="M8 17c0 2.2 1.8 4 4 4s4-1.8 4-4"/>
        </svg>
      </button>

      {/* פאנל */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.title}
          className={cn(
            "absolute w-72 rounded-2xl shadow-2xl p-4 space-y-2",
            "bg-[var(--color-surface)] border border-[var(--color-border)]",
            panelPosClass,
          )}
        >
          <h2 className="text-base font-bold text-[var(--color-text)] mb-3">{t.title}</h2>

          <A11yRow label={t.fontSize}       value={[t.values.normal, t.values.large, t.values.xlarge][opts.fontSize]}  active={opts.fontSize > 0}       onClick={() => cycle3("fontSize")} />
          <A11yRow label={t.contrast}       value={{ normal: t.values.normal, high: t.values.high, inverted: t.values.inverted }[opts.contrast]} active={opts.contrast !== "normal"} onClick={() => setOpts(p => ({ ...p, contrast: p.contrast === "normal" ? "high" : p.contrast === "high" ? "inverted" : "normal" }))} />
          <A11yRow label={t.highlightLinks} value={opts.highlightLinks ? t.values.on : t.values.off} active={opts.highlightLinks} onClick={() => toggle("highlightLinks")} />
          <A11yRow label={t.underlineLinks} value={opts.underlineLinks ? t.values.on : t.values.off} active={opts.underlineLinks} onClick={() => toggle("underlineLinks")} />
          <A11yRow label={t.bigCursor}      value={opts.bigCursor      ? t.values.on : t.values.off} active={opts.bigCursor}      onClick={() => toggle("bigCursor")} />
          <A11yRow label={t.stopAnimations} value={opts.stopAnimations ? t.values.on : t.values.off} active={opts.stopAnimations} onClick={() => toggle("stopAnimations")} />
          <A11yRow label={t.readableFont}   value={opts.readableFont   ? t.values.on : t.values.off} active={opts.readableFont}   onClick={() => toggle("readableFont")} />
          <A11yRow label={t.lineHeight}     value={[t.values.normal, t.values.x15, t.values.x2][opts.lineHeight]}    active={opts.lineHeight > 0}     onClick={() => cycle3("lineHeight")} />
          <A11yRow label={t.letterSpacing}  value={[t.values.normal, t.values.p1,  t.values.p3][opts.letterSpacing]} active={opts.letterSpacing > 0}  onClick={() => cycle3("letterSpacing")} />
          <A11yRow label={t.wordSpacing}    value={opts.wordSpacing    ? t.values.on : t.values.off} active={opts.wordSpacing}    onClick={() => toggle("wordSpacing")} />

          <div className="pt-2 space-y-1 border-t border-[var(--color-border)]">
            <button
              onClick={() => setOpts(DEFAULT)}
              className="w-full text-center text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] py-1"
            >
              {t.reset}
            </button>
            <a
              href={statementUrl}
              className="block text-center text-sm text-[var(--color-primary)] hover:underline py-1"
            >
              {t.statement}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

function A11yRow({ label, value, active, onClick }: {
  label: string; value: string; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex justify-between items-center",
        "rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-[var(--color-primary)] text-white"
          : "bg-[var(--color-surface-2,#f3f4f6)] text-[var(--color-text)] hover:bg-[var(--color-border)]",
      )}
    >
      <span>{label}</span>
      <span className="text-xs opacity-70">{value}</span>
    </button>
  )
}
```

---

## שימוש

```tsx
import { AccessibilityWidget } from "@tottemai/ui"

// layout.tsx
<AccessibilityWidget
  locale={params.locale}          // "he" | "en"
  businessName="ספא רוז"
  phone="052-1234567"
  email="info@spa-rose.co.il"
  statementUrl={`/${params.locale}/accessibility-statement`}
/>
```

---

## בדיקות

- [ ] כפתור נראה בכל דף, בפינה הנכונה (RTL/LTR)
- [ ] פאנל נפתח בלחיצה, נסגר ב-Escape ובלחיצה מחוץ
- [ ] כל 10 כלים עובדים וגלויים
- [ ] שפת הפאנל תואמת locale ("he" → עברית, "en" → English)
- [ ] הגדרות נשמרות ב-localStorage בין רענונים
- [ ] focus trap: Tab לא יוצא מהפאנל כשהוא פתוח
- [ ] קישור "הצהרת נגישות" מגיע לדף הנכון
- [ ] צבע הכפתור = `var(--color-primary)` של האתר

← [[../00 - Library Overview & Build Plan]]
