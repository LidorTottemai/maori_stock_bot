"use client"

import React, { useEffect, useState } from "react"
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

export function OrderTracking({ token }: Props) {
  const [data, setData] = useState<OrderTrackingType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    fetchOrderTracking(token)
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch((err) => {
        setError(err?.message ?? "שגיאה בטעינת ההזמנה")
        setLoading(false)
      })
  }, [token])

  if (loading) return <div className="tracking-loading">טוען פרטי הזמנה...</div>
  if (error) return <div className="tracking-error">{error}</div>
  if (!data) return null

  return (
    <div className="order-tracking">
      <h2>הזמנה #{data.order_number}</h2>

      <div className="tracking-statuses">
        <div className="tracking-status">
          <span className="tracking-status__label">סטטוס הזמנה</span>
          <span className="tracking-status__value">{STATUS_LABELS[data.order_status] ?? data.order_status}</span>
        </div>
        <div className="tracking-status">
          <span className="tracking-status__label">סטטוס תשלום</span>
          <span className="tracking-status__value">{STATUS_LABELS[data.payment_status] ?? data.payment_status}</span>
        </div>
        <div className="tracking-status">
          <span className="tracking-status__label">סטטוס אספקה</span>
          <span className="tracking-status__value">{STATUS_LABELS[data.fulfillment_status] ?? data.fulfillment_status}</span>
        </div>
      </div>

      {data.tracking_number && (
        <p className="tracking-number">
          מספר מעקב: <strong>{data.tracking_number}</strong>
        </p>
      )}

      <div className="tracking-items">
        <h3>פריטים</h3>
        <ul>
          {data.items.map((item, i) => (
            <li key={i}>
              {item.product_name} × {item.quantity} — {item.item_total} ₪
            </li>
          ))}
        </ul>
      </div>

      <p className="tracking-date">
        תאריך הזמנה: {new Date(data.created_at).toLocaleDateString("he-IL")}
      </p>
    </div>
  )
}
