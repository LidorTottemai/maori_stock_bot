# Storybook — @tottemai/ui

> תיעוד ויזואלי אינטראקטיבי לכל רכיבי הספרייה

---

## מה זה Storybook?

Storybook הוא כלי פיתוח שמאפשר לפתח, לתעד ולבדוק רכיבי UI **בבידוד** — מחוץ לאפליקציה. כל "story" מייצגת מצב אחד של רכיב (variant/state), ומאפשרת לראות אותו בצורה ויזואלית עם props שונים.

**יתרונות:**
- פיתוח רכיבים ללא צורך באפליקציה שלמה
- תיעוד חי שנשאר מסונכרן עם הקוד
- בדיקות נגישות (a11y) אוטומטיות
- תמיכה ב-dark mode
- ניתן לפרוס ב-GitHub Pages כ-design system reference

---

## התקנה | Setup

### 1. אתחול Storybook בתוך ריפוזיטורי `tottemai-ui`

```bash
# בתוך ריפוזיטורי tottemai-ui
npx storybook@latest init --type nextjs
```

### 2. התקנת תוספים | Install Addons

```bash
npm install --save-dev \
  @storybook/nextjs \
  @storybook/addon-a11y \
  storybook-dark-mode \
  @storybook/addon-docs \
  @storybook/addon-controls \
  @storybook/addon-viewport
```

### 3. מבנה קבצי Storybook

```
tottemai-ui/
├── .storybook/
│   ├── main.ts          ← קונפיגורציה ראשית
│   └── preview.tsx      ← decorators, globals, CSS variables
├── src/
│   └── stories/
│       ├── Button.stories.tsx
│       ├── Badge.stories.tsx
│       ├── Input.stories.tsx
│       └── ... (קובץ story לכל רכיב)
```

---

## קונפיגורציה | Configuration

### `.storybook/main.ts`

```ts
// .storybook/main.ts
import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  // היכן לחפש קבצי stories
  stories: [
    "../src/stories/**/*.stories.@(ts|tsx)",
    "../src/stories/**/*.mdx",
  ],

  // תוספים פעילים
  addons: [
    "@storybook/addon-essentials",   // controls, actions, docs, viewport, backgrounds
    "@storybook/addon-a11y",          // בדיקות נגישות אוטומטיות
    "storybook-dark-mode",            // תמיכה ב-dark mode
    "@storybook/addon-interactions",  // בדיקות אינטראקציה
  ],

  // שימוש ב-Next.js framework
  framework: {
    name: "@storybook/nextjs",
    options: {
      nextConfigPath: "../next.config.ts",
    },
  },

  // TypeScript עם SWC (מהיר יותר מ-Babel)
  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },

  // ייצוא סטטי לפריסה ב-GitHub Pages
  staticDirs: ["../public"],

  docs: {
    autodocs: "tag", // אוטומטית יוצר דף docs לכל component
  },
};

export default config;
```

### `.storybook/preview.tsx`

```tsx
// .storybook/preview.tsx
import React from "react";
import type { Preview } from "@storybook/react";
import { themes } from "@storybook/theming";

// ייבוא CSS globals — מגדיר את כל משתני העיצוב
import "../src/stories/preview.css";

const preview: Preview = {
  // פרמטרים גלובליים
  parameters: {
    // פאנל Actions — לוג על events
    actions: { argTypesRegex: "^on[A-Z].*" },

    // Controls — כפתורים לשינוי props בזמן אמת
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    // Dark mode integration
    darkMode: {
      dark: { ...themes.dark, appBg: "#0f172a" },
      light: { ...themes.normal, appBg: "#f8fafc" },
      darkClass: "dark",
      lightClass: "light",
      classTarget: "html",
      stylePreview: true,
    },

    // Backgrounds
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "surface", value: "#f8fafc" },
        { name: "dark", value: "#0f172a" },
      ],
    },

    // Viewport — גדלי מסך
    viewport: {
      viewports: {
        mobile: { name: "Mobile", styles: { width: "375px", height: "812px" } },
        tablet: { name: "Tablet", styles: { width: "768px", height: "1024px" } },
        desktop: { name: "Desktop", styles: { width: "1440px", height: "900px" } },
      },
    },

    // Accessibility
    a11y: {
      config: {
        rules: [
          { id: "color-contrast", enabled: true },
          { id: "label", enabled: true },
        ],
      },
    },
  },

  // Decorators — עוטפים כל story
  decorators: [
    (Story, context) => {
      // מגיב לשינוי dark mode
      const isDark = context.globals.backgrounds?.value === "#0f172a"
        || context.parameters?.darkMode?.current === "dark";

      React.useEffect(() => {
        document.documentElement.setAttribute(
          "data-theme",
          isDark ? "dark" : "light"
        );
        document.documentElement.dir = "rtl"; // ברירת מחדל: RTL לעברית
      }, [isDark]);

      return (
        <div
          style={{
            padding: "1.5rem",
            fontFamily: "var(--font-sans, system-ui, sans-serif)",
            direction: "rtl",
          }}
        >
          <Story />
        </div>
      );
    },
  ],

  // globals לניהול RTL/LTR בממשק
  globalTypes: {
    direction: {
      name: "Direction",
      description: "Text direction",
      defaultValue: "rtl",
      toolbar: {
        icon: "paragraph",
        items: [
          { value: "rtl", title: "RTL (עברית)" },
          { value: "ltr", title: "LTR (English)" },
        ],
      },
    },
  },
};

export default preview;
```

