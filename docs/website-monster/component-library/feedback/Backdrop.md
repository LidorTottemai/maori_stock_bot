# Backdrop

> **קטגוריה:** feedback
> **תלויות:** react, clsx
> **Storybook:** src/stories/Backdrop.stories.tsx
> **קוד:** src/feedback/Backdrop.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
שכבת-על שקופה למחצה המוצגת מעל כל התוכן. מתאימה לשימוש עם Drawer, Modal ו-Dialog. תומכת בסגירה בלחיצה, טשטוש רקע, ושקיפות מותאמת אישית. מרונדרת דרך React Portal ישירות ל-document.body.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | שכבת-על כהה בשקיפות ברירת מחדל (0.5) |
| With Blur | עם backdrop-filter: blur לאפקט זכוכית |
| Dark | שקיפות גבוהה (opacity=0.8) |
| Click to Close | לחיצה על הרקע סוגרת את הרכיב |
| Always Visible (for docs) | מצב סטטי לתצוגה בתוך Storybook |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| open | `boolean` | — | **חובה.** האם שכבת-העל גלויה |
| onClose | `() => void` | — | קולבק לסגירה בלחיצה על הרקע |
| blur | `boolean` | `false` | הפעלת טשטוש (backdrop-filter: blur) |
| opacity | `number` | `0.5` | שקיפות הרקע (0–1) |
| zIndex | `number` | `1000` | z-index של שכבת-העל |
| className | `string` | — | קלאסים נוספים |
| children | `ReactNode` | — | תוכן מעל שכבת-העל |

## שימוש בסיסי
```tsx
import { Backdrop } from "@tottemai/ui"

const [open, setOpen] = React.useState(false)

<button onClick={() => setOpen(true)}>פתח</button>

<Backdrop open={open} onClose={() => setOpen(false)} blur>
  <div style={{ background: "var(--color-surface)", padding: 24 }}>
    תוכן מודל
  </div>
</Backdrop>
```

## קוד מלא
```tsx
// src/feedback/Backdrop.tsx
import clsx from "clsx";
import React, { useEffect, useCallback } from "react";
import ReactDOM from "react-dom";

export interface BackdropProps {
  open: boolean;
  onClose?: () => void;
  blur?: boolean;
  opacity?: number;
  zIndex?: number;
  className?: string;
  children?: React.ReactNode;
}

const styles = `
  @keyframes backdrop-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes backdrop-fade-out {
    from { opacity: 1; }
    to   { opacity: 0; }
  }

  .backdrop-root {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-backdrop, rgba(0, 0, 0, 0.5));
    transition: opacity var(--duration-normal, 200ms) var(--ease-standard, ease);
  }

  .backdrop-root--entering {
    animation: backdrop-fade-in var(--duration-normal, 200ms) var(--ease-standard, ease) forwards;
  }

  .backdrop-root--exiting {
    animation: backdrop-fade-out var(--duration-normal, 200ms) var(--ease-standard, ease) forwards;
    pointer-events: none;
  }

  .backdrop-root--blur {
    backdrop-filter: blur(var(--backdrop-blur, 4px));
    -webkit-backdrop-filter: blur(var(--backdrop-blur, 4px));
  }

  .backdrop-content {
    position: relative;
    z-index: 1;
  }
`;

function injectStyles() {
  if (typeof document === "undefined") return;
  const id = "__backdrop_styles__";
  if (document.getElementById(id)) return;
  const tag = document.createElement("style");
  tag.id = id;
  tag.textContent = styles;
  document.head.appendChild(tag);
}

export const Backdrop: React.FC<BackdropProps> = ({
  open,
  onClose,
  blur = false,
  opacity = 0.5,
  zIndex = 1000,
  className,
  children,
}) => {
  injectStyles();

  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [animating, setAnimating] = React.useState<"enter" | "exit" | null>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Allow DOM to paint before triggering animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
          setAnimating("enter");
        });
      });
    } else {
      setAnimating("exit");
      setVisible(false);
      const timer = setTimeout(() => {
        setMounted(false);
        setAnimating(null);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Lock scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && open && onClose) {
        onClose();
      }
    },
    [open, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && onClose) {
        onClose();
      }
    },
    [onClose]
  );

  if (!mounted) return null;

  const backdropColor = `rgba(var(--color-backdrop-rgb, 0 0 0) / ${opacity})`;

  const node = (
    <div
      role="presentation"
      aria-hidden={!visible}
      className={clsx(
        "backdrop-root",
        blur && "backdrop-root--blur",
        animating === "enter" && "backdrop-root--entering",
        animating === "exit" && "backdrop-root--exiting",
        className
      )}
      style={{
        zIndex,
        backgroundColor: backdropColor,
        pointerEvents: visible ? "auto" : "none",
      }}
      onClick={handleBackdropClick}
    >
      {children && (
        <div className="backdrop-content" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      )}
    </div>
  );

  return ReactDOM.createPortal(node, document.body);
};

Backdrop.displayName = "Backdrop";

export default Backdrop;
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
