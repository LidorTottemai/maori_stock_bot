"use client"

import React, { useState } from "react"
import useSWR from "swr"
import { format } from "date-fns"
import { he } from "date-fns/locale"
import { PackageSearch, RefreshCw } from "lucide-react"
import clsx from "clsx"
import { api, type ShopOrder } from "@/lib/api"

// Fulfillment pipeline per order_type
const NEXT_FULFILLMENT: Record<string, Record<string, string>> = {
  delivery: { unfulfilled: "processing", processing: "shipped", shipped: "fulfilled" },
  pickup:   { unfulfilled: "ready", ready: "fulfilled" },
  digital:  { unfulfilled: "fulfilled" },
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  open: "פתוח", completed: "הושלם", cancelled: "בוטל",
}
const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "ממתין", paid: "שולם", failed: "נכשל",
  refunded: "הוחזר", partially_refunded: "הוחזר חלקית",
}
const FULFILLMENT_STATUS_LABELS: Record<string, string> = {
  unfulfilled: "טרם טופל", processing: "בעיבוד", ready: "מוכן",
  shipped: "נשלח", fulfilled: "סופק",
}
const ORDER_TYPE_LABELS: Record<string, string> = {
  delivery: "משלוח", pickup: "איסוף", digital: "דיגיטלי",
}

type BadgeVariant = "green" | "red" | "blue" | "yellow" | "gray"

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  completed: "green", fulfilled: "green", paid: "green",
  cancelled: "red",   failed: "red",
  refunded: "yellow", partially_refunded: "yellow",
  processing: "blue", shipped: "blue", ready: "blue",
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  green:  "bg-green-500/10 text-green-400 border border-green-500/20",
  red:    "bg-red-500/10 text-red-400 border border-red-500/20",
  blue:   "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  yellow: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  gray:   "bg-h-border/40 text-h-muted border border-h-border",
}

function StatusBadge({ value, labels }: { value: string; labels: Record<string, string> }) {
  const variant: BadgeVariant = STATUS_VARIANT[value] ?? "gray"
  return (
    <span className={clsx("text-[11px] font-medium px-2 py-0.5 rounded-full", VARIANT_CLASSES[variant])}>
      {labels[value] ?? value}
    </span>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
        active
          ? "bg-h-fuchsia/10 text-h-fuchsia border-h-fuchsia/30"
          : "bg-h-card text-h-muted border-h-border hover:text-h-text"
      )}
    >
      {label}
    </button>
  )
}