### `src/stories/preview.css`

קובץ זה מגדיר את משתני ה-CSS לשתי התמות — משמש **רק בתוך Storybook**:

```css
/* src/stories/preview.css */

/* ייבוא פונט */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

/* ===== תמה בהירה ===== */
:root,
[data-theme="light"] {
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-secondary: #7c3aed;
  --color-accent: #f59e0b;

  --color-bg: #ffffff;
  --color-surface: #f8fafc;
  --color-surface-2: #f1f5f9;

  --color-border: #e2e8f0;

  --color-text: #0f172a;
  --color-text-muted: #475569;
  --color-text-subtle: #94a3b8;

  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;

  --font-sans: "Inter", system-ui, -apple-system, sans-serif;
}

/* ===== תמה כהה ===== */
[data-theme="dark"] {
  --color-primary: #3b82f6;
  --color-primary-hover: #60a5fa;
  --color-secondary: #a78bfa;
  --color-accent: #fbbf24;

  --color-bg: #0f172a;
  --color-surface: #1e293b;
  --color-surface-2: #334155;

  --color-border: #334155;

  --color-text: #f8fafc;
  --color-text-muted: #94a3b8;
  --color-text-subtle: #475569;

  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;

  --font-sans: "Inter", system-ui, -apple-system, sans-serif;
}

/* ===== Reset בסיסי ===== */
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--font-sans);
  background-color: var(--color-bg);
  color: var(--color-text);
  -webkit-font-smoothing: antialiased;
}
```

---

## תבנית Story | Story Template

### `src/stories/Button.stories.tsx`

קובץ זה מדגים **את כל הוריאנטים והמצבים** של רכיב ה-Button:

```tsx
// src/stories/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Loader2, Trash2, Plus, ArrowLeft } from "lucide-react";

import { Button } from "../primitives/Button";

// ===== Meta — הגדרת הרכיב =====
const meta = {
  // נתיב בסרגל הצד של Storybook
  title: "Primitives/Button",
  component: Button,
  
  // תיוג לייצור דף autodocs
  tags: ["autodocs"],

  // גדלי תצוגה מומלצים
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
## כפתור | Button

רכיב כפתור בסיסי עם תמיכה במספר וריאנטים, גדלים ומצבים.

**ייבוא:**
\`\`\`tsx
import { Button } from "@tottemai/ui";
\`\`\`

**שימוש בסיסי:**
\`\`\`tsx
<Button variant="primary" size="md" onClick={handleClick}>
  לחץ כאן
</Button>
\`\`\`
        `,
      },
    },
  },

  // ערכי ברירת מחדל לכל args
  args: {
    onClick: fn(), // מאזין לאירועי לחיצה ב-Actions panel
    children: "כפתור",
    disabled: false,
    loading: false,
  },

  // הגדרת controls לכל prop
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "destructive", "link", "outline"],
      description: "סגנון הכפתור",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "primary" },
      },
    },
    size: {
      control: "radio",
      options: ["xs", "sm", "md", "lg", "xl"],
      description: "גודל הכפתור",
      table: {
        defaultValue: { summary: "md" },
      },
    },
    disabled: {
      control: "boolean",
      description: "האם הכפתור מושבת",
    },
    loading: {
      control: "boolean",
      description: "מצב טעינה — מציג spinner ומשבית לחיצה",
    },
    fullWidth: {
      control: "boolean",
      description: "האם הכפתור תופס רוחב מלא",
    },
    children: {
      control: "text",
      description: "תוכן הכפתור",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// ===== Stories =====

/** כפתור ראשי — ברירת המחדל של הספרייה */
export const Primary: Story = {
  args: {
    variant: "primary",
    children: "שמור שינויים",
  },
};

/** כפתור משני — לפעולות משניות */
export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "ביטול",
  },
};

