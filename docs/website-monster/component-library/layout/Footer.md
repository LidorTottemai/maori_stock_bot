# Footer

> **קטגוריה:** layout
> **תלויות:** none
> **Storybook:** src/stories/layout/Footer.stories.tsx
> **קוד:** src/layout/Footer.tsx
> **עלות בנייה:** ~30 דקות

## מה זה
Footer רב-עמודות לאתרים. כולל logo + תיאור, קבוצות קישורים, אייקוני סושיאל, copyright. Responsive grid. RTL תמיכה.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Multi-column | 4 עמודות |
| Simple | logo + copyright בלבד |
| With newsletter | form הרשמה לניוזלטר |
| Dark | dark background |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| logo | `ReactNode` | — | — |
| description | `string` | — | תיאור קצר |
| columns | `FooterColumn[]` | — | עמודות קישורים |
| social | `SocialLink[]` | — | אייקוני סושיאל |
| copyright | `string` | — | — |
| bottomLinks | `{ label: string; href: string }[]` | — | Privacy, Terms |

## שימוש בסיסי
```tsx
import { Footer } from "@tottemai/ui"

<Footer
  logo={<span className="font-bold text-xl">MyBrand</span>}
  description="עסק מקצועי בישראל"
  columns={[
    { title: "שירותים", links: [{ label: "עיסוי", href: "/services/massage" }] },
    { title: "חברה", links: [{ label: "אודות", href: "/about" }] },
  ]}
  social={[{ platform: "instagram", href: "https://instagram.com/..." }]}
  copyright="© 2025 MyBrand. כל הזכויות שמורות"
/>
```

## קוד מלא
```tsx
// src/layout/Footer.tsx
import * as React from "react"
import { cn } from "../cn"

interface FooterLink { label: string; href: string }
interface FooterColumn { title: string; links: FooterLink[] }
interface SocialLink { platform: "instagram" | "facebook" | "twitter" | "linkedin" | "youtube" | "tiktok"; href: string }

interface FooterProps {
  logo?: React.ReactNode
  description?: string
  columns?: FooterColumn[]
  social?: SocialLink[]
  copyright?: string
  bottomLinks?: FooterLink[]
  className?: string
}

const socialIcons: Record<string, string> = {
  instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  facebook: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
}

function Footer({ logo, description, columns = [], social = [], copyright, bottomLinks = [], className }: FooterProps) {
  return (
    <footer className={cn("footer", className)}>
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand column */}
          <div className="footer-brand">
            {logo && <div className="footer-logo">{logo}</div>}
            {description && <p className="footer-desc">{description}</p>}
            {social.length > 0 && (
              <div className="footer-social">
                {social.map((s) => (
                  <a key={s.platform} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.platform} className="footer-social-link">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d={socialIcons[s.platform] ?? ""} />
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title} className="footer-col">
              <h3 className="footer-col-title">{col.title}</h3>
              <ul className="footer-col-links">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="footer-link">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">{copyright}</p>
          {bottomLinks.length > 0 && (
            <div className="footer-bottom-links">
              {bottomLinks.map((link) => (
                <a key={link.href} href={link.href} className="footer-bottom-link">{link.label}</a>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .footer { background: var(--color-surface); border-top: 1px solid var(--color-border); }
        .footer-inner { max-width: 1280px; margin: 0 auto; padding: 48px 24px 24px; }
        .footer-grid { display: grid; grid-template-columns: 2fr repeat(auto-fit, minmax(160px, 1fr)); gap: 40px; margin-bottom: 40px; }
        @media (max-width: 640px) { .footer-grid { grid-template-columns: 1fr; } }
        .footer-logo { margin-bottom: 12px; }
        .footer-desc { font-size: 0.875rem; color: var(--color-text-muted); line-height: 1.6; max-width: 280px; }
        .footer-social { display: flex; gap: 12px; margin-top: 20px; }
        .footer-social-link { color: var(--color-text-muted); transition: color 0.15s; }
        .footer-social-link:hover { color: var(--color-text); }
        .footer-col-title { font-size: 0.8125rem; font-weight: 600; color: var(--color-text); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }
        .footer-col-links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        .footer-link { font-size: 0.875rem; color: var(--color-text-muted); text-decoration: none; transition: color 0.15s; }
        .footer-link:hover { color: var(--color-text); }
        .footer-bottom { border-top: 1px solid var(--color-border); padding-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .footer-copyright { font-size: 0.8125rem; color: var(--color-text-muted); }
        .footer-bottom-links { display: flex; gap: 20px; }
        .footer-bottom-link { font-size: 0.8125rem; color: var(--color-text-muted); text-decoration: none; transition: color 0.15s; }
        .footer-bottom-link:hover { color: var(--color-text); }
      `}</style>
    </footer>
  )
}

export { Footer }
```

## בדיקות סיום
- [ ] Grid responsive
- [ ] Social icons מוצגים
- [ ] CSS variables בלבד
- [ ] RTL תמיכה
- [ ] מיוצא ב-src/index.ts
- [ ] Story ב-Storybook

← [[00 - Library Overview & Build Plan]]
