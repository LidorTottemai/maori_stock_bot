# @tottemai/ui — ספריית הרכיבים

## חזון | Vision

**עברית:** ספריית הרכיבים של Tottemai היא הבסיס לכל אתר עסקי ישראלי שנבנה אוטומטית על ידי מערכת website-monster. כל רכיב נבנה פעם אחת, נבדק לעומק, ומשמש שוב ושוב בכל פרויקט — מה שמאפשר לנו לבנות אתרים ברמה עולמית בתוך שניות.

**English:** The `@tottemai/ui` component library is the single source of truth for every auto-generated Israeli business website. Components are built once, tested thoroughly, and reused across every project. This gives every generated site a world-class UI baseline with zero duplication of effort.

---

## התקנה | Installation

### הוספת הספרייה לפרויקט

```json
// package.json
{
  "dependencies": {
    "@tottemai/ui": "github:LidorTottemai/tottemai-ui#main"
  }
}
```

```bash
npm install
# או
yarn install
```

---

## הגדרת Next.js | Next.js Configuration

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@tottemai/ui"],
};

export default nextConfig;
```

---

## הגדרת Tailwind | Tailwind Configuration

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./node_modules/@tottemai/ui/src/**/*.{ts,tsx}",
  ],
  // ...
};

export default config;
```

---

## משתני CSS | CSS Variables

כל אתר שנבנה מגדיר את המשתנים הבאים ב-`globals.css`. הרכיבים של `@tottemai/ui` צורכים את המשתנים האלו בלבד — כך כל אתר מקבל זהות ויזואלית ייחודית מבלי לשנות שורת קוד אחת בספרייה.

```css
/* globals.css */
:root {
  /* צבעים ראשיים */
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;

  /* צבעים משניים */
  --color-secondary: #64748b;
  --color-accent: #f59e0b;

  /* רקעים */
  --color-bg: #ffffff;
  --color-surface: #f8fafc;
  --color-surface-2: #f1f5f9;

  /* גבולות */
  --color-border: #e2e8f0;

  /* טקסט */
  --color-text: #0f172a;
  --color-text-muted: #475569;
  --color-text-subtle: #94a3b8;

  /* רדיוסים */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
}

[data-theme="dark"] {
  --color-primary: #3b82f6;
  --color-primary-hover: #60a5fa;
  --color-secondary: #94a3b8;
  --color-accent: #fbbf24;
  --color-bg: #0f172a;
  --color-surface: #1e293b;
  --color-surface-2: #334155;
  --color-border: #334155;
  --color-text: #f8fafc;
  --color-text-muted: #cbd5e1;
  --color-text-subtle: #64748b;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
}
```

---

## מבנה הריפו | Repository Structure

