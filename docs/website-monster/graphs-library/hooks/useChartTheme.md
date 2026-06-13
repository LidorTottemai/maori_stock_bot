# useChartTheme

> **קטגוריה:** hooks
> **תלויות:** none
> **קוד:** src/hooks/useChartTheme.ts
> **עלות בנייה:** ~10 דקות

## מה זה
מחזיר object עם כל הצבעים מ-CSS variables — משמש לכל הגרפים. מרכז את הtheming במקום אחד.

## Returns
```ts
{
  primary: string    // "var(--color-primary)"
  secondary: string
  accent: string
  muted: string      // "var(--color-text-muted)"
  surface: string    // "var(--color-surface)"
  border: string     // "var(--color-border)"
  text: string       // "var(--color-text)"
  series: string[]   // 5 צבעים לסדרות מרובות
}
```

## קוד מלא
```ts
// src/hooks/useChartTheme.ts
export function useChartTheme() {
  return {
    primary:   "var(--color-primary)",
    secondary: "var(--color-secondary)",
    accent:    "var(--color-accent)",
    muted:     "var(--color-text-muted)",
    surface:   "var(--color-surface)",
    border:    "var(--color-border)",
    text:      "var(--color-text)",
    series: [
      "var(--color-primary)",
      "var(--color-secondary)",
      "var(--color-accent)",
      "color-mix(in oklch, var(--color-primary) 60%, white)",
      "color-mix(in oklch, var(--color-secondary) 60%, white)",
    ],
  }
}
```

## בדיקות סיום
- [ ] שינוי `--color-primary` בCSS משנה גרפים אוטומטית
- [ ] `series[i]` פועל בכל גרפי multi-series
- [ ] מיוצא ב-src/index.ts

← [[../00 - Library Overview & Build Plan]]
