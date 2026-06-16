"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { fetchEstimate } from "../api/shopClient"
import type { CartItem, EstimateResult, OrderType } from "../types/shop"

const DEBOUNCE_MS = 500

export function useEstimate(
  items: CartItem[],
  orderType: OrderType,
  couponCode?: string | null,
) {
  const [estimate, setEstimate] = useState<EstimateResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const run = useCallback(() => {
    if (items.length === 0) {
      setEstimate(null)
      return
    }
    setLoading(true)
    setError(null)

    fetchEstimate(
      items.map((i) => ({
        product_id: i.product_id,
        variant_sku_id: i.variant_sku_id,
        quantity: i.quantity,
      })),
      couponCode,
      orderType,
    )
      .then((data) => {
        setEstimate(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err?.message ?? "שגיאה")
        setLoading(false)
      })
  }, [items, orderType, couponCode])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(run, DEBOUNCE_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [run])

  return { estimate, loading, error }
}
