# Table

> **קטגוריה:** data-display
> **תלויות:** react, clsx
> **Storybook:** src/stories/Table.stories.tsx
> **קוד:** src/data-display/Table.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
טבלה HTML בסיסית עם header דביק, שורות זברה וממיין עמודות. תומכת בגנריקס של TypeScript לסוגי נתונים, מאפשרת מיון לפי עמודה בלחיצה, ומספקת חווית גלילה נוחה עם כותרת קבועה.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | טבלה בסיסית ללא אפשרויות מיוחדות |
| Sticky Header | כותרת נשארת קבועה בעת גלילה |
| Zebra Rows | שורות בצבעים מתחלפים לקריאות משופרת |
| Sortable | לחיצה על כותרת עמודה ממיינת את הנתונים |
| Empty State | תצוגה כשאין נתונים להצגה |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `T[]` | required | מערך הנתונים להצגה |
| columns | `ColumnDef<T>[]` | required | הגדרת העמודות |
| stickyHeader | `boolean` | `false` | האם לקבע את הכותרת בגלילה |
| zebra | `boolean` | `false` | האם להציג שורות זברה |
| sortable | `boolean` | `false` | האם לאפשר מיון לפי עמודה |
| className | `string` | — | קלאס CSS נוסף לעטיפה |

## שימוש בסיסי
```tsx
import { Table } from "@tottemai/ui"

const columns = [
  { key: "name", header: "שם" },
  { key: "age",  header: "גיל" },
]

const data = [
  { name: "Alice", age: 30 },
  { name: "Bob",   age: 25 },
]

export default function Demo() {
  return (
    <Table
      data={data}
      columns={columns}
      stickyHeader
      zebra
      sortable
    />
  )
}
```

