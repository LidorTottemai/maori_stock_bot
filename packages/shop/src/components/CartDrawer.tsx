"use client"

import React from "react"
import { Button, Drawer, QuantityStepper } from "@tottemai/ui"
import { useCart } from "../context/CartContext"

interface Props {
  open: boolean
  onClose: () => void
  onCheckout: () => void
}

export function CartDrawer({ open, onClose, onCheckout }: Props) {
  const { items, updateQuantity, removeItem, itemCount, subtotal } = useCart()

  return (
    <Drawer open={open} onClose={onClose} title={`עגלת קניות (${itemCount})`} aria-label="עגלת קניות">
      {items.length === 0 ? (
        <p style={{ color: "var(--ui-text-muted)", textAlign: "center" }}>העגלה ריקה</p>
      ) : (
        <>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
            {items.map((item) => (
              <li
                key={`${item.product_id}-${item.variant_sku_id ?? "base"}`}
                style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
              >
                {item.product.image_urls[0] && (
                  <img
                    src={item.product.image_urls[0]}
                    alt={item.product.name}
                    style={{ width: 56, height: 56, objectFit: "cover", borderRadius: "var(--ui-radius-sm)", flexShrink: 0 }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.product.name}
                  </p>
                  <p style={{ margin: 0, color: "var(--ui-text-muted)", fontSize: "0.875rem" }}>
                    {parseFloat(item.unit_price).toFixed(2)} {item.product.currency}
                  </p>
                </div>
                <QuantityStepper
                  value={item.quantity}
                  min={0}
                  onChange={(q) => {
                    if (q === 0) removeItem(item.product_id, item.variant_sku_id)
                    else updateQuantity(item.product_id, item.variant_sku_id, q)
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.product_id, item.variant_sku_id)}
                  aria-label="הסר מוצר"
                  style={{ color: "var(--ui-danger)" }}
                >
                  ✕
                </Button>
              </li>
            ))}
          </ul>

          <div style={{ borderTop: "1px solid var(--ui-border)", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "var(--ui-text-muted)" }}>סה"כ ביניים:</span>
            <strong>{subtotal} ₪</strong>
          </div>

          <Button variant="primary" onClick={onCheckout} style={{ width: "100%" }}>
            לתשלום
          </Button>
        </>
      )}
    </Drawer>
  )
}
