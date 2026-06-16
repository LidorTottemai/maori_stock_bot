"use client"

import React from "react"
import { useCart } from "../context/CartContext"

interface Props {
  open: boolean
  onClose: () => void
  onCheckout: () => void
}

export function CartDrawer({ open, onClose, onCheckout }: Props) {
  const { items, updateQuantity, removeItem, itemCount, subtotal } = useCart()

  if (!open) return null

  return (
    <div className="drawer-overlay" onClick={onClose} role="dialog" aria-modal aria-label="עגלת קניות">
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer__header">
          <h2>עגלת קניות ({itemCount})</h2>
          <button className="drawer__close" onClick={onClose} aria-label="סגור">
            ✕
          </button>
        </div>

        <div className="drawer__body">
          {items.length === 0 ? (
            <p className="cart-empty">העגלה ריקה</p>
          ) : (
            <>
              <ul className="cart-items">
                {items.map((item) => (
                  <li key={`${item.product_id}-${item.variant_sku_id ?? "base"}`} className="cart-item">
                    {item.product.image_urls[0] && (
                      <img
                        src={item.product.image_urls[0]}
                        alt={item.product.name}
                        className="cart-item__img"
                      />
                    )}
                    <div className="cart-item__info">
                      <p className="cart-item__name">{item.product.name}</p>
                      <p className="cart-item__price">
                        {parseFloat(item.unit_price).toFixed(2)} {item.product.currency}
                      </p>
                    </div>
                    <div className="cart-item__qty">
                      <button
                        onClick={() =>
                          updateQuantity(item.product_id, item.variant_sku_id, item.quantity - 1)
                        }
                        aria-label="הפחת כמות"
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product_id, item.variant_sku_id, item.quantity + 1)
                        }
                        aria-label="הוסף כמות"
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="cart-item__remove"
                      onClick={() => removeItem(item.product_id, item.variant_sku_id)}
                      aria-label="הסר מוצר"
                    >
                      🗑
                    </button>
                  </li>
                ))}
              </ul>

              <div className="cart-subtotal">
                <span>סה"כ ביניים:</span>
                <strong>{subtotal} ₪</strong>
              </div>

              <button className="btn-primary" onClick={onCheckout}>
                לתשלום
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
