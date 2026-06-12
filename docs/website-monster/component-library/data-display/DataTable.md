# DataTable

> **קטגוריה:** data-display
> **תלויות:** @tanstack/react-table, react, clsx
> **Storybook:** src/stories/DataTable.stories.tsx
> **קוד:** src/data-display/DataTable.tsx
> **עלות בנייה:** ~20 דקות

## מה זה
עטיפת TanStack Table עם מיון, סינון, עימוד ושליטה בעמודות. מספקת ממשק עשיר לעבודה עם טבלאות נתונים גדולות, כולל חיפוש גלובלי, ניהול ראות עמודות, ניווט בין עמודות ותמיכה מלאה ב-RTL.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | טבלה בסיסית עם מיון |
| With Filtering | שורת חיפוש מעל הטבלה |
| With Pagination | ניווט בין עמודות נתונים |
| Column Visibility | בחירת עמודות להצגה |
| Full Featured | כל הפיצ'רים פעילים ביחד |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `T[]` | required | מערך הנתונים להצגה |
| columns | `ColumnDef<T>[]` | required | הגדרת עמודות TanStack |
| pageSize | `number` | `10` | מספר שורות לעמוד |
| showFilters | `boolean` | `false` | האם להציג שדה חיפוש |
| showPagination | `boolean` | `true` | האם להציג ניווט עמודים |
| showColumnVisibility | `boolean` | `false` | האם להציג שליטה בעמודות |
| className | `string` | — | קלאס CSS נוסף לעטיפה |

## שימוש בסיסי
```tsx
import { DataTable } from "@tottemai/ui"
import { createColumnHelper } from "@tanstack/react-table"

type Person = { name: string; age: number; role: string }

const helper = createColumnHelper<Person>()

const columns = [
  helper.accessor("name", { header: "שם" }),
  helper.accessor("age",  { header: "גיל" }),
  helper.accessor("role", { header: "תפקיד" }),
]

const data: Person[] = [
  { name: "Alice", age: 30, role: "מפתחת" },
  { name: "Bob",   age: 25, role: "מעצב" },
]

export default function Demo() {
  return (
    <DataTable
      data={data}
      columns={columns}
      showFilters
      showPagination
      showColumnVisibility
    />
  )
}
```

