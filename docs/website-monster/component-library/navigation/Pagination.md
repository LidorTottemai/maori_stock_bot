# Pagination

> **קטגוריה:** navigation
> **תלויות:** react, clsx
> **Storybook:** src/stories/Pagination.stories.tsx
> **קוד:** src/navigation/Pagination.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
קומפוננטת מספור עמודים מלאה עם אליפסיס חכם, כפתורי הקודם/הבא, בחירת כמות פריטים לעמוד, וכפתורי ראשון/אחרון אופציונליים. כיוון חצי הקודם/הבא מתהפך אוטומטית ב-RTL.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | עמוד 5 מתוך 10, ניווט בסיסי |
| With Ellipsis | עמוד 7 מתוך 20 — אליפסיס בשני הצדדים |
| Items Per Page | תפריט בחירת כמות פריטים |
| Compact | ללא מספרים, הקודם/הבא בלבד |
| First/Last Buttons | כפתורי קפיצה לעמוד ראשון ואחרון |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| currentPage | `number` | — | **חובה.** העמוד הנוכחי (1-based) |
| totalPages | `number` | — | **חובה.** סך הכל עמודים |
| onPageChange | `(page: number) => void` | — | **חובה.** קולבק לשינוי עמוד |
| itemsPerPage | `number` | `10` | פריטים לעמוד הנוכחי |
| onItemsPerPageChange | `(n: number) => void` | — | קולבק לשינוי כמות פריטים |
| itemsPerPageOptions | `number[]` | `[10, 25, 50, 100]` | אפשרויות לבחירה |
| showFirstLast | `boolean` | `false` | הצגת כפתורי ראשון/אחרון |
| showItemsPerPage | `boolean` | `false` | הצגת בורר כמות פריטים |
| siblingCount | `number` | `1` | כמה מספרים בכל צד סביב העמוד הנוכחי |
| className | `string` | — | קלאסים נוספים |

## שימוש בסיסי
```tsx
import { Pagination } from "@tottemai/ui"

const [page, setPage] = React.useState(1)
const [perPage, setPerPage] = React.useState(10)

<Pagination
  currentPage={page}
  totalPages={50}
  onPageChange={setPage}
  showItemsPerPage
  itemsPerPage={perPage}
  onItemsPerPageChange={setPerPage}
  showFirstLast
  siblingCount={1}
/>
```