```
tottemai-ui/
├── src/
│   ├── index.ts                      ← ייצוא מרכזי של כל הרכיבים
│   ├── cn.ts                         ← פונקציית עזר לשילוב class names
│   ├── primitives/
│   │   ├── Button.tsx
│   │   ├── Icon.tsx
│   │   ├── Typography.tsx
│   │   ├── Divider.tsx
│   │   ├── Badge.tsx
│   │   └── Avatar.tsx
│   ├── forms/
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Select.tsx
│   │   ├── Checkbox.tsx
│   │   ├── Radio.tsx
│   │   ├── Switch.tsx
│   │   ├── Slider.tsx
│   │   ├── DatePicker.tsx
│   │   ├── TimePicker.tsx
│   │   ├── ColorPicker.tsx
│   │   ├── FileUpload.tsx
│   │   ├── PhoneInput.tsx
│   │   ├── OTPInput.tsx
│   │   ├── SearchInput.tsx
│   │   ├── RangeInput.tsx
│   │   ├── FormField.tsx
│   │   └── Form.tsx
│   ├── data-display/
│   │   ├── Table.tsx
│   │   ├── DataGrid.tsx
│   │   ├── List.tsx
│   │   ├── DescriptionList.tsx
│   │   ├── Stat.tsx
│   │   ├── Tag.tsx
│   │   ├── Timeline.tsx
│   │   ├── CalendarView.tsx
│   │   └── KanbanBoard.tsx
│   ├── feedback/
│   │   ├── Alert.tsx
│   │   ├── Toast.tsx
│   │   ├── Spinner.tsx
│   │   ├── Progress.tsx
│   │   ├── Skeleton.tsx
│   │   ├── EmptyState.tsx
│   │   └── ErrorBoundary.tsx
│   ├── navigation/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Breadcrumb.tsx
│   │   ├── Tabs.tsx
│   │   ├── Pagination.tsx
│   │   ├── Steps.tsx
│   │   ├── CommandPalette.tsx
│   │   ├── ContextMenu.tsx
│   │   └── MobileNav.tsx
│   ├── surfaces/
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Drawer.tsx
│   │   ├── Popover.tsx
│   │   ├── Tooltip.tsx
│   │   ├── Dropdown.tsx
│   │   └── Sheet.tsx
│   ├── layout/
│   │   ├── Container.tsx
│   │   ├── Grid.tsx
│   │   ├── Flex.tsx
│   │   ├── Stack.tsx
│   │   ├── AspectRatio.tsx
│   │   ├── Masonry.tsx
│   │   ├── Scrollable.tsx
│   │   ├── StickyHeader.tsx
│   │   ├── SplitPane.tsx
│   │   └── PageWrapper.tsx
│   ├── motion/
│   │   ├── FadeIn.tsx
│   │   ├── SlideIn.tsx
│   │   ├── ScaleIn.tsx
│   │   ├── StaggerList.tsx
│   │   ├── AnimatedCounter.tsx
│   │   ├── TypingText.tsx
│   │   ├── Parallax.tsx
│   │   ├── ScrollReveal.tsx
│   │   ├── Magnetic.tsx
│   │   ├── Ripple.tsx
│   │   ├── PageTransition.tsx
│   │   ├── GlowEffect.tsx
│   │   └── FloatingElement.tsx
│   ├── special/
│   │   ├── HeroSection.tsx
│   │   ├── FeatureGrid.tsx
│   │   ├── PricingCard.tsx
│   │   ├── TestimonialCard.tsx
│   │   ├── TeamCard.tsx
│   │   ├── FAQAccordion.tsx
│   │   ├── ContactForm.tsx
│   │   ├── NewsletterSignup.tsx
│   │   ├── CookieBanner.tsx
│   │   ├── WhatsAppButton.tsx
│   │   ├── GoogleMapsEmbed.tsx
│   │   ├── BusinessHours.tsx
│   │   ├── ReviewStars.tsx
│   │   ├── ImageGallery.tsx
│   │   ├── VideoPlayer.tsx
│   │   ├── SocialLinks.tsx
│   │   └── CTABanner.tsx
│   └── hooks/
│       ├── useBreakpoint.ts
│       ├── useTheme.ts
│       ├── useClickOutside.ts
│       ├── useScrollPosition.ts
│       ├── useLocalStorage.ts
│       ├── useDebounce.ts
│       └── useIntersectionObserver.ts
├── src/stories/                      ← קבצי Storybook (*.stories.tsx)
├── .storybook/
│   ├── main.ts
│   └── preview.tsx
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

### `src/cn.ts` — פונקציית עזר

```ts
// src/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### `src/index.ts` — ייצוא מרכזי

```ts
// src/index.ts — כל רכיב מיוצא מכאן
export { Button } from "./primitives/Button";
export { Icon } from "./primitives/Icon";
export { Typography } from "./primitives/Typography";
export { Divider } from "./primitives/Divider";
export { Badge } from "./primitives/Badge";
export { Avatar } from "./primitives/Avatar";

export { Input } from "./forms/Input";
export { Textarea } from "./forms/Textarea";
// ... וכן הלאה
```

---

## אינדקס רכיבים | Component Index

> סמן `[x]` כשהרכיב הושלם ונבדק. כל שם רכיב מקושר לקובץ התיעוד שלו.

### 🧱 Primitives (6)

| סטטוס | רכיב | קטגוריה |
|--------|-------|---------|
| [ ] | [[Button]] | primitives |
| [ ] | [[Icon]] | primitives |
| [ ] | [[Typography]] | primitives |
| [ ] | [[Divider]] | primitives |
| [ ] | [[Badge]] | primitives |
| [ ] | [[Avatar]] | primitives |

### 📝 Forms (17)