## קוד מלא
```tsx
// src/data-display/DataTable.tsx
import React, { useState } from "react"
import clsx from "clsx"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type PaginationState,
} from "@tanstack/react-table"

export interface DataTableProps<T extends object> {
  data: T[]
  columns: ColumnDef<T, unknown>[]
  pageSize?: number
  showFilters?: boolean
  showPagination?: boolean
  showColumnVisibility?: boolean
  className?: string
}

// ── sub-components ────────────────────────────────────────────────────────────

const btnBase: React.CSSProperties = {
  padding: "var(--spacing-1, 4px) var(--spacing-3, 12px)",
  borderRadius: "var(--radius-sm, 4px)",
  border: "1px solid var(--color-border, #e2e8f0)",
  backgroundColor: "var(--color-surface, #fff)",
  color: "var(--color-text-primary, inherit)",
  fontSize: "var(--font-size-sm, 0.875rem)",
  cursor: "pointer",
  lineHeight: 1.5,
}

const disabledBtnStyle: React.CSSProperties = {
  ...btnBase,
  opacity: 0.4,
  cursor: "not-allowed",
}

function SortIndicator({ direction }: { direction: "asc" | "desc" | false }) {
  if (!direction) return <span aria-hidden="true" style={{ opacity: 0.3 }}> ⇅</span>
  return (
    <span aria-hidden="true" style={{ color: "var(--color-primary, currentColor)" }}>
      {direction === "asc" ? " ↑" : " ↓"}
    </span>
  )
}

// ── main component ────────────────────────────────────────────────────────────

export function DataTable<T extends object>({
  data,
  columns,
  pageSize = 10,
  showFilters = false,
  showPagination = true,
  showColumnVisibility = false,
  className,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter, columnVisibility, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const toolbarStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "var(--spacing-3, 12px)",
    marginBottom: "var(--spacing-3, 12px)",
  }

  const inputStyle: React.CSSProperties = {
    padding: "var(--spacing-2, 8px) var(--spacing-3, 12px)",
    border: "1px solid var(--color-border, #e2e8f0)",
    borderRadius: "var(--radius-sm, 4px)",
    backgroundColor: "var(--color-surface, #fff)",
    color: "var(--color-text-primary, inherit)",
    fontSize: "var(--font-size-sm, 0.875rem)",
    flex: "1 1 200px",
    minWidth: 0,
    outline: "none",
  }

  const wrapperStyle: React.CSSProperties = {
    overflow: "auto",
    border: "1px solid var(--color-border, #e2e8f0)",
    borderRadius: "var(--radius-md, 8px)",
  }

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "var(--font-size-sm, 0.875rem)",
    backgroundColor: "var(--color-surface, #fff)",
    color: "var(--color-text-primary, inherit)",
  }

  const thStyle: React.CSSProperties = {
    padding: "var(--spacing-3, 12px) var(--spacing-4, 16px)",
    textAlign: "start",
    fontWeight: "var(--font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
    backgroundColor: "var(--color-surface-raised, #f8fafc)",
    color: "var(--color-text-secondary, #64748b)",
    borderBottom: "1px solid var(--color-border, #e2e8f0)",
    whiteSpace: "nowrap",
    userSelect: "none",
    cursor: "pointer",
  }

  const tdStyle: React.CSSProperties = {
    padding: "var(--spacing-3, 12px) var(--spacing-4, 16px)",
    borderBottom: "1px solid var(--color-border, #e2e8f0)",
    color: "var(--color-text-primary, inherit)",
  }

  const paginationStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "var(--spacing-2, 8px)",
    marginTop: "var(--spacing-3, 12px)",
    flexWrap: "wrap",
    fontSize: "var(--font-size-sm, 0.875rem)",
    color: "var(--color-text-secondary, #64748b)",
  }

  return (
    <div
      dir="auto"
      className={clsx("tui-datatable", className)}
    >
      {/* Toolbar */}
      {(showFilters || showColumnVisibility) && (
        <div style={toolbarStyle}>
          {showFilters && (
            <input
              type="search"
              placeholder="חיפוש…"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              aria-label="חיפוש בטבלה"
              style={inputStyle}
            />
          )}

          {showColumnVisibility && (
            <div
              style={{ display: "flex", gap: "var(--spacing-2, 8px)", flexWrap: "wrap" }}
              role="group"
              aria-label="ראות עמודות"
            >
              {table.getAllLeafColumns().map((col) => (
                <label
                  key={col.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--spacing-1, 4px)",
                    fontSize: "var(--font-size-sm, 0.875rem)",
                    cursor: "pointer",
                    color: "var(--color-text-secondary, #64748b)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={col.getIsVisible()}
                    onChange={col.getToggleVisibilityHandler()}
                    aria-label={`הצג עמודה ${col.id}`}
                  />
                  {col.id}
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div style={wrapperStyle}>
        <table style={tableStyle} role="grid">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      style={thStyle}
                      aria-sort={
                        sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                          ? "descending"
                          : canSort
                          ? "none"
                          : undefined
                      }
                      tabIndex={canSort ? 0 : undefined}
                      onClick={header.column.getToggleSortingHandler()}
                      onKeyDown={
                        canSort
                          ? (e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault()
                                header.column.getToggleSortingHandler()?.(e)
                              }
                            }
                          : undefined
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && <SortIndicator direction={sorted} />}
                        </>
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    ...tdStyle,
                    textAlign: "center",
                    color: "var(--color-text-muted, #94a3b8)",
                    padding: "var(--spacing-8, 32px)",
                  }}
                >
                  אין נתונים להצגה
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, idx) => (
                <tr
                  key={row.id}
                  style={
                    idx % 2 === 1
                      ? { backgroundColor: "var(--color-surface-subtle, #f8fafc)" }
                      : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} style={tdStyle}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div style={paginationStyle} role="navigation" aria-label="ניווט עמודים">
          <button
            style={!table.getCanPreviousPage() ? disabledBtnStyle : btnBase}
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="עמוד ראשון"
          >
            «
          </button>
          <button
            style={!table.getCanPreviousPage() ? disabledBtnStyle : btnBase}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="עמוד קודם"
          >
            ‹
          </button>

          <span style={{ flex: 1, textAlign: "center" }}>
            עמוד{" "}
            <strong>
              {table.getState().pagination.pageIndex + 1} מתוך{" "}
              {table.getPageCount()}
            </strong>
          </span>

          <button
            style={!table.getCanNextPage() ? disabledBtnStyle : btnBase}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="עמוד הבא"
          >
            ›
          </button>
          <button
            style={!table.getCanNextPage() ? disabledBtnStyle : btnBase}
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
            aria-label="עמוד אחרון"
          >
            »
          </button>

          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            aria-label="שורות לעמוד"
            style={{
              ...btnBase,
              paddingInlineEnd: "var(--spacing-2, 8px)",
            }}
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size} שורות
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

export default DataTable
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