## קוד מלא
```tsx
// src/navigation/Pagination.tsx
import clsx from "clsx";
import React from "react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (n: number) => void;
  itemsPerPageOptions?: number[];
  showFirstLast?: boolean;
  showItemsPerPage?: boolean;
  siblingCount?: number;
  className?: string;
}

const styles = `
  .pagination-root {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--spacing-2, 8px);
    font-size: var(--font-size-sm, 14px);
  }

  .pagination-pages {
    display: flex;
    align-items: center;
    gap: var(--spacing-1, 4px);
  }

  .pagination-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2rem;
    height: 2rem;
    padding: 0 var(--spacing-2, 8px);
    border-radius: var(--radius-sm, 4px);
    border: 1px solid var(--color-border, #e5e7eb);
    background: var(--color-surface, #ffffff);
    color: var(--color-text-secondary, #6b7280);
    font-size: var(--font-size-sm, 14px);
    font-weight: var(--font-weight-medium, 500);
    cursor: pointer;
    transition:
      background-color var(--duration-fast, 150ms) ease,
      color var(--duration-fast, 150ms) ease,
      border-color var(--duration-fast, 150ms) ease;
    outline: none;
    line-height: 1;
    user-select: none;
  }

  .pagination-btn:hover:not(:disabled) {
    background-color: var(--color-surface-raised, #f9fafb);
    color: var(--color-text-primary, #111827);
    border-color: var(--color-border-strong, #d1d5db);
  }

  .pagination-btn:focus-visible {
    outline: 2px solid var(--color-focus-ring, var(--color-primary));
    outline-offset: 2px;
  }

  .pagination-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .pagination-btn--active {
    background-color: var(--color-primary);
    color: var(--color-on-primary, #ffffff);
    border-color: var(--color-primary);
    font-weight: var(--font-weight-semibold, 600);
  }

  .pagination-btn--active:hover:not(:disabled) {
    background-color: var(--color-primary-hover, var(--color-primary));
    color: var(--color-on-primary, #ffffff);
  }

  .pagination-btn--nav {
    padding: 0 var(--spacing-2, 8px);
    gap: var(--spacing-1, 4px);
  }

  .pagination-ellipsis {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2rem;
    height: 2rem;
    color: var(--color-text-muted, #9ca3af);
    letter-spacing: 0.1em;
    cursor: default;
    user-select: none;
  }

  .pagination-per-page {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-2, 8px);
    color: var(--color-text-secondary, #6b7280);
    margin-inline-start: var(--spacing-2, 8px);
  }

  .pagination-select {
    height: 2rem;
    padding: 0 var(--spacing-2, 8px);
    border-radius: var(--radius-sm, 4px);
    border: 1px solid var(--color-border, #e5e7eb);
    background: var(--color-surface, #ffffff);
    color: var(--color-text-primary, #111827);
    font-size: var(--font-size-sm, 14px);
    cursor: pointer;
    outline: none;
  }

  .pagination-select:focus-visible {
    outline: 2px solid var(--color-focus-ring, var(--color-primary));
    outline-offset: 2px;
  }

  /* RTL: flip prev/next arrow character via CSS logical props */
  [dir="rtl"] .pagination-arrow--prev {
    transform: scaleX(-1);
  }

  [dir="rtl"] .pagination-arrow--next {
    transform: scaleX(-1);
  }
`;

function injectStyles() {
  if (typeof document === "undefined") return;
  const id = "__pagination_styles__";
  if (document.getElementById(id)) return;
  const tag = document.createElement("style");
  tag.id = id;
  tag.textContent = styles;
  document.head.appendChild(tag);
}

const ELLIPSIS = "ELLIPSIS" as const;
type PageItem = number | typeof ELLIPSIS;

function buildPageRange(
  current: number,
  total: number,
  siblingCount: number
): PageItem[] {
  // Total slots: first + last + current + siblings*2 + 2 ellipsis = 5 + sibling*2
  const totalSlots = 5 + siblingCount * 2;

  if (total <= totalSlots) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const siblingStart = Math.max(current - siblingCount, 2);
  const siblingEnd = Math.min(current + siblingCount, total - 1);

  const showLeftEllipsis = siblingStart > 2;
  const showRightEllipsis = siblingEnd < total - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftCount = 1 + siblingCount * 2 + 3;
    return [
      ...Array.from({ length: leftCount }, (_, i) => i + 1),
      ELLIPSIS,
      total,
    ];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightCount = 1 + siblingCount * 2 + 3;
    return [
      1,
      ELLIPSIS,
      ...Array.from({ length: rightCount }, (_, i) => total - rightCount + i + 1),
    ];
  }

  return [
    1,
    ELLIPSIS,
    ...Array.from(
      { length: siblingEnd - siblingStart + 1 },
      (_, i) => siblingStart + i
    ),
    ELLIPSIS,
    total,
  ];
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 10,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 25, 50, 100],
  showFirstLast = false,
  showItemsPerPage = false,
  siblingCount = 1,
  className,
}) => {
  injectStyles();

  const pages = buildPageRange(currentPage, totalPages, siblingCount);
  const isRtl =
    typeof document !== "undefined" &&
    document.documentElement.dir === "rtl";

  const prevArrow = isRtl ? "›" : "‹";
  const nextArrow = isRtl ? "‹" : "›";
  const firstArrow = isRtl ? "»" : "«";
  const lastArrow = isRtl ? "«" : "»";

  const goTo = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  return (
    <nav
      aria-label="pagination"
      className={clsx("pagination-root", className)}
      dir="auto"
    >
      <div className="pagination-pages" role="list">
        {showFirstLast && (
          <button
            type="button"
            className="pagination-btn pagination-btn--nav"
            onClick={() => goTo(1)}
            disabled={currentPage === 1}
            aria-label="עמוד ראשון"
            role="listitem"
          >
            <span aria-hidden="true">{firstArrow}</span>
          </button>
        )}

        <button
          type="button"
          className="pagination-btn pagination-btn--nav"
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="עמוד קודם"
          role="listitem"
        >
          <span className="pagination-arrow--prev" aria-hidden="true">
            {prevArrow}
          </span>
          <span>הקודם</span>
        </button>

        {pages.map((item, index) => {
          if (item === ELLIPSIS) {
            return (
              <span
                key={`ellipsis-${index}`}
                className="pagination-ellipsis"
                aria-hidden="true"
                role="listitem"
              >
                •••
              </span>
            );
          }

          const page = item as number;
          const isActive = page === currentPage;

          return (
            <button
              key={page}
              type="button"
              className={clsx(
                "pagination-btn",
                isActive && "pagination-btn--active"
              )}
              onClick={() => goTo(page)}
              aria-label={`עמוד ${page}`}
              aria-current={isActive ? "page" : undefined}
              role="listitem"
            >
              {page}
            </button>
          );
        })}

        <button
          type="button"
          className="pagination-btn pagination-btn--nav"
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="עמוד הבא"
          role="listitem"
        >
          <span>הבא</span>
          <span className="pagination-arrow--next" aria-hidden="true">
            {nextArrow}
          </span>
        </button>

        {showFirstLast && (
          <button
            type="button"
            className="pagination-btn pagination-btn--nav"
            onClick={() => goTo(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="עמוד אחרון"
            role="listitem"
          >
            <span aria-hidden="true">{lastArrow}</span>
          </button>
        )}
      </div>

      {showItemsPerPage && onItemsPerPageChange && (
        <div className="pagination-per-page">
          <label htmlFor="pagination-per-page-select">שורות לעמוד:</label>
          <select
            id="pagination-per-page-select"
            className="pagination-select"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            aria-label="כמות פריטים לעמוד"
          >
            {itemsPerPageOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}
    </nav>
  );
};

Pagination.displayName = "Pagination";

export default Pagination;
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
