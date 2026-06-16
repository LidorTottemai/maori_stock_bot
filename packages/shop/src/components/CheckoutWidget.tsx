"use client"

import React, { useCallback, useRef, useState } from "react"
import { Button, Input, Textarea, RadioGroup, Stepper } from "@tottemai/ui"
import type { CheckoutForm, OrderType, PaymentMode, ShippingAddress } from "../types/shop"
import { useCart } from "../context/CartContext"
import { useEstimate } from "../hooks/useEstimate"
import { createOrder, validateCoupon } from "../api/shopClient"

type Step = 0 | 1 | 2 | 3 | 4

const STEPS = ["עגלה", "פרטים", "משלוח", "קופון", "תשלום"]

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
  const [step, setStep] = useState<Step>(0)
  const [form, setForm] = useState<CheckoutForm>(defaultForm)
  const [couponInput, setCouponInput] = useState("")
  const [couponError, setCouponError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const idempotencyKeyRef = useRef(crypto.randomUUID())

  const { estimate, loading: estimateLoading } = useEstimate(items, form.order_type, form.coupon_code)

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
      const result = await validateCoupon(couponInput, estimate?.subtotal ?? "0")
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
        { ...form, shipping_address: form.order_type === "delivery" ? form.shipping_address : null },
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
      <Stepper steps={STEPS} current={step} />

      {/* Step 0 — Cart Summary */}
      {step === 0 && (
        <div className="checkout-panel">
          <h3>סיכום הזמנה</h3>
          {items.length === 0 ? (
            <p style={{ color: "var(--ui-text-muted)" }}>העגלה ריקה</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {items.map((i) => (
                <li key={`${i.product_id}-${i.variant_sku_id ?? "base"}`} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{i.product.name} × {i.quantity}</span>
                  <span>{(parseFloat(i.unit_price) * i.quantity).toFixed(2)} ₪</span>
                </li>
              ))}
            </ul>
          )}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <Button variant="ghost" onClick={onCancel}>ביטול</Button>
            <Button variant="primary" disabled={items.length === 0} onClick={() => setStep(1)} style={{ flex: 1 }}>
              המשך
            </Button>
          </div>
        </div>
      )}

      {/* Step 1 — Customer Info */}
      {step === 1 && (
        <div className="checkout-panel">
          <h3>פרטי לקוח</h3>
          <Input label="שם מלא *" value={form.customer_name} onChange={(e) => patch({ customer_name: e.target.value })} />
          <Input label="אימייל *" type="email" value={form.customer_email} onChange={(e) => patch({ customer_email: e.target.value })} />
          <Input label="טלפון *" type="tel" value={form.customer_phone} onChange={(e) => patch({ customer_phone: e.target.value })} />
          <Textarea label="הערות" value={form.notes ?? ""} onChange={(e) => patch({ notes: e.target.value || null })} rows={3} />
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <Button variant="secondary" onClick={() => setStep(0)}>חזור</Button>
            <Button
              variant="primary"
              disabled={!form.customer_name || !form.customer_email || !form.customer_phone}
              onClick={() => setStep(2)}
              style={{ flex: 1 }}
            >
              המשך
            </Button>
          </div>
        </div>
      )}

      {/* Step 2 — Delivery */}
      {step === 2 && (
        <div className="checkout-panel">
          <h3>אופן אספקה</h3>
          <RadioGroup
            name="order_type"
            label="בחר אופן אספקה"
            value={form.order_type}
            onChange={(v) => patch({ order_type: v as OrderType })}
            options={[
              { value: "delivery", label: "משלוח" },
              { value: "pickup",   label: "איסוף עצמי" },
            ]}
          />
          {form.order_type === "delivery" && (
            <>
              <Input label="רחוב *" value={form.shipping_address?.street ?? ""} onChange={(e) => patchAddress({ street: e.target.value })} />
              <Input label="עיר *"  value={form.shipping_address?.city ?? ""}   onChange={(e) => patchAddress({ city: e.target.value })} />
              <Input label="מיקוד"  value={form.shipping_address?.zip ?? ""}    onChange={(e) => patchAddress({ zip: e.target.value })} />
            </>
          )}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <Button variant="secondary" onClick={() => setStep(1)}>חזור</Button>
            <Button
              variant="primary"
              disabled={form.order_type === "delivery" && (!form.shipping_address?.street || !form.shipping_address?.city)}
              onClick={() => setStep(3)}
              style={{ flex: 1 }}
            >
              המשך
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 — Coupon */}
      {step === 3 && (
        <div className="checkout-panel">
          <h3>קופון הנחה</h3>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Input
              placeholder="קוד קופון"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              style={{ flex: 1 }}
            />
            <Button variant="secondary" onClick={applyCoupon}>החל</Button>
          </div>
          {couponError && <p style={{ color: "var(--ui-danger)", margin: "0.25rem 0 0" }}>{couponError}</p>}
          {form.coupon_code && <p style={{ color: "var(--ui-success)", margin: "0.25rem 0 0" }}>קופון {form.coupon_code} הופעל ✓</p>}

          {estimateLoading ? (
            <p style={{ color: "var(--ui-text-muted)" }}>מחשב עלויות...</p>
          ) : estimate && (
            <div style={{ background: "var(--ui-surface-2)", borderRadius: "var(--ui-radius)", padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>סה"כ ביניים</span><span>{estimate.subtotal} ₪</span>
              </div>
              {parseFloat(estimate.discount) > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--ui-success)" }}>
                  <span>הנחה</span><span>−{estimate.discount} ₪</span>
                </div>
              )}
              {parseFloat(estimate.shipping_fee) > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>משלוח</span><span>{estimate.shipping_fee} ₪</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderTop: "1px solid var(--ui-border)", paddingTop: "0.375rem", marginTop: "0.25rem" }}>
                <span>סה"כ לתשלום</span><span>{estimate.total} ₪</span>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Button variant="secondary" onClick={() => setStep(2)}>חזור</Button>
            <Button variant="primary" onClick={() => setStep(4)} style={{ flex: 1 }}>המשך לתשלום</Button>
          </div>
        </div>
      )}

      {/* Step 4 — Payment */}
      {step === 4 && (
        <div className="checkout-panel">
          <h3>תשלום</h3>
          <RadioGroup
            name="payment_mode"
            label="אמצעי תשלום"
            value={form.payment_mode}
            onChange={(v) => patch({ payment_mode: v as PaymentMode })}
            options={[
              { value: "tranzila",  label: "כרטיס אשראי" },
              { value: "whatsapp", label: "WhatsApp" },
              { value: "cash",     label: "מזומן/העברה" },
            ]}
          />
          {estimate && (
            <p style={{ fontWeight: 700, fontSize: "1.125rem" }}>
              סה"כ לתשלום: {estimate.total} ₪
            </p>
          )}
          {submitError && <p style={{ color: "var(--ui-danger)" }}>{submitError}</p>}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Button variant="secondary" onClick={() => setStep(3)}>חזור</Button>
            <Button
              variant="primary"
              loading={submitting}
              disabled={!estimate}
              onClick={submit}
              style={{ flex: 1 }}
            >
              אישור הזמנה
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
