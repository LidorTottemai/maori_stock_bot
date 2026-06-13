# AccessibilityStatement

> **קטגוריה:** a11y
> **קובץ:** `src/a11y/AccessibilityStatement.tsx`
> **חובה חוקית:** תקן ישראלי 5568 — הדף חייב להיות נגיש תחת `/accessibility-statement`

---

## מה זה

רכיב דף מלא — מציג את הצהרת הנגישות של האתר בהתאם לדרישות תקן ישראלי 5568.
מגיע מוכן עם כל התוכן הנדרש; site_generator.py מזריק את פרטי העסק.

---

## Props

```ts
interface AccessibilityStatementProps {
  businessName:  string
  phone:         string
  email?:        string
  domain:        string
  lastChecked:   string        // "2026-01-01" — תאריך בדיקה אחרון
  locale?:       "he" | "en"  // default: "he"
  knownIssues?:  string[]      // מגבלות נגישות ידועות (אופציונלי)
}
```

---

## מה חייב להופיע בדף (IS 5568)

```
□ הצהרת רמת תאימות: WCAG 2.0 Level AA / תקן ישראלי 5568
□ תאריך בדיקה אחרון
□ פרטי רכז/ת נגישות: שם / טלפון / אימייל
□ רשימת אמצעי הנגישות שהוטמעו
□ מגבלות ידועות (אם יש)
□ ערוץ לפנייה בבעיות נגישות
□ SLA: זמן טיפול (≤ 5 ימי עסקים)
```

---

## קוד

```tsx
// src/a11y/AccessibilityStatement.tsx
import { cn } from "../cn"

const CONTENT = {
  he: {
    title: "הצהרת נגישות",
    intro: (name: string, date: string) =>
      `${name} מחויבת לנגישות האתר לאנשים עם מוגבלות, בהתאם לתקן ישראלי 5568 (המבוסס על WCAG 2.0 Level AA) ולחוק שוויון זכויות לאנשים עם מוגבלות, תשנ"ח-1998. תאריך בדיקה אחרון: ${date}.`,
    levelTitle: "רמת הנגישות",
    levelText: "האתר עומד ברמת נגישות AA של תקן WCAG 2.0 / תקן ישראלי 5568.",
    toolsTitle: "אמצעי הנגישות",
    tools: [
      "כפתור נגישות צף — שינוי גודל גופן, ניגודיות, אנימציות, גופן קריא ועוד",
      "קישור 'דלג לתוכן' — לניווט מהיר למשתמשי מקלדת",
      "תמיכה מלאה בניווט מקלדת (Tab, Enter, Escape, חצים)",
      "תמיכה בקוראי מסך (NVDA, JAWS, VoiceOver)",
      "כל התמונות כוללות טקסט חלופי (alt)",
      "ניגודיות צבעים ≥ 4.5:1 (WCAG AA)",
      "RTL מלא לתוכן עברי",
    ],
    issuesTitle: "מגבלות ידועות",
    contactTitle: "פניות בנושא נגישות",
    contactText: "נתקלתם בבעיית נגישות? פנו אלינו — נטפל תוך 5 ימי עסקים:",
    phone: "טלפון:",
    email: "אימייל:",
    statement: (domain: string, locale: string) =>
      `דף זה זמין בכתובת: ${domain}/${locale}/accessibility-statement`,
  },
  en: {
    title: "Accessibility Statement",
    intro: (name: string, date: string) =>
      `${name} is committed to ensuring digital accessibility for people with disabilities, in accordance with Israeli Standard 5568 (based on WCAG 2.0 Level AA). Last tested: ${date}.`,
    levelTitle: "Accessibility Level",
    levelText: "This website conforms to WCAG 2.0 Level AA / Israeli Standard 5568.",
    toolsTitle: "Accessibility Features",
    tools: [
      "Floating accessibility widget — text size, contrast, animations, readable font, and more",
      "'Skip to content' link for keyboard users",
      "Full keyboard navigation (Tab, Enter, Escape, Arrow keys)",
      "Screen reader support (NVDA, JAWS, VoiceOver)",
      "All images include descriptive alt text",
      "Color contrast ratio ≥ 4.5:1 (WCAG AA)",
      "Full RTL support for Hebrew content",
    ],
    issuesTitle: "Known Limitations",
    contactTitle: "Contact Us About Accessibility",
    contactText: "Found an accessibility issue? Contact us — we'll respond within 5 business days:",
    phone: "Phone:",
    email: "Email:",
    statement: (domain: string, locale: string) =>
      `This page is available at: ${domain}/${locale}/accessibility-statement`,
  },
}