/** כפתור שקוף — לפעולות שקטות */
export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "הגדרות",
  },
};

/** כפתור הרסני — למחיקה/ביטול חשוב */
export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "מחק חשבון",
    icon: <Trash2 size={16} />,
  },
  parameters: {
    docs: {
      description: {
        story: "השתמש בוריאנט `destructive` לפעולות שאינן הפיכות.",
      },
    },
  },
};

/** כפתור קו מתאר */
export const Outline: Story = {
  args: {
    variant: "outline",
    children: "ייצא PDF",
  },
};

/** כפתור קישור */
export const Link: Story = {
  args: {
    variant: "link",
    children: "קרא עוד →",
  },
};

/** מצב טעינה — מציג spinner ומונע לחיצה כפולה */
export const Loading: Story = {
  args: {
    variant: "primary",
    loading: true,
    children: "שומר...",
  },
  parameters: {
    docs: {
      description: {
        story: "בעת `loading={true}` הכפתור מציג Spinner ומושבת אוטומטית.",
      },
    },
  },
};

/** מצב מושבת */
export const Disabled: Story = {
  args: {
    variant: "primary",
    disabled: true,
    children: "לא זמין",
  },
};

/** כפתור עם אייקון משמאל */
export const WithIconLeft: Story = {
  args: {
    variant: "primary",
    children: "הוסף פריט",
    iconLeft: <Plus size={16} />,
  },
};

/** כפתור עם אייקון מימין (RTL) */
export const WithIconRight: Story = {
  args: {
    variant: "ghost",
    children: "חזור",
    iconRight: <ArrowLeft size={16} />,
  },
};

/** כפתור ברוחב מלא */
export const FullWidth: Story = {
  args: {
    variant: "primary",
    children: "התחבר",
    fullWidth: true,
  },
  parameters: {
    layout: "padded",
  },
};

/** כל הגדלים — השוואה */
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
      <Button variant="primary" size="xs">קטן מאוד</Button>
      <Button variant="primary" size="sm">קטן</Button>
      <Button variant="primary" size="md">בינוני</Button>
      <Button variant="primary" size="lg">גדול</Button>
      <Button variant="primary" size="xl">גדול מאוד</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "כל חמשת הגדלים הזמינים: `xs`, `sm`, `md`, `lg`, `xl`.",
      },
    },
  },
};

/** כל הוריאנטים — השוואה */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "כל ששת הוריאנטים של הכפתור בתצוגה אחת.",
      },
    },
  },
};
```

---

## דפוס קובץ Story | Story File Convention

כל קובץ story חייב לעקוב אחר הדפוס הבא:

```tsx
// src/stories/ComponentName.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { ComponentName } from "../category/ComponentName";

const meta = {
  title: "Category/ComponentName",  // נתיב בסרגל הצד
  component: ComponentName,
  tags: ["autodocs"],               // חובה — מפעיל autodocs
  parameters: {
    layout: "centered",             // centered | padded | fullscreen
    docs: {
      description: {
        component: "תיאור קצר בעברית + דוגמת ייבוא ושימוש",
      },
    },
  },
  args: {},
  argTypes: {},
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

// חובה: story אחת לפחות לכל variant/state עיקרי
export const Default: Story = { args: {} };
export const Variant2: Story = { args: {} };
// ...
```

### כלל: קובץ Story לכל רכיב

```
src/stories/
├── primitives/
│   ├── Button.stories.tsx       ✅ חובה
│   ├── Badge.stories.tsx        ✅ חובה
│   ├── Avatar.stories.tsx       ✅ חובה
│   ├── Divider.stories.tsx      ✅ חובה
│   ├── Icon.stories.tsx         ✅ חובה
│   └── Spinner.stories.tsx      ✅ חובה
├── forms/
│   ├── Input.stories.tsx
│   ├── Textarea.stories.tsx
│   ├── Select.stories.tsx
│   └── ... (17 קבצים)
├── data-display/
│   └── ... (9 קבצים)
├── feedback/
│   └── ... (7 קבצים)
├── navigation/
│   └── ... (9 קבצים)
├── surfaces/
│   └── ... (7 קבצים)
├── layout/
│   └── ... (10 קבצים)
├── motion/
│   └── ... (13 קבצים)
└── special/
    └── ... (17 קבצים)
```

> **חוק ברזל:** PR לא יאושר אם הוסף רכיב ללא קובץ `.stories.tsx` מקביל.

---

## הפעלה | Running Storybook

### פיתוח מקומי

```bash
# הפעלה במצב פיתוח (hot reload)
npm run storybook
```

Storybook יפתח אוטומטית ב-`http://localhost:6006`

### הוספה ל-`package.json`

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build -o storybook-static"
  }
}
```

---

## פריסה ל-GitHub Pages | Deploy to GitHub Pages

### שיטה 1: GitHub Actions (מומלץ)

צור קובץ `.github/workflows/storybook.yml`:

```yaml
# .github/workflows/storybook.yml
name: Deploy Storybook to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build Storybook
        run: npm run build-storybook

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: storybook-static

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### שיטה 2: ידני

