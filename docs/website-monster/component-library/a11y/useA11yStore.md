# useA11yStore

> **קטגוריה:** a11y
> **קובץ:** `src/a11y/useA11yStore.ts`
> **תלויות:** `zustand` (peer dep של `@tottemai/ui`)

---

## מה זה

Zustand store עם `persist` middleware — מקור האמת לכל הגדרות הנגישות.
`AccessibilityWidget` כותב אליו, `A11yProvider` קורא ממנו ומפעיל את השינויים.

---

## State

```ts
export interface A11yState {
  // ─── Getters ───────────────────────────────
  fontSize:       0 | 1 | 2          // 0=רגיל, 1=+12%, 2=+30%
  contrast:       "normal" | "high" | "inverted"
  highlightLinks: boolean
  underlineLinks: boolean
  bigCursor:      boolean
  stopAnimations: boolean
  readableFont:   boolean
  lineHeight:     0 | 1 | 2          // 0=inherit, 1=1.5, 2=2
  letterSpacing:  0 | 1 | 2          // 0=0, 1=1px, 2=3px
  wordSpacing:    boolean

  // ─── Actions ───────────────────────────────
  setFontSize:       (v: 0 | 1 | 2) => void
  setContrast:       (v: "normal" | "high" | "inverted") => void
  toggleHighlight:   () => void
  toggleUnderline:   () => void
  toggleBigCursor:   () => void
  toggleAnimations:  () => void
  toggleReadableFont:() => void
  setLineHeight:     (v: 0 | 1 | 2) => void
  setLetterSpacing:  (v: 0 | 1 | 2) => void
  toggleWordSpacing: () => void
  reset:             () => void
}
```

---

## קוד

```ts
// src/a11y/useA11yStore.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"

const DEFAULTS = {
  fontSize: 0 as const,
  contrast: "normal" as const,
  highlightLinks: false,
  underlineLinks: false,
  bigCursor: false,
  stopAnimations: false,
  readableFont: false,
  lineHeight: 0 as const,
  letterSpacing: 0 as const,
  wordSpacing: false,
}

export const useA11yStore = create<A11yState>()(
  persist(
    (set) => ({
      ...DEFAULTS,

      setFontSize:        (fontSize)       => set({ fontSize }),
      setContrast:        (contrast)       => set({ contrast }),
      toggleHighlight:    ()               => set(s => ({ highlightLinks: !s.highlightLinks })),
      toggleUnderline:    ()               => set(s => ({ underlineLinks: !s.underlineLinks })),
      toggleBigCursor:    ()               => set(s => ({ bigCursor:      !s.bigCursor })),
      toggleAnimations:   ()               => set(s => ({ stopAnimations: !s.stopAnimations })),
      toggleReadableFont: ()               => set(s => ({ readableFont:   !s.readableFont })),
      setLineHeight:      (lineHeight)     => set({ lineHeight }),
      setLetterSpacing:   (letterSpacing)  => set({ letterSpacing }),
      toggleWordSpacing:  ()               => set(s => ({ wordSpacing:    !s.wordSpacing })),
      reset:              ()               => set(DEFAULTS),
    }),
    { name: "tottemai-a11y" }   // localStorage key
  )
)
```

---

## שימוש ישיר (נדיר — בדרך כלל דרך Widget + Provider)

```ts
// בכל רכיב שצריך לדעת את מצב הנגישות
import { useA11yStore } from "@tottemai/ui"

function MyComponent() {
  const fontSize = useA11yStore(s => s.fontSize)
  // ...
}
```

← [[../00 - Library Overview & Build Plan]]
