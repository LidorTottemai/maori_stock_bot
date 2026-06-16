"use client"

import React, { createContext, useCallback, useContext, useRef, useState } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem, Product } from "../types/shop"
import { computeItemUnitPrice } from "../utils/price"

// ---------------------------------------------------------------------------
// Zustand store (persisted to sessionStorage)
// ---------------------------------------------------------------------------

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "unit_price"> & { unit_price?: string }) => void
  removeItem: (product_id: string, variant_sku_id: string | null) => void
  updateQuantity: (product_id: string, variant_sku_id: string | null, quantity: number) => void
  clear: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],

      addItem: (newItem) =>
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.product_id === newItem.product_id &&
              i.variant_sku_id === newItem.variant_sku_id,
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product_id === newItem.product_id &&
                i.variant_sku_id === newItem.variant_sku_id
                  ? { ...i, quantity: i.quantity + (newItem.quantity ?? 1) }
                  : i,
              ),
            }
          }
          return {
            items: [
              ...state.items,
              {
                ...newItem,
                unit_price:
                  newItem.unit_price ??
                  computeItemUnitPrice(newItem.product, newItem.sku_selections),
              },
            ],
          }
        }),

      removeItem: (product_id, variant_sku_id) =>
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(i.product_id === product_id && i.variant_sku_id === variant_sku_id),
          ),
        })),

      updateQuantity: (product_id, variant_sku_id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter(
                  (i) =>
                    !(
                      i.product_id === product_id &&
                      i.variant_sku_id === variant_sku_id
                    ),
                )
              : state.items.map((i) =>
                  i.product_id === product_id &&
                  i.variant_sku_id === variant_sku_id
                    ? { ...i, quantity }
                    : i,
                ),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: "tottemai-cart",
      storage:
        typeof window !== "undefined"
          ? {
              getItem: (key) => {
                const v = sessionStorage.getItem(key)
                return v ? JSON.parse(v) : null
              },
              setItem: (key, value) =>
                sessionStorage.setItem(key, JSON.stringify(value)),
              removeItem: (key) => sessionStorage.removeItem(key),
            }
          : undefined,
    },
  ),
)

// ---------------------------------------------------------------------------
// Derived selectors
// ---------------------------------------------------------------------------

export function useCart() {
  const { items, addItem, removeItem, updateQuantity, clear } = useCartStore()

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items
    .reduce(
      (sum, i) => sum + parseFloat(i.unit_price) * i.quantity,
      0,
    )
    .toFixed(2)

  return { items, addItem, removeItem, updateQuantity, clear, itemCount, subtotal }
}

// ---------------------------------------------------------------------------
// CartProvider (wraps children — needed for sessionStorage hydration)
// ---------------------------------------------------------------------------

export function CartProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