```bash
# בנייה
npm run build-storybook

# פריסה ידנית עם gh-pages
npx gh-pages -d storybook-static
```

### הגדרת GitHub Pages

1. פתח: `Settings → Pages`
2. Source: `GitHub Actions`
3. Storybook יהיה זמין ב: `https://LidorTottemai.github.io/tottemai-ui/`

---

## בדיקות נגישות | Accessibility Testing

תוסף `@storybook/addon-a11y` מריץ בדיקות axe-core אוטומטית על כל story.

### הפעלה

1. פתח story כלשהי
2. לחץ על טאב **Accessibility** בפאנל התחתון
3. תראה רשימת violations, passes ו-incomplete

### הגדרה ברמת story בודדת

```tsx
export const Primary: Story = {
  args: { children: "לחץ" },
  parameters: {
    a11y: {
      config: {
        rules: [
          // כיבוי rule ספציפי אם יש false positive
          { id: "color-contrast", enabled: false },
        ],
      },
    },
  },
};
```

### כללי נגישות שחייבים לעבור

- ✅ כל אלמנט אינטראקטיבי חייב `aria-label` או תוכן טקסטואלי
- ✅ יחס ניגוד צבע מינימום 4.5:1 (WCAG AA)
- ✅ כל שדה טופס חייב `<label>` מקושר
- ✅ focus ring גלוי בכל הרכיבים
- ✅ ניווט מקלדת מלא (Tab, Enter, Escape, Arrow keys)

---

## Dark Mode בפיתוח

### הפעלת dark mode ב-Storybook

1. לחץ על אייקון הירח בסרגל הכלים העליון
2. Storybook יוסיף `data-theme="dark"` ל-`<html>`
3. כל הרכיבים עוברים לתמה הכהה דרך CSS variables

### בדיקת שני המצבים

Storybook-dark-mode מאפשר לצפות בשני המצבים **בו זמנית**:

```tsx
// story שמציגה שני themes בצד לצד
export const LightAndDark: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "2rem" }}>
      <div data-theme="light" style={{ padding: "1rem", background: "var(--color-bg)" }}>
        <Button {...args} />
      </div>
      <div data-theme="dark" style={{ padding: "1rem", background: "#0f172a" }}>
        <Button {...args} />
      </div>
    </div>
  ),
  args: { variant: "primary", children: "כפתור" },
};
```

---

## MDX Documentation Pages

ניתן לכתוב דפי תיעוד בפורמט MDX:

```mdx
{/* src/stories/Introduction.mdx */}
import { Meta } from "@storybook/blocks";

<Meta title="Introduction" />

# @tottemai/ui — ספריית הרכיבים

ברוכים הבאים לתיעוד הויזואלי של `@tottemai/ui`.

## שימוש מהיר

\`\`\`tsx
import { Button, Card, Input } from "@tottemai/ui";

export default function Page() {
  return (
    <Card>
      <Input placeholder="הכנס שם עסק..." />
      <Button variant="primary">שמור</Button>
    </Card>
  );
}
\`\`\`
```

---

## טיפים ל-AI Code Generation

כשה-AI של Website Monster כותב stories חדשות, יש לעקוב אחר הכללים:

1. **תמיד** לייבא `Meta` ו-`StoryObj` מ-`@storybook/react`
2. **תמיד** להוסיף `tags: ["autodocs"]`
3. **תמיד** לכתוב לפחות story אחת לכל variant עיקרי
4. **תמיד** לכלול `description.component` בעברית
5. **אף פעם** לא לכתוב inline styles — להשתמש ב-CSS variables
6. **תמיד** לכלול story שמציגה את כל הוריאנטים יחד (`AllVariants`)
7. **תמיד** לכלול story שמציגה מצב loading/disabled אם רלוונטי

---

*עודכן לאחרונה: 2026-06-12 | Website Monster System*