| סטטוס | רכיב | קטגוריה |
|--------|-------|---------|
| [ ] | [[Input]] | forms |
| [ ] | [[Textarea]] | forms |
| [ ] | [[Select]] | forms |
| [ ] | [[Checkbox]] | forms |
| [ ] | [[Radio]] | forms |
| [ ] | [[Switch]] | forms |
| [ ] | [[Slider]] | forms |
| [ ] | [[DatePicker]] | forms |
| [ ] | [[TimePicker]] | forms |
| [ ] | [[ColorPicker]] | forms |
| [ ] | [[FileUpload]] | forms |
| [ ] | [[PhoneInput]] | forms |
| [ ] | [[OTPInput]] | forms |
| [ ] | [[SearchInput]] | forms |
| [ ] | [[RangeInput]] | forms |
| [ ] | [[FormField]] | forms |
| [ ] | [[Form]] | forms |

### 📊 Data Display (9)

| סטטוס | רכיב | קטגוריה |
|--------|-------|---------|
| [ ] | [[Table]] | data-display |
| [ ] | [[DataGrid]] | data-display |
| [ ] | [[List]] | data-display |
| [ ] | [[DescriptionList]] | data-display |
| [ ] | [[Stat]] | data-display |
| [ ] | [[Tag]] | data-display |
| [ ] | [[Timeline]] | data-display |
| [ ] | [[CalendarView]] | data-display |
| [ ] | [[KanbanBoard]] | data-display |

### 💬 Feedback (7)

| סטטוס | רכיב | קטגוריה |
|--------|-------|---------|
| [ ] | [[Alert]] | feedback |
| [ ] | [[Toast]] | feedback |
| [ ] | [[Spinner]] | feedback |
| [ ] | [[Progress]] | feedback |
| [ ] | [[Skeleton]] | feedback |
| [ ] | [[EmptyState]] | feedback |
| [ ] | [[ErrorBoundary]] | feedback |

### 🧭 Navigation (9)

| סטטוס | רכיב | קטגוריה |
|--------|-------|---------|
| [ ] | [[Navbar]] | navigation |
| [ ] | [[Sidebar]] | navigation |
| [ ] | [[Breadcrumb]] | navigation |
| [ ] | [[Tabs]] | navigation |
| [ ] | [[Pagination]] | navigation |
| [ ] | [[Steps]] | navigation |
| [ ] | [[CommandPalette]] | navigation |
| [ ] | [[ContextMenu]] | navigation |
| [ ] | [[MobileNav]] | navigation |

### 🪟 Surfaces (7)

| סטטוס | רכיב | קטגוריה |
|--------|-------|---------|
| [ ] | [[Card]] | surfaces |
| [ ] | [[Modal]] | surfaces |
| [ ] | [[Drawer]] | surfaces |
| [ ] | [[Popover]] | surfaces |
| [ ] | [[Tooltip]] | surfaces |
| [ ] | [[Dropdown]] | surfaces |
| [ ] | [[Sheet]] | surfaces |

### 📐 Layout (10)

| סטטוס | רכיב | קטגוריה |
|--------|-------|---------|
| [ ] | [[Container]] | layout |
| [ ] | [[Grid]] | layout |
| [ ] | [[Flex]] | layout |
| [ ] | [[Stack]] | layout |
| [ ] | [[AspectRatio]] | layout |
| [ ] | [[Masonry]] | layout |
| [ ] | [[Scrollable]] | layout |
| [ ] | [[StickyHeader]] | layout |
| [ ] | [[SplitPane]] | layout |
| [ ] | [[PageWrapper]] | layout |

### 🎬 Motion (13)

| סטטוס | רכיב | קטגוריה |
|--------|-------|---------|
| [ ] | [[FadeIn]] | motion |
| [ ] | [[SlideIn]] | motion |
| [ ] | [[ScaleIn]] | motion |
| [ ] | [[StaggerList]] | motion |
| [ ] | [[AnimatedCounter]] | motion |
| [ ] | [[TypingText]] | motion |
| [ ] | [[Parallax]] | motion |
| [ ] | [[ScrollReveal]] | motion |
| [ ] | [[Magnetic]] | motion |
| [ ] | [[Ripple]] | motion |
| [ ] | [[PageTransition]] | motion |
| [ ] | [[GlowEffect]] | motion |
| [ ] | [[FloatingElement]] | motion |

### ⭐ Special — ישראלי ועסקי (17)