## קוד מלא
```tsx
// src/data-display/Table.tsx
import React, { useState, useCallback } from "react"
import clsx from "clsx"

export interface ColumnDef<T> {
  key: keyof T & string
  header: string
  render?: (value: T[keyof T], row: T) => React.ReactNode
  sortable?: boolean
  align?: "start" | "center" | "end"
  width?: string
}

export interface TableProps<T extends Record<string, unknown>> {
  data: T[]
  columns: ColumnDef<T>[]
  stickyHeader?: boolean
  zebra?: boolean
  sortable?: boolean
  className?: string
}

type SortDirection = "asc" | "desc" | null

interface SortState {
  key: string | null
  direction: SortDirection
}

const SortIcon = ({ direction }: { direction: SortDirection }) => (
  <span
    aria-hidden="true"
    style={{
      display: "inline-flex",
      flexDirection: "column",
      gap: "1px",
      marginInlineStart: "var(--spacing-1, 4px)",
      verticalAlign: "middle",
      opacity: direction ? 1 : 0.35,
    }}
  >
    <span
      style={{
        width: 0,
        height: 0,
        borderLeft: "4px solid transparent",
        borderRight: "4px solid transparent",
        borderBottom: `4px solid ${direction === "asc" ? "var(--color-primary, currentColor)" : "currentColor"}`,
      }}
    />
    <span
      style={{
        width: 0,
        height: 0,
        borderLeft: "4px solid transparent",
        borderRight: "4px solid transparent",
        borderTop: `4px solid ${direction === "desc" ? "var(--color-primary, currentColor)" : "currentColor"}`,
      }}
    />
  </span>
)

function sortData<T extends Record<string, unknown>>(
  data: T[],
  key: string | null,
  direction: SortDirection,
): T[] {
  if (!key || !direction) return data
  return [...data].sort((a, b) => {
    const av = a[key]
    const bv = b[key]
    if (av === bv) return 0
    const less = av === null || av === undefined || av < (bv as typeof av)
    return direction === "asc" ? (less ? -1 : 1) : less ? 1 : -1
  })
}

export function Table<T extends Record<string, unknown>>({
  data,
  columns,
  stickyHeader = false,
  zebra = false,
  sortable: globalSortable = false,
  className,
}: TableProps<T>) {
  const [sort, setSort] = useState<SortState>({ key: null, direction: null })

  const handleSort = useCallback(
    (key: string) => {
      setSort((prev) => {
        if (prev.key !== key) return { key, direction: "asc" }
        if (prev.direction === "asc") return { key, direction: "desc" }
        return { key: null, direction: null }
      })
    },
    [],
  )

  const sorted = sortData(data, sort.key, sort.direction)

  const wrapperStyle: React.CSSProperties = {
    overflow: "auto",
    borderRadius: "var(--radius-md, 8px)",
    border: "1px solid var(--color-border, #e2e8f0)",
  }

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "var(--font-size-sm, 0.875rem)",
    color: "var(--color-text-primary, inherit)",
    backgroundColor: "var(--color-surface, #fff)",
  }

  const thStyle = (col: ColumnDef<T>): React.CSSProperties => ({
    padding: "var(--spacing-3, 12px) var(--spacing-4, 16px)",
    textAlign: (col.align ?? "start") as React.CSSProperties["textAlign"],
    fontWeight: "var(--font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
    color: "var(--color-text-secondary, #64748b)",
    backgroundColor: "var(--color-surface-raised, #f8fafc)",
    borderBottom: "1px solid var(--color-border, #e2e8f0)",
    whiteSpace: "nowrap",
    userSelect: "none",
    ...(col.width ? { width: col.width } : {}),
    ...(stickyHeader
      ? { position: "sticky", top: 0, zIndex: 1 }
      : {}),
    cursor:
      globalSortable || col.sortable !== false ? "pointer" : "default",
  })

  const tdStyle = (col: ColumnDef<T>): React.CSSProperties => ({
    padding: "var(--spacing-3, 12px) var(--spacing-4, 16px)",
    textAlign: (col.align ?? "start") as React.CSSProperties["textAlign"],
    borderBottom: "1px solid var(--color-border, #e2e8f0)",
    color: "var(--color-text-primary, inherit)",
  })

  const isColSortable = (col: ColumnDef<T>) =>
    globalSortable && col.sortable !== false

  const getAriaSort = (col: ColumnDef<T>): React.AriaAttributes["aria-sort"] => {
    if (sort.key !== col.key) return "none"
    if (sort.direction === "asc") return "ascending"
    if (sort.direction === "desc") return "descending"
    return "none"
  }

  return (
    <div
      dir="auto"
      className={clsx("tui-table-wrapper", className)}
      style={wrapperStyle}
    >
      <table
        role="grid"
        style={tableStyle}
        className="tui-table"
      >
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                style={thStyle(col)}
                aria-sort={isColSortable(col) ? getAriaSort(col) : undefined}
                tabIndex={isColSortable(col) ? 0 : undefined}
                onClick={
                  isColSortable(col) ? () => handleSort(col.key) : undefined
                }
                onKeyDown={
                  isColSortable(col)
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          handleSort(col.key)
                        }
                      }
                    : undefined
                }
              >
                {col.header}
                {isColSortable(col) && (
                  <SortIcon
                    direction={
                      sort.key === col.key ? sort.direction : null
                    }
                  />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  ...tdStyle(columns[0]),
                  textAlign: "center",
                  color: "var(--color-text-muted, #94a3b8)",
                  padding: "var(--spacing-8, 32px)",
                }}
              >
                אין נתונים להצגה
              </td>
            </tr>
          ) : (
            sorted.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                style={
                  zebra && rowIdx % 2 === 1
                    ? { backgroundColor: "var(--color-surface-subtle, #f8fafc)" }
                    : undefined
                }
              >
                {columns.map((col) => (
                  <td key={col.key} style={tdStyle(col)}>
                    {col.render
                      ? col.render(row[col.key], row)
                      : String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Table
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
