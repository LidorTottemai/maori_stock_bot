# Progress

> **קטגוריה:** feedback
> **תלויות:** @radix-ui/react-progress, react, clsx
> **Storybook:** src/stories/Progress.stories.tsx
> **קוד:** src/feedback/Progress.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
קומפוננטת התקדמות עם שני וריאנטים: לינארי (בר) ומעגלי (טבעת SVG). תומכת במצב indeterminate עם אנימציית CSS, גדלים ושינוי צבעים דרך CSS variables בלבד. מתאימה לטעינת קבצים, עיבוד נתונים, ומדידת ביצועים.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Linear Default | בר לינארי עם ערך מוגדר (value=70) |
| Linear Indeterminate | בר לינארי עם אנימציה אינסופית (value=null) |
| Circular Default | טבעת SVG עם ערך מוגדר (value=65) |
| Circular Indeterminate | טבעת SVG עם סיבוב אינסופי (value=null) |
| Sizes | הצגת sm / md / lg בשני הווריאנטים |
| Colors | primary / success / warning / error |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'linear' \| 'circular'` | `'linear'` | סוג רכיב ההתקדמות |
| value | `number \| null` | — | ערך נוכחי; null = indeterminate |
| max | `number` | `100` | ערך מקסימלי |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | גודל הרכיב |
| color | `'primary' \| 'success' \| 'warning' \| 'error'` | `'primary'` | צבע המחוון |
| showLabel | `boolean` | `false` | הצגת אחוזים כטקסט |
| className | `string` | — | קלאסים נוספים |

## שימוש בסיסי
```tsx
import { Progress } from "@tottemai/ui"

// לינארי פשוט
<Progress value={70} showLabel />

// מעגלי indeterminate
<Progress variant="circular" value={null} size="lg" color="success" />
```

## קוד מלא
```tsx
// src/feedback/Progress.tsx
import * as RadixProgress from "@radix-ui/react-progress";
import clsx from "clsx";
import React from "react";

export interface ProgressProps {
  variant?: "linear" | "circular";
  value?: number | null;
  max?: number;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "success" | "warning" | "error";
  showLabel?: boolean;
  className?: string;
}

const linearHeightMap = {
  sm: "4px",
  md: "8px",
  lg: "12px",
};

const circularSizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
};

const strokeWidthMap = {
  sm: 3,
  md: 4,
  lg: 5,
};

const colorVarMap: Record<string, string> = {
  primary: "var(--color-primary)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  error: "var(--color-error)",
};

const styles = `
  @keyframes progress-indeterminate-linear {
    0% { transform: translateX(-100%); }
    50% { transform: translateX(0%); }
    100% { transform: translateX(100%); }
  }

  @keyframes progress-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes progress-dash {
    0% { stroke-dashoffset: 100; }
    50% { stroke-dashoffset: 25; stroke-dasharray: 75 25; }
    100% { stroke-dashoffset: 100; }
  }

  .progress-linear-root {
    position: relative;
    overflow: hidden;
    border-radius: var(--radius-full, 9999px);
    background-color: var(--color-surface-raised, #e5e7eb);
    width: 100%;
  }

  .progress-linear-indicator {
    height: 100%;
    border-radius: var(--radius-full, 9999px);
    transition: transform 0.4s ease;
    transform-origin: left center;
    will-change: transform;
  }

  [dir="rtl"] .progress-linear-indicator {
    transform-origin: right center;
  }

  .progress-linear-indicator--indeterminate {
    width: 50% !important;
    animation: progress-indeterminate-linear 1.4s ease-in-out infinite;
  }

  .progress-circular-svg--indeterminate {
    animation: progress-spin 1.4s linear infinite;
  }

  .progress-circular-track {
    stroke: var(--color-surface-raised, #e5e7eb);
    fill: none;
  }

  .progress-circular-indicator {
    fill: none;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.4s ease;
    transform-origin: center;
    transform: rotate(-90deg);
  }

  .progress-circular-indicator--indeterminate {
    animation: progress-dash 1.4s ease-in-out infinite;
    transform: rotate(-90deg);
  }
`;

function injectStyles() {
  if (typeof document === "undefined") return;
  const id = "__progress_styles__";
  if (document.getElementById(id)) return;
  const tag = document.createElement("style");
  tag.id = id;
  tag.textContent = styles;
  document.head.appendChild(tag);
}

export const Progress: React.FC<ProgressProps> = ({
  variant = "linear",
  value = null,
  max = 100,
  size = "md",
  color = "primary",
  showLabel = false,
  className,
}) => {
  injectStyles();

  const isIndeterminate = value === null;
  const percentage = isIndeterminate
    ? 0
    : Math.min(100, Math.max(0, (value / max) * 100));
  const fillColor = colorVarMap[color] ?? colorVarMap.primary;

  if (variant === "circular") {
    const svgSize = circularSizeMap[size];
    const strokeWidth = strokeWidthMap[size];
    const radius = (svgSize - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = isIndeterminate
      ? 0
      : circumference - (percentage / 100) * circumference;

    return (
      <span
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`התקדמות: ${isIndeterminate ? "בטעינה" : `${Math.round(percentage)}%`}`}
        className={clsx("progress-circular-wrapper", className)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--spacing-2, 8px)",
          position: "relative",
        }}
      >
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className={clsx(
            "progress-circular-svg",
            isIndeterminate && "progress-circular-svg--indeterminate"
          )}
          aria-hidden="true"
        >
          <circle
            className="progress-circular-track"
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <circle
            className={clsx(
              "progress-circular-indicator",
              isIndeterminate && "progress-circular-indicator--indeterminate"
            )}
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            strokeWidth={strokeWidth}
            stroke={fillColor}
            strokeDasharray={isIndeterminate ? `${circumference * 0.75} ${circumference * 0.25}` : `${circumference}`}
            strokeDashoffset={isIndeterminate ? 0 : offset}
          />
        </svg>
        {showLabel && !isIndeterminate && (
          <span
            style={{
              fontSize: size === "sm" ? "var(--font-size-xs, 12px)" : "var(--font-size-sm, 14px)",
              color: "var(--color-text-secondary)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {Math.round(percentage)}%
          </span>
        )}
      </span>
    );
  }

  // Linear variant
  return (
    <div
      className={clsx("progress-linear-wrapper", className)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-1, 4px)",
        width: "100%",
      }}
    >
      {showLabel && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            fontSize: "var(--font-size-sm, 14px)",
            color: "var(--color-text-secondary)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {isIndeterminate ? "טוען..." : `${Math.round(percentage)}%`}
        </div>
      )}
      <RadixProgress.Root
        className="progress-linear-root"
        style={{ height: linearHeightMap[size] }}
        value={isIndeterminate ? undefined : percentage}
        max={100}
        aria-label={`התקדמות: ${isIndeterminate ? "בטעינה" : `${Math.round(percentage)}%`}`}
      >
        <RadixProgress.Indicator
          className={clsx(
            "progress-linear-indicator",
            isIndeterminate && "progress-linear-indicator--indeterminate"
          )}
          style={{
            backgroundColor: fillColor,
            width: isIndeterminate ? "50%" : "100%",
            transform: isIndeterminate
              ? undefined
              : `translateX(-${100 - percentage}%)`,
          }}
        />
      </RadixProgress.Root>
    </div>
  );
};

Progress.displayName = "Progress";

export default Progress;
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
