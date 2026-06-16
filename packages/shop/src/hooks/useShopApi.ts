"use client"

import { useCallback, useState } from "react"
import { ShopApiError } from "../api/shopClient"

interface State<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useShopApi<T, Args extends unknown[]>(
  apiFn: (...args: Args) => Promise<T>,
): State<T> & { execute: (...args: Args) => Promise<T | null> } {
  const [state, setState] = useState<State<T>>({ data: null, loading: false, error: null })

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setState({ data: null, loading: true, error: null })
      try {
        const result = await apiFn(...args)
        setState({ data: result, loading: false, error: null })
        return result
      } catch (err) {
        const msg = err instanceof ShopApiError ? err.message : "שגיאה"
        setState({ data: null, loading: false, error: msg })
        return null
      }
    },
    [apiFn],
  )

  return { ...state, execute }
}