| סטטוס | רכיב | קטגוריה |
|--------|-------|---------|
| [ ] | [[HeroSection]] | special |
| [ ] | [[FeatureGrid]] | special |
| [ ] | [[PricingCard]] | special |
| [ ] | [[TestimonialCard]] | special |
| [ ] | [[TeamCard]] | special |
| [ ] | [[FAQAccordion]] | special |
| [ ] | [[ContactForm]] | special |
| [ ] | [[NewsletterSignup]] | special |
| [ ] | [[CookieBanner]] | special |
| [ ] | [[WhatsAppButton]] | special |
| [ ] | [[GoogleMapsEmbed]] | special |
| [ ] | [[BusinessHours]] | special |
| [ ] | [[ReviewStars]] | special |
| [ ] | [[ImageGallery]] | special |
| [ ] | [[VideoPlayer]] | special |
| [ ] | [[SocialLinks]] | special |
| [ ] | [[CTABanner]] | special |

### 🪝 Hooks (7)

| סטטוס | hook | קטגוריה |
|--------|------|---------|
| [ ] | [[useBreakpoint]] | hooks |
| [ ] | [[useTheme]] | hooks |
| [ ] | [[useClickOutside]] | hooks |
| [ ] | [[useScrollPosition]] | hooks |
| [ ] | [[useLocalStorage]] | hooks |
| [ ] | [[useDebounce]] | hooks |
| [ ] | [[useIntersectionObserver]] | hooks |

**סה"כ: 105 רכיבים ו-hooks**

---

## דפוס `component_library.py` | The Automation Pattern

מערכת website-monster בונה אתרים באמצעות סקריפט Python שמגדיר אילו רכיבים להשתמש בכל עמוד. הדפוס נראה כך:

```python
# component_library.py — חלק ממנוע website-monster

COMPONENT_REGISTRY = {
    "HeroSection": {
        "import": "from @tottemai/ui import HeroSection",
        "category": "special",
        "props_schema": {
            "title": "str",
            "subtitle": "str",
            "cta_text": "str",
            "cta_href": "str",
            "image_url": "str | None",
            "theme": "light | dark | gradient",
        },
        "description": "סקשן פתיחה ראשי לאתר עסקי — כולל כותרת, תת-כותרת, כפתור CTA ותמונה",
    },
    "WhatsAppButton": {
        "import": "from @tottemai/ui import WhatsAppButton",
        "category": "special",
        "props_schema": {
            "phone_number": "str",  # פורמט: 972501234567
            "message": "str | None",
            "position": "bottom-right | bottom-left",
            "pulse": "bool",
        },
        "description": "כפתור WhatsApp צף — חיוני לכל אתר עסקי ישראלי",
    },
    # ... כל 105 הרכיבים רשומים כאן
}

def get_components_for_page(page_type: str) -> list[str]:
    """
    מחזיר רשימת רכיבים מומלצים לפי סוג העמוד.
    page_type: "home" | "about" | "services" | "contact" | "gallery"
    """
    PAGE_TEMPLATES = {
        "home": ["HeroSection", "FeatureGrid", "TestimonialCard", "CTABanner", "WhatsAppButton"],
        "about": ["HeroSection", "TeamCard", "Timeline", "ReviewStars"],
        "services": ["HeroSection", "FeatureGrid", "PricingCard", "FAQAccordion", "ContactForm"],
        "contact": ["ContactForm", "GoogleMapsEmbed", "BusinessHours", "WhatsAppButton"],
        "gallery": ["ImageGallery", "VideoPlayer", "CTABanner"],
    }
    return PAGE_TEMPLATES.get(page_type, ["HeroSection", "CTABanner"])


def generate_component_import(component_name: str) -> str:
    """מייצר שורת import מוכנה לשימוש בקוד Next.js"""
    return f'import {{ {component_name} }} from "@tottemai/ui";'
```

### איך זה עובד בפועל

1. **ה-LLM** מקבל תיאור העסק (שם, תחום, קהל יעד).
2. **`component_library.py`** ממליץ על רכיבים רלוונטיים לפי סוג העמוד.
3. **ה-LLM** מייצר קוד Next.js שמשתמש ברכיבים מ-`@tottemai/ui` עם ה-props המתאימים.
4. **website-monster** מריץ `npm install && npm run build` ומייצר את האתר הסופי.

> כל שינוי בספרייה (`@tottemai/ui`) מתפשט אוטומטית לכל האתרים בעדכון ה-package הבא.

---

## קישורים | Links

- [[STORYBOOK]] — הגדרת Storybook ופיתוח רכיבים
- [[component-library/Button]] — דוגמה לרכיב מלא עם תיעוד
- [GitHub: LidorTottemai/tottemai-ui](https://github.com/LidorTottemai/tottemai-ui)