function CancelConfirm({
  orderId,
  onDone,
}: {
  orderId: string
  onDone: () => void
}) {
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function confirm() {
    if (!reason.trim()) return
    setLoading(true)
    setError(null)
    try {
      await api.shopCancelOrder(orderId, reason.trim())
      onDone()
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה בביטול")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-2 p-3 bg-h-bg rounded-lg border border-h-border flex flex-col gap-2">
      <textarea
        className="w-full bg-h-card border border-h-border rounded-lg text-h-text text-xs p-2 resize-none focus:outline-none focus:border-h-fuchsia/50"
        rows={2}
        placeholder="סיבת ביטול..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={confirm}
          disabled={loading || !reason.trim()}
          className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-medium hover:bg-red-500/20 disabled:opacity-50"
        >
          {loading ? "מבטל..." : "אישור ביטול"}
        </button>
        <button
          onClick={onDone}
          className="px-3 py-1 bg-h-card text-h-muted border border-h-border rounded-lg text-xs hover:text-h-text"
        >
          בטל
        </button>
      </div>
    </div>
  )
}

function OrderRow({
  order,
  onMutate,
}: {
  order: ShopOrder
  onMutate: () => void
}) {
  const [advancing, setAdvancing] = useState(false)
  const [showCancel, setShowCancel] = useState(false)

  const nextStatus = NEXT_FULFILLMENT[order.order_type]?.[order.fulfillment_status]
  const canCancel = order.order_status === "open" && order.payment_status !== "refunded"

  async function advance() {
    if (!nextStatus) return
    setAdvancing(true)
    try {
      await api.shopUpdateFulfillment(order.id, nextStatus)
      onMutate()
    } finally {
      setAdvancing(false)
    }
  }

  return (
    <div className="bg-h-card border border-h-border rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        {/* Order info */}
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-h-text font-semibold text-sm">{order.order_number}</span>
            <span className={clsx(
              "text-[11px] font-medium px-2 py-0.5 rounded-full border",
              order.order_type === "delivery" ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                : order.order_type === "pickup" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                : "bg-orange-500/10 text-orange-400 border-orange-500/20"
            )}>
              {ORDER_TYPE_LABELS[order.order_type] ?? order.order_type}
            </span>
          </div>
          <p className="text-h-muted text-xs truncate">
            {order.customer_name} · {order.customer_phone}
          </p>
          <p className="text-h-muted text-xs opacity-60">
            {format(new Date(order.created_at), "d בMMM yyyy, HH:mm", { locale: he })}
          </p>
        </div>

        {/* Statuses + total */}
        <div className="flex flex-col gap-1.5 items-end">
          <p className="text-h-text font-bold text-base">{parseFloat(order.total).toFixed(2)} ₪</p>
          <div className="flex flex-wrap gap-1 justify-end">
            <StatusBadge value={order.order_status} labels={ORDER_STATUS_LABELS} />
            <StatusBadge value={order.payment_status} labels={PAYMENT_STATUS_LABELS} />
            <StatusBadge value={order.fulfillment_status} labels={FULFILLMENT_STATUS_LABELS} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {nextStatus && order.order_status === "open" && (
          <button
            onClick={advance}
            disabled={advancing}
            className="px-3 py-1.5 bg-h-fuchsia/10 text-h-fuchsia border border-h-fuchsia/30 rounded-lg text-xs font-medium hover:bg-h-fuchsia/20 disabled:opacity-50 transition-all"
          >
            {advancing ? "מעדכן..." : `קדם → ${FULFILLMENT_STATUS_LABELS[nextStatus]}`}
          </button>
        )}
        {canCancel && !showCancel && (
          <button
            onClick={() => setShowCancel(true)}
            className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-all"
          >
            ביטול
          </button>
        )}
      </div>

      {showCancel && (
        <CancelConfirm
          orderId={order.id}
          onDone={() => { setShowCancel(false); onMutate() }}
        />
      )}
    </div>
  )
}

const ORDER_STATUS_FILTERS = [
  { value: "", label: "כל הסטטוסים" },
  { value: "open", label: "פתוח" },
  { value: "completed", label: "הושלם" },
  { value: "cancelled", label: "בוטל" },
]
const FULFILLMENT_FILTERS = [
  { value: "", label: "כל השלבים" },
  { value: "unfulfilled", label: "טרם טופל" },
  { value: "processing", label: "בעיבוד" },
  { value: "shipped", label: "נשלח" },
  { value: "ready", label: "מוכן לאיסוף" },
  { value: "fulfilled", label: "סופק" },
]

export default function ShopOrdersPage() {
  const [orderStatus, setOrderStatus] = useState("")
  const [fulfillmentStatus, setFulfillmentStatus] = useState("")

  const swrKey = ["shop-orders", orderStatus, fulfillmentStatus]
  const { data: orders, isLoading, error, mutate } = useSWR(
    swrKey,
    () => api.shopOrders({
      order_status: orderStatus || undefined,
      fulfillment_status: fulfillmentStatus || undefined,
    }),
    { refreshInterval: 30000 }
  )

  return (
    <div dir="rtl">
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-h-text flex items-center gap-2">
            <PackageSearch size={22} className="text-h-fuchsia" />
            הזמנות
          </h1>
          {orders && (
            <p className="text-h-muted text-sm mt-1">{orders.length} הזמנות</p>
          )}
        </div>
        <button
          onClick={() => mutate()}
          className="p-2 rounded-lg bg-h-card border border-h-border text-h-muted hover:text-h-text transition-colors"
          aria-label="רענן"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-2">
        <div className="flex gap-2 flex-wrap">
          {ORDER_STATUS_FILTERS.map((f) => (
            <FilterChip
              key={f.value}
              label={f.label}
              active={orderStatus === f.value}
              onClick={() => setOrderStatus(f.value)}
            />
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {FULFILLMENT_FILTERS.map((f) => (
            <FilterChip
              key={f.value}
              label={f.label}
              active={fulfillmentStatus === f.value}
              onClick={() => setFulfillmentStatus(f.value)}
            />
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-h-card border border-h-border rounded-xl h-28 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-h-card border border-red-500/20 rounded-xl p-6 text-center">
          <p className="text-red-400 text-sm">{error?.message ?? "שגיאה בטעינת הזמנות"}</p>
        </div>
      ) : !orders?.length ? (
        <div className="bg-h-card border border-h-border rounded-xl p-12 text-center">
          <PackageSearch size={36} className="mx-auto text-h-border mb-3" />
          <p className="text-h-muted text-sm">לא נמצאו הזמנות</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} onMutate={() => mutate()} />
          ))}
        </div>
      )}
    </div>
  )
}
