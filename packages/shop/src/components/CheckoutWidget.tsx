"use client"

import React, { useCallback, useRef, useState } from "react"
import type { CheckoutForm, OrderType, PaymentMode, ShippingAddress } from "../types/shop"
import { useCart } from "../context/CartContext"
import { useEstimate } from "../hooks/useEstimate"
import { createOrder, validateCoupon } from "../api/shopClient"

type Step = 1 | 2 | 3 | 4 | 5

interface Props {
  onSuccess: (orderNumber: string, trackingToken: string) => void
  onCancel: () => void
}

const defaultForm: CheckoutForm = {
  customer_name: "",
  customer_email: "",
  customer_phone: "",
  order_type: "delivery",
  payment_mode: "tranzila",
  shipping_address: { street: "", city: "", zip: "" },
  coupon_code: null,
  notes: null,
}

export function CheckoutWidget({ onSuccess, onCancel }: Props) {
  const { items, clear } = useCart()
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<CheckoutForm>(defaultForm)
  const [couponInput, setCouponInput] = useState("")
  const [couponError, setCouponError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const idempotencyKeyRef = useRef(crypto.randomUUID())

  const { estimate, loading: estimateLoading } = useEstimate(
    items,
    form.order_type,
    form.coupon_code,
  )

  function patch(partial: Partial<CheckoutForm>) {
    setForm((f) => ({ ...f, ...partial }))
  }

  function patchAddress(partial: Partial<ShippingAddress>) {
    setForm((f) => ({
      ...f,
      shipping_address: { ...(f.shipping_address ?? { street: "", city: "" }), ...partial },
    }))
  }

  async function applyCoupon() {
    setCouponError(null)
    try {
      const subtotal = estimate?.subtotal ?? "0"
      const result = await validateCoupon(couponInput, subtotal)
      if (result.valid) {
        patch({ coupon_code: couponInput })
        setCouponInput("")
      } else {
        setCouponError("קוד קופון לא תקין")
      }
    } catch {
      setCouponError("שגיאה בבדיקת הקופון")
    }
  }

  const submit = useCallback(async () => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const result = await createOrder(
        {
          ...form,
          shipping_address: form.order_type === "delivery" ? form.shipping_address : null,
        },
        items.map((i) => ({
          product_id: i.product_id,
          variant_sku_id: i.variant_sku_id,
          addon_selections: i.addon_selections,
          quantity: i.quantity,
        })),
        idempotencyKeyRef.current,
      )
      clear()
      onSuccess(result.order_number, result.public_tracking_token)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "שגיאה בשליחת ההזמנה")
    } finally {
      setSubmitting(false)
    }
  }, [form, items, clear, onSuccess])

  return (
    <div className="checkout-widget">
      <div className="checkout-steps">
        {([1, 2, 3, 4, 5] as Step[]).map((s) => (
          <span
            key={s}
            className={`checkout-step${step === s ? " checkout-step--active" : ""}${step > s ? " checkout-step--done" : ""}`}
          >
            {s}
          </span>
        ))}
      </div>

      {/* Step 1 — Cart Summary */}
      {step === 1 && (
        <div className="checkout-panel">
          <h3>סיכום הזמנה</h3>
          {items.length === 0 ? (
            <p>העגלה ריקה</p>
          ) : (
            <ul>
              {items.map((i) => (
                <li key={`${i.product_id}-${i.variant_sku_id ?? "base"}`}>
                  {i.product.name} × {i.quantity} —{" "}
                  {(parseFloat(i.unit_price) * i.quantity).toFixed(2)} ₪
                </li>
              ))}
            </ul>
          )}
          <div className="checkout-nav">
            <button onClick={onCancel}>ביטול</button>
            <button
              className="btn-primary"
              disabled={items.length === 0}
              onClick={() => setStep(2)}
            >
              המשך
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Customer Info */}
      {step === 2 && (
        <div className="checkout-panel">
          <h3>פרטי לקוח</h3>
          <label>
            שם מלא *
            <input
              value={form.customer_name}
              onChange={(e) => patch({ customer_name: e.target.value })}
            />
          </label>
          <label>
            אימייל *
            <input
              type="email"
              value={form.customer_email}
              onChange={(e) => patch({ customer_email: e.target.value })}
            />
          </label>
          <label>
            טלפון *
            <input
              type="tel"
              value={form.customer_phone}
              onChange={(e) => patch({ customer_phone: e.target.value })}
            />
          </label>
          <label>
            הערות
            <textarea
              value={form.notes ?? ""}
              onChange={(e) => patch({ notes: e.target.value || null })}
            />
          </label>
          <div className="checkout-nav">
            <button onClick={() => setStep(1)}>חזור</button>
            <button
              className="btn-primary"
              disabled={!form.customer_name || !form.customer_email || !form.customer_phone}
              onClick={() => setStep(3)}
            >
              המשך
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Delivery / Pickup */}
      {step === 3 && (
        <div className="checkout-panel">
          <h3>אופן אספקה</h3>
          <div className="order-type-options">
            {(["delivery", "pickup"] as OrderType[]).map((t) => (
              <label key={t}>
                <input
                  type="radio"
                  name="order_type"
                  value={t}
                  checked={form.order_type === t}
                  onChange={() => patch({ order_type: t })}
                />
                {t === "delivery" ? "משלוח" : "איסוף עצמי"}
              </label>
            ))}
          </div>

          {form.order_type === "delivery" && (
            <>
              <label>
                רחוב *
                <input
                  value={form.shipping_address?.street ?? ""}
                  onChange={(e) => patchAddress({ street: e.target.value })}
                />
              </label>
              <label>
                עיר *
                <input
                  value={form.shipping_address?.city ?? ""}
                  onChange={(e) => patchAddress({ city: e.target.value })}
                />
              </label>
              <label>
                מיקוד
                <input
                  value={form.shipping_address?.zip ?? ""}
                  onChange={(e) => patchAddress({ zip: e.target.value })}
                />
              </label>
            </>
          )}

          <div className="checkout-nav">
            <button onClick={() => setStep(2)}>חזור</button>
            <button
              className="btn-primary"
              disabled={
                form.order_type === "delivery" &&
                (!form.shipping_address?.street || !form.shipping_address?.city)
              }
              onClick={() => setStep(4)}
            >
              המשך
            </button>
          </div>
        </div>
      )}

      {/* Step 4 — Coupon */}
      {step === 4 && (
        <div className="checkout-panel">
          <h3>קופון הנחה</h3>
          <div className="coupon-row">
            <input
              placeholder="קוד קופון"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
            />
            <button onClick={applyCoupon}>החל</button>
          </div>
          {couponError && <p className="error">{couponError}</p>}
          {form.coupon_code && <p className="success">קופון {form.coupon_code} הופעל</p>}

          {estimateLoading ? (
            <p>מחשב עלויות...</p>
          ) : estimate ? (
            <div className="estimate-summary">
              <div>
                <span>סה"כ ביניים</span>
                <span>{estimate.subtotal} ₪</span>
              </div>
              {parseFloat(estimate.discount) > 0 && (
                <div>
                  <span>הנחה</span>
                  <span>−{estimate.discount} ₪</span>
                </div>
              )}
              {parseFloat(estimate.shipping_fee) > 0 && (
                <div>
                  <span>משלוח</span>
                  <span>{estimate.shipping_fee} ₪</span>
                </div>
              )}
              <div className="estimate-total">
                <strong>סה"כ לתשלום</strong>
                <strong>{estimate.total} ₪</strong>
              </div>
            </div>
          ) : null}

          <div className="checkout-nav">
            <button onClick={() => setStep(3)}>חזור</button>
            <button className="btn-primary" onClick={() => setStep(5)}>
              המשך לתשלום
            </button>
          </div>
        </div>
      )}

      {/* Step 5 — Payment */}
      {step === 5 && (
        <div className="checkout-panel">
          <h3>תשלום</h3>
          <div className="payment-options">
            {(["tranzila", "whatsapp", "cash"] as PaymentMode[]).map((m) => (
              <label key={m}>
                <input
                  type="radio"
                  name="payment_mode"
                  value={m}
                  checked={form.payment_mode === m}
                  onChange={() => patch({ payment_mode: m })}
                />
                {m === "tranzila" ? "כרטיס אשראי" : m === "whatsapp" ? "WhatsApp" : "מזומן/העברה"}
              </label>
            ))}
          </div>

          {estimate && (
            <p className="checkout-total">
              סה"כ לתשלום: <strong>{estimate.total} ₪</strong>
            </p>
          )}

          {submitError && <p className="error">{submitError}</p>}

          <div className="checkout-nav">
            <button onClick={() => setStep(4)}>חזור</button>
            <button className="btn-primary" disabled={submitting || !estimate} onClick={submit}>
              {submitting ? "שולח..." : "אישור הזמנה"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
