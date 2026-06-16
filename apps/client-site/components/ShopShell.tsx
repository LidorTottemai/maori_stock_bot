"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { ShoppingCart } from "lucide-react"
import { useCart, CartDrawer, CheckoutWidget } from "@tottemai/shop"

export function ShopShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { itemCount } = useCart()
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  function handleCheckout() {
    setCartOpen(false)
    setCheckoutOpen(true)
  }

  function handleCheckoutSuccess(_orderNumber: string, trackingToken: string) {
    setCheckoutOpen(false)
    router.push(`/track/${trackingToken}`)
  }

  function handleCheckoutCancel() {
    setCheckoutOpen(false)
    setCartOpen(true)
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-lg font-bold text-brand">החנות שלנו</span>

          <button
            onClick={() => setCartOpen(true)}
            aria-label="פתח עגלת קניות"
            className="relative p-2 rounded-lg hover:bg-brand-light transition-colors"
          >
            <ShoppingCart className="w-6 h-6 text-brand" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 flex items-center justify-center rounded-full bg-brand text-white text-xs font-bold px-1">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>

      {/* Cart drawer */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
      />

      {/* Checkout overlay */}
      {checkoutOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto py-8 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCheckoutCancel()
          }}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <CheckoutWidget
              onSuccess={handleCheckoutSuccess}
              onCancel={handleCheckoutCancel}
            />
          </div>
        </div>
      )}
    </>
  )
}
