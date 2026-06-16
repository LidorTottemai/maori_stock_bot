"use client"

import React, { useEffect, useState } from "react"
import { Badge, Spinner } from "@tottemai/ui"
import type { OrderTracking as OrderTrackingType } from "../types/shop"
import { fetchOrderTracking } from "../api/shopClient"

interface Props {
  token: string
}

const STATUS_LABELS: Record<string, string> = {
  open: "פתוח",
  completed: "הושלם",
  cancelled: "בוטל",
  pending: "ממתין לתשלום",
  paid: "שולם",
  failed: "נכשל",
  refunded: "הוחזר",
  partially_refunded: "הוחזר חלקית",
  unfulfilled: "טרם טופל",
  processing: "בעיבוד",
  ready: "מוכן לאיסוף",
  shipped: "נשלח",
  fulfilled: "סופק",
}

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "error" | "info"> = {
  completed: "success",
  fulfilled: "success",
  paid: "success",
  cancelled: "error",
  failed: "error",
  refunded: "warning",
  processing: "info",
  shipped: "info",
  ready: "info",
}

export function OrderTracking({ token }: Props) {
  const [data, setData] = useState<OrderTrackingType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    fetchOrderTracking(token)
      .then((d) => { setData(d); setLoading(false) })
      .catch((err) => { setError(err?.message ?? "שגיאה בטעינת ההזמנה"); setLoading(false) })
  }, [token])

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
        <Spinner size="lg" />
      </div>
    )
  }
  if (error) return <p style={{ color: "var(--ui-danger)" }}>{error}</p>
  if (!data) return null

  return (
    <div className="order-tracking">
      <h2>הזמנה #{data.order_number}</h2>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <Badge variant={STATUS_VARIANT[data.order_status] ?? "default"}>
          {STATUS_LABELS[data.order_status] ?? data.order_status}
        </Badge>
        <Badge variant={STATUS_VARIANT[data.payment_status] ?? "default"}>
          {STATUS_LABELS[data.payment_status] ?? data.payment_status}
        </Badge>
        <Badge variant={STATUS_VARIANT[data.fulfillment_status] ?? "default"}>
          {STATUS_LABELS[data.fulfillment_status] ?? data.fulfillment_status}
        </Badge>
      </div>

      {data.tracking_number && (
        <p>מספר מעקב: <strong>{data.tracking_number}</strong></p>
      )}

      <ul style={{ listStyle: "none", padding: 0, margin: "1rem 0", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        {data.items.map((item, i) => (
          <li key={i} style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{item.product_name} × {item.quantity}</span>
            <span>{item.item_total} ₪</span>
          </li>
        ))}
      </ul>

      <p style={{ color: "var(--ui-text-muted)", fontSize: "0.875rem" }}>
        תאריך הזמנה: {new Date(data.created_at).toLocaleDateString("he-IL")}
      </p>
    </div>
  )
}
