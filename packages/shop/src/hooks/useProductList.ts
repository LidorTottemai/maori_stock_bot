"use client"

import { useEffect, useState } from "react"
import { fetchProducts } from "../api/shopClient"
import type { Product } from "../types/shop"

interface Params {
  category_id?: string
  tag?: string
  search?: string
}

export function useProductList(params?: Params) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { category_id, tag, search } = params ?? {}

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchProducts({ category_id, tag, search })
      .then((data) => {
        if (!cancelled) {
          setProducts(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message ?? "שגיאה")
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [category_id, tag, search])

  return { products, loading, error }
}