export function AccessibilityStatement({
  businessName,
  phone,
  email,
  domain,
  lastChecked,
  locale = "he",
  knownIssues = [],
}: AccessibilityStatementProps) {
  const t = CONTENT[locale]
  const isRTL = locale === "he"

  return (
    <main
      id="main-content"
      dir={isRTL ? "rtl" : "ltr"}
      className="max-w-3xl mx-auto px-4 py-16 space-y-8 text-[var(--color-text)]"
    >
      <h1 className="text-3xl font-bold">{t.title}</h1>

      <p className="text-[var(--color-text-muted)] leading-relaxed">
        {t.intro(businessName, lastChecked)}
      </p>

      <section>
        <h2 className="text-xl font-semibold mb-2">{t.levelTitle}</h2>
        <p>{t.levelText}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">{t.toolsTitle}</h2>
        <ul className="list-disc list-inside space-y-2">
          {t.tools.map((tool, i) => (
            <li key={i}>{tool}</li>
          ))}
        </ul>
      </section>

      {knownIssues.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">{t.issuesTitle}</h2>
          <ul className="list-disc list-inside space-y-2 text-[var(--color-text-muted)]">
            {knownIssues.map((issue, i) => (
              <li key={i}>{issue}</li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-3">{t.contactTitle}</h2>
        <p className="mb-3">{t.contactText}</p>
        <ul className="space-y-2">
          <li>
            {t.phone}{" "}
            <a href={`tel:${phone}`} className="text-[var(--color-primary)] hover:underline">
              {phone}
            </a>
          </li>
          {email && (
            <li>
              {t.email}{" "}
              <a href={`mailto:${email}`} className="text-[var(--color-primary)] hover:underline">
                {email}
              </a>
            </li>
          )}
        </ul>
        <p className="text-sm text-[var(--color-text-muted)] mt-4">
          {t.statement(domain, locale)}
        </p>
      </section>
    </main>
  )
}
```

---

## שימוש בכל אתר

```tsx
// app/[locale]/accessibility-statement/page.tsx
import { AccessibilityStatement } from "@tottemai/ui"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "הצהרת נגישות",
  robots: { index: true, follow: true },
}

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  return (
    <AccessibilityStatement
      locale={locale as "he" | "en"}
      businessName={process.env.NEXT_PUBLIC_BUSINESS_NAME!}
      phone={process.env.NEXT_PUBLIC_PHONE!}
      email={process.env.NEXT_PUBLIC_EMAIL}
      domain={`https://${process.env.NEXT_PUBLIC_DOMAIN}`}
      lastChecked={process.env.NEXT_PUBLIC_BUILD_DATE ?? new Date().toISOString().slice(0, 10)}
    />
  )
}
```

```ts
// site_generator.py מזריק לתוך .env:
NEXT_PUBLIC_BUILD_DATE=2026-01-15   # תאריך הבנייה האחרון
```

---

## בדיקות

- [ ] `/he/accessibility-statement` — תוכן עברי, dir="rtl"
- [ ] `/en/accessibility-statement` — תוכן אנגלי, dir="ltr"
- [ ] כל 7 אמצעי הנגישות מוצגים
- [ ] פרטי קשר: טלפון + אימייל לחיצים
- [ ] תאריך הבדיקה מוצג (NEXT_PUBLIC_BUILD_DATE)
- [ ] דף עצמו נגיש — h1→h2 היררכיה, focus outline, contrast

← [[../00 - Library Overview & Build Plan]]
