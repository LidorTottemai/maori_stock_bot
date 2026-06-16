"use client"

import React, { useState } from "react"
import useSWR from "swr"
import { Users, Search, ChevronDown, ChevronUp, Check, X } from "lucide-react"
import { api, type ShopCustomer, type ShopOrder } from "@/lib/api"

function OrdersExpander({ customerId }: { customerId: string }) {
  const { data: orders, isLoading } = useSWR(
    `customer-orders-${customerId}`,
    () => api.shopCustomerOrders(customerId),
  )

  if (isLoading)
    return <div className="p-3 text-h-muted text-xs animate-pulse">טוען הזמנות…</div>

  if (!orders?.length)
    return <div className="p-3 text-h-muted text-xs">אין הזמנות</div>

  return (
    <div className="px-3 pb-3 space-y-1">
      {orders.map((o) => (
        <div key={o.id} className="flex items-center gap-2 text-xs py-1.5 border-b border-h-border last:border-0">
          <span className="text-h-muted w-20 shrink-0">{o.order_number}</span>
          <span className="text-h-muted">{o.created_at.slice(0, 10)}</span>
          <span className="flex-1" />
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
            o.payment_status === "paid" ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"
          }`}>{o.payment_status}</span>
          <span className="text-h-text font-semibold">₪{parseFloat(o.total).toFixed(0)}</span>
        </div>
      ))}
    </div>
  )
}

function EditPanel({
  customer,
  onClose,
  onSaved,
}: {
  customer: ShopCustomer
  onClose: () => void
  onSaved: () => void
}) {
  const [notes, setNotes] = useState(customer.notes ?? "")
  const [tags, setTags] = useState((customer.tags ?? []).join(", "))
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await api.shopUpdateCustomer(customer.id, {
        notes: notes || null,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      })
      onSaved()
      onClose()
    } catch {
      /* noop */
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border-t border-h-border bg-h-bg/50 p-4 space-y-3">
      <div>
        <label className="text-h-muted text-xs mb-1 block">הערות</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full bg-h-bg border border-h-border rounded-lg px-3 py-2 text-h-text text-sm resize-none focus:outline-none focus:border-h-fuchsia"
        />
      </div>
      <div>
        <label className="text-h-muted text-xs mb-1 block">תגיות (מופרד בפסיקים)</label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full bg-h-bg border border-h-border rounded-lg px-3 py-2 text-h-text text-sm focus:outline-none focus:border-h-fuchsia"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className="px-3 py-1.5 text-sm text-h-muted hover:text-h-text">ביטול</button>
        <button
          onClick={save}
          disabled={saving}
          className="px-3 py-1.5 text-sm bg-h-fuchsia text-white rounded-lg disabled:opacity-50"
        >
          {saving ? "שומר…" : "שמור"}
        </button>
      </div>
    </div>
  )
}

export default function CustomersPage() {
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data: customers, isLoading, mutate } = useSWR(
    ["shop-customers", search],
    () => api.shopCustomers(search ? { search } : undefined),
    { keepPreviousData: true },
  )

  return (
    <div dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-h-text flex items-center gap-2">
          <Users size={22} className="text-h-fuchsia" />
          לקוחות
        </h1>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-h-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חיפוש לפי שם, מייל, טלפון…"
          className="w-full bg-h-card border border-h-border rounded-xl pr-9 pl-3 py-2 text-sm text-h-text placeholder:text-h-muted focus:outline-none focus:border-h-fuchsia"
        />
      </div>

      {/* Table */}
      <div className="bg-h-card border border-h-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="space-y-0">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 border-b border-h-border animate-pulse last:border-0" />
            ))}
          </div>
        ) : !customers?.length ? (
          <p className="text-h-muted text-sm text-center py-10">אין לקוחות</p>
        ) : (
          <div>
            {customers.map((c) => (
              <div key={c.id}>
                {/* Row */}
                <div
                  className="flex items-center gap-3 px-4 py-3 border-b border-h-border last:border-0 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-h-text text-sm font-medium truncate">{c.name}</span>
                      {c.marketing_consent && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/15 text-green-400 shrink-0">
                          שיווק
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 text-h-muted text-xs mt-0.5">
                      {c.email && <span className="truncate">{c.email}</span>}
                      {c.phone && <span>{c.phone}</span>}
                    </div>
                  </div>
                  <div className="text-h-muted text-xs shrink-0">{c.created_at.slice(0, 10)}</div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingId(editingId === c.id ? null : c.id) }}
                    className="text-h-muted hover:text-h-text text-xs px-2 py-1 rounded hover:bg-white/5"
                  >
                    עריכה
                  </button>
                  {expandedId === c.id ? (
                    <ChevronUp size={14} className="text-h-muted shrink-0" />
                  ) : (
                    <ChevronDown size={14} className="text-h-muted shrink-0" />
                  )}
                </div>

                {/* Edit panel */}
                {editingId === c.id && (
                  <EditPanel
                    customer={c}
                    onClose={() => setEditingId(null)}
                    onSaved={() => mutate()}
                  />
                )}

                {/* Orders expansion */}
                {expandedId === c.id && (
                  <div className="bg-h-bg/30 border-b border-h-border last:border-0">
                    <p className="px-4 pt-2 text-h-muted text-xs font-semibold uppercase tracking-widest">
                      הזמנות אחרונות
                    </p>
                    <OrdersExpander customerId={c.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
