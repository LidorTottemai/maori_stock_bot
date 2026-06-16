"use client"

import React, { useState } from "react"
import useSWR from "swr"
import { ShoppingBag, Plus, Trash2, X } from "lucide-react"
import clsx from "clsx"
import { api, type ShopProduct, type ShopProductCreate } from "@/lib/api"

// ── Add product form ──────────────────────────────────────────────────────────

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

function AddProductPanel({
  onClose,
  onAdded,
}: {
  onClose: () => void
  onAdded: () => void
}) {
  const [form, setForm] = useState<ShopProductCreate>({
    name: "",
    slug: "",
    price: 0,
    stock: 0,
    description: null,
    is_active: true,
    product_type: "physical",
    currency: "ILS",
    image_urls: [],
    tags: [],
    track_inventory: true,
    allow_backorder: false,
    requires_shipping: true,
    sort_order: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function patch(partial: Partial<ShopProductCreate>) {
    setForm((f) => ({ ...f, ...partial }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.slug.trim() || form.price <= 0) return
    setLoading(true)
    setError(null)
    try {
      await api.shopCreateProduct(form)
      onAdded()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה ביצירת מוצר")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" dir="rtl">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-h-card border-r border-h-border h-full overflow-y-auto flex flex-col z-10">
        <div className="flex items-center justify-between p-5 border-b border-h-border flex-shrink-0">
          <h2 className="text-h-text font-semibold text-base">הוסף מוצר</h2>
          <button onClick={onClose} className="text-h-muted hover:text-h-text transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 flex flex-col gap-4 flex-1">
          <Field label="שם מוצר *">
            <input
              required
              className={inputCls}
              value={form.name}
              onChange={(e) => patch({ name: e.target.value, slug: slugify(e.target.value) })}
            />
          </Field>

          <Field label="Slug *">
            <input
              required
              className={inputCls}
              value={form.slug}
              onChange={(e) => patch({ slug: e.target.value })}
              dir="ltr"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="מחיר (₪) *">
              <input
                required
                type="number"
                min="0"
                step="0.01"
                className={inputCls}
                value={form.price || ""}
                onChange={(e) => patch({ price: parseFloat(e.target.value) || 0 })}
                dir="ltr"
              />
            </Field>
            <Field label="מלאי">
              <input
                type="number"
                min="0"
                className={inputCls}
                value={form.stock ?? 0}
                onChange={(e) => patch({ stock: parseInt(e.target.value) || 0 })}
                dir="ltr"
              />
            </Field>
          </div>

          <Field label="תיאור">
            <textarea
              className={clsx(inputCls, "resize-none")}
              rows={3}
              value={form.description ?? ""}
              onChange={(e) => patch({ description: e.target.value || null })}
            />
          </Field>

          <Field label="סוג מוצר">
            <select
              className={inputCls}
              value={form.product_type}
              onChange={(e) => patch({ product_type: e.target.value })}
            >
              <option value="physical">פיזי</option>
              <option value="digital">דיגיטלי</option>
              <option value="service_voucher">שובר שירות</option>
            </select>
          </Field>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => patch({ is_active: e.target.checked })}
              className="accent-h-fuchsia w-4 h-4"
            />
            <span className="text-h-text text-sm">פעיל (מוצג בחנות)</span>
          </label>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 mt-auto pt-2">
            <button
              type="submit"
              disabled={loading || !form.name.trim() || !form.slug.trim() || form.price <= 0}
              className="flex-1 py-2.5 bg-h-fuchsia text-white rounded-lg text-sm font-medium hover:bg-h-fuchsia/90 disabled:opacity-50 transition-all"
            >
              {loading ? "שומר..." : "הוסף מוצר"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-h-bg border border-h-border text-h-muted rounded-lg text-sm hover:text-h-text transition-colors"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputCls =
  "w-full bg-h-bg border border-h-border rounded-lg px-3 py-2 text-h-text text-sm focus:outline-none focus:border-h-fuchsia/50 transition-colors"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-h-muted text-xs font-medium">{label}</label>
      {children}
    </div>
  )
}

// ── Product row ───────────────────────────────────────────────────────────────

function ProductRow({
  product,
  onMutate,
}: {
  product: ShopProduct
  onMutate: () => void
}) {
  const [stock, setStock] = useState(String(product.stock))
  const [savingStock, setSavingStock] = useState(false)
  const [togglingActive, setTogglingActive] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const deleted = !!product.deleted_at

  async function saveStock() {
    const n = parseInt(stock)
    if (isNaN(n) || n === product.stock) return
    setSavingStock(true)
    try {
      await api.shopUpdateStock(product.id, n)
      onMutate()
    } finally {
      setSavingStock(false)
    }
  }

  async function toggleActive() {
    setTogglingActive(true)
    try {
      await api.shopToggleActive(product.id, !product.is_active)
      onMutate()
    } finally {
      setTogglingActive(false)
    }
  }

  async function doDelete() {
    setDeleting(true)
    try {
      await api.shopDeleteProduct(product.id)
      onMutate()
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div
      className={clsx(
        "bg-h-card border border-h-border rounded-xl p-4 flex items-center gap-4 transition-opacity",
        deleted && "opacity-50"
      )}
    >
      {/* Thumbnail */}
      {product.image_urls[0] ? (
        <img
          src={product.image_urls[0]}
          alt={product.name}
          className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-h-border"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-h-bg border border-h-border flex items-center justify-center flex-shrink-0">
          <ShoppingBag size={18} className="text-h-border" />
        </div>
      )}

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-h-text text-sm font-medium truncate">{product.name}</p>
          {deleted && (
            <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded-full font-medium">
              נמחק
            </span>
          )}
          {!deleted && !product.is_active && (
            <span className="text-[10px] bg-h-border/40 text-h-muted border border-h-border px-1.5 py-0.5 rounded-full font-medium">
              לא פעיל
            </span>
          )}
        </div>
        {product.sku && (
          <p className="text-h-muted text-xs" dir="ltr">{product.sku}</p>
        )}
        <p className="text-h-fuchsia text-sm font-semibold mt-0.5">
          {parseFloat(product.price).toFixed(2)} {product.currency}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Stock edit */}
        {!deleted && product.track_inventory && (
          <div className="flex flex-col items-center gap-0.5">
            <label className="text-h-muted text-[10px]">מלאי</label>
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              onBlur={saveStock}
              disabled={savingStock}
              className="w-16 bg-h-bg border border-h-border rounded-lg px-2 py-1 text-h-text text-xs text-center focus:outline-none focus:border-h-fuchsia/50 disabled:opacity-50"
              dir="ltr"
            />
          </div>
        )}

        {/* Active toggle */}
        {!deleted && (
          <div className="flex flex-col items-center gap-0.5">
            <label className="text-h-muted text-[10px]">פעיל</label>
            <input
              type="checkbox"
              checked={product.is_active}
              onChange={toggleActive}
              disabled={togglingActive}
              className="w-4 h-4 accent-h-fuchsia cursor-pointer disabled:opacity-50"
            />
          </div>
        )}

        {/* Delete */}
        {!deleted && (
          <div>
            {confirmDelete ? (
              <div className="flex gap-1">
                <button
                  onClick={doDelete}
                  disabled={deleting}
                  className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-xs hover:bg-red-500/20 disabled:opacity-50"
                >
                  {deleting ? "..." : "מחק"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1 bg-h-bg border border-h-border text-h-muted rounded text-xs"
                >
                  ×
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 text-h-muted hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                aria-label="מחק מוצר"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ShopProductsPage() {
  const [search, setSearch] = useState("")
  const [showAdd, setShowAdd] = useState(false)

  const { data: products, isLoading, error, mutate } = useSWR(
    ["shop-products", search],
    () => api.shopProducts({ search: search || undefined }),
  )

  return (
    <div dir="rtl">
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-h-text flex items-center gap-2">
            <ShoppingBag size={22} className="text-h-fuchsia" />
            מוצרים
          </h1>
          {products && (
            <p className="text-h-muted text-sm mt-1">{products.length} מוצרים</p>
          )}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-h-fuchsia text-white rounded-lg text-sm font-medium hover:bg-h-fuchsia/90 transition-all"
        >
          <Plus size={16} />
          הוסף מוצר
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="search"
          placeholder="חיפוש מוצרים..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm bg-h-card border border-h-border rounded-lg px-4 py-2.5 text-h-text text-sm focus:outline-none focus:border-h-fuchsia/50 transition-colors placeholder:text-h-muted"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-h-card border border-h-border rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-h-card border border-red-500/20 rounded-xl p-6 text-center">
          <p className="text-red-400 text-sm">{error?.message ?? "שגיאה בטעינת מוצרים"}</p>
        </div>
      ) : !products?.length ? (
        <div className="bg-h-card border border-h-border rounded-xl p-12 text-center">
          <ShoppingBag size={36} className="mx-auto text-h-border mb-3" />
          <p className="text-h-muted text-sm">
            {search ? "לא נמצאו מוצרים התואמים לחיפוש" : "אין מוצרים עדיין"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((p) => (
            <ProductRow key={p.id} product={p} onMutate={() => mutate()} />
          ))}
        </div>
      )}

      {showAdd && (
        <AddProductPanel onClose={() => setShowAdd(false)} onAdded={() => mutate()} />
      )}
    </div>
  )
}
