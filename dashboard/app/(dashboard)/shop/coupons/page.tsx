"use client"

import React, { useState } from "react"
import useSWR from "swr"
import { Tag, Plus, X } from "lucide-react"
import { api, type ShopCoupon, type ShopCouponCreate } from "@/lib/api"

const EMPTY_FORM: ShopCouponCreate = {
  code: "",
  discount_type: "percent",
  discount_value: 0,
  min_order: 0,
  max_discount: null,
  starts_at: null,
  expires_at: null,
  max_uses: null,
  per_customer_limit: null,
  applies_to_all_products: true,
}

function CouponPanel({
  initial,
  onClose,
  onSaved,
}: {
  initial?: ShopCoupon
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<ShopCouponCreate>(
    initial
      ? {
          code: initial.code,
          discount_type: initial.discount_type,
          discount_value: parseFloat(initial.discount_value),
          min_order: parseFloat(initial.min_order),
          max_discount: initial.max_discount ? parseFloat(initial.max_discount) : null,
          starts_at: initial.starts_at,
          expires_at: initial.expires_at,
          max_uses: initial.max_uses,
          per_customer_limit: initial.per_customer_limit,
          applies_to_all_products: initial.applies_to_all_products,
        }
      : EMPTY_FORM,
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const set = <K extends keyof ShopCouponCreate>(k: K, v: ShopCouponCreate[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.code.trim()) { setError("קוד חובה"); return }
    if (!form.discount_value || form.discount_value <= 0) { setError("ערך הנחה חובה"); return }
    setSaving(true)
    setError("")
    try {
      if (initial) {
        await api.shopUpdateCoupon(initial.id, form)
      } else {
        await api.shopCreateCoupon(form)
      }
      onSaved()
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "שגיאה")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-h-card border-r border-h-border h-full w-80 flex flex-col shadow-2xl overflow-y-auto" dir="rtl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-h-border">
          <h2 className="text-h-text font-semibold text-sm">{initial ? "ערוך קופון" : "קופון חדש"}</h2>
          <button onClick={onClose} className="text-h-muted hover:text-h-text"><X size={16} /></button>
        </div>

        <div className="flex-1 px-5 py-4 space-y-4">
          <div>
            <label className="text-h-muted text-xs block mb-1">קוד קופון</label>
            <input
              value={form.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              className="w-full bg-h-bg border border-h-border rounded-lg px-3 py-2 text-h-text text-sm focus:outline-none focus:border-h-fuchsia"
            />
          </div>
          <div>
            <label className="text-h-muted text-xs block mb-1">סוג הנחה</label>
            <select
              value={form.discount_type}
              onChange={(e) => set("discount_type", e.target.value as "percent" | "fixed")}
              className="w-full bg-h-bg border border-h-border rounded-lg px-3 py-2 text-h-text text-sm focus:outline-none focus:border-h-fuchsia"
            >
              <option value="percent">אחוז (%)</option>
              <option value="fixed">סכום קבוע (₪)</option>
            </select>
          </div>
          <div>
            <label className="text-h-muted text-xs block mb-1">
              ערך {form.discount_type === "percent" ? "(%)" : "(₪)"}
            </label>
            <input
              type="number"
              min={0}
              value={form.discount_value}
              onChange={(e) => set("discount_value", parseFloat(e.target.value) || 0)}
              className="w-full bg-h-bg border border-h-border rounded-lg px-3 py-2 text-h-text text-sm focus:outline-none focus:border-h-fuchsia"
            />
          </div>
          <div>
            <label className="text-h-muted text-xs block mb-1">מינימום הזמנה (₪)</label>
            <input
              type="number"
              min={0}
              value={form.min_order ?? 0}
              onChange={(e) => set("min_order", parseFloat(e.target.value) || 0)}
              className="w-full bg-h-bg border border-h-border rounded-lg px-3 py-2 text-h-text text-sm focus:outline-none focus:border-h-fuchsia"
            />
          </div>
          {form.discount_type === "percent" && (
            <div>
              <label className="text-h-muted text-xs block mb-1">מקסימום הנחה (₪, אופציונלי)</label>
              <input
                type="number"
                min={0}
                value={form.max_discount ?? ""}
                onChange={(e) => set("max_discount", e.target.value ? parseFloat(e.target.value) : null)}
                className="w-full bg-h-bg border border-h-border rounded-lg px-3 py-2 text-h-text text-sm focus:outline-none focus:border-h-fuchsia"
              />
            </div>
          )}
          <div>
            <label className="text-h-muted text-xs block mb-1">תאריך תפוגה (אופציונלי)</label>
            <input
              type="date"
              value={form.expires_at?.slice(0, 10) ?? ""}
              onChange={(e) => set("expires_at", e.target.value ? `${e.target.value}T23:59:59` : null)}
              className="w-full bg-h-bg border border-h-border rounded-lg px-3 py-2 text-h-text text-sm focus:outline-none focus:border-h-fuchsia"
            />
          </div>
          <div>
            <label className="text-h-muted text-xs block mb-1">מקסימום שימושים (אופציונלי)</label>
            <input
              type="number"
              min={1}
              value={form.max_uses ?? ""}
              onChange={(e) => set("max_uses", e.target.value ? parseInt(e.target.value) : null)}
              className="w-full bg-h-bg border border-h-border rounded-lg px-3 py-2 text-h-text text-sm focus:outline-none focus:border-h-fuchsia"
            />
          </div>
          <div>
            <label className="text-h-muted text-xs block mb-1">מגבלה ללקוח (אופציונלי)</label>
            <input
              type="number"
              min={1}
              value={form.per_customer_limit ?? ""}
              onChange={(e) => set("per_customer_limit", e.target.value ? parseInt(e.target.value) : null)}
              className="w-full bg-h-bg border border-h-border rounded-lg px-3 py-2 text-h-text text-sm focus:outline-none focus:border-h-fuchsia"
            />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        <div className="px-5 py-4 border-t border-h-border">
          <button
            onClick={save}
            disabled={saving}
            className="w-full py-2.5 bg-h-fuchsia text-white rounded-lg font-medium text-sm disabled:opacity-50"
          >
            {saving ? "שומר…" : initial ? "עדכן קופון" : "צור קופון"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CouponsPage() {
  const { data: coupons, isLoading, mutate } = useSWR("shop-coupons", api.shopCoupons)
  const [panelFor, setPanelFor] = useState<ShopCoupon | null | "new">(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await api.shopDeleteCoupon(id)
      mutate()
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggle = async (c: ShopCoupon) => {
    await api.shopUpdateCoupon(c.id, { ...c, discount_value: parseFloat(c.discount_value) } as unknown as Parameters<typeof api.shopUpdateCoupon>[1])
    mutate()
  }

  return (
    <div dir="rtl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-h-text flex items-center gap-2">
          <Tag size={22} className="text-h-fuchsia" />
          קופונים
        </h1>
        <button
          onClick={() => setPanelFor("new")}
          className="flex items-center gap-2 px-4 py-2 bg-h-fuchsia text-white rounded-xl text-sm font-medium"
        >
          <Plus size={15} />
          הוסף קופון
        </button>
      </div>

      <div className="bg-h-card border border-h-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="space-y-0">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 border-b border-h-border animate-pulse last:border-0" />
            ))}
          </div>
        ) : !coupons?.length ? (
          <p className="text-h-muted text-sm text-center py-10">אין קופונים</p>
        ) : (
          <>
            {/* Header */}
            <div className="grid grid-cols-[1fr_80px_80px_90px_60px_80px] gap-2 px-4 py-2 text-h-muted text-xs border-b border-h-border">
              <span>קוד</span>
              <span>סוג</span>
              <span>ערך</span>
              <span>תפוגה</span>
              <span>פעיל</span>
              <span />
            </div>
            {coupons.map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-[1fr_80px_80px_90px_60px_80px] gap-2 items-center px-4 py-3 border-b border-h-border last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                <button
                  className="text-h-text text-sm font-mono font-semibold text-right hover:text-h-fuchsia transition-colors"
                  onClick={() => setPanelFor(c)}
                >
                  {c.code}
                </button>
                <span className="text-h-muted text-xs">
                  {c.discount_type === "percent" ? "אחוז" : "₪ קבוע"}
                </span>
                <span className="text-h-text text-sm font-semibold">
                  {c.discount_type === "percent"
                    ? `${parseFloat(c.discount_value).toFixed(0)}%`
                    : `₪${parseFloat(c.discount_value).toFixed(0)}`}
                </span>
                <span className="text-h-muted text-xs">
                  {c.expires_at ? c.expires_at.slice(0, 10) : "—"}
                </span>
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                  c.is_active ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
                }`}>
                  {c.is_active ? "✓" : "✗"}
                </span>
                <div className="flex gap-1 justify-end">
                  <button
                    onClick={() => setPanelFor(c)}
                    className="text-h-muted hover:text-h-text text-xs px-2 py-1 rounded hover:bg-white/5"
                  >
                    ערוך
                  </button>
                  <button
                    onClick={() => { if (confirm(`למחוק קופון "${c.code}"?`)) handleDelete(c.id) }}
                    disabled={deletingId === c.id}
                    className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-500/10 disabled:opacity-50"
                  >
                    מחק
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {panelFor !== null && (
        <CouponPanel
          initial={panelFor === "new" ? undefined : panelFor}
          onClose={() => setPanelFor(null)}
          onSaved={() => mutate()}
        />
      )}
    </div>
  )
}
