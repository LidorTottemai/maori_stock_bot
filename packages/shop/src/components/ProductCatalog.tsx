"use client"

import React, { useState } from "react"
import { Input, Spinner } from "@tottemai/ui"
import type { Product } from "../types/shop"
import { useProductList } from "../hooks/useProductList"
import { ProductCard } from "./ProductCard"
import { ProductVariantDrawer } from "./ProductVariantDrawer"
import { useCart } from "../context/CartContext"
import { computeItemUnitPrice } from "../utils/price"

interface Props {
  category_id?: string
  tag?: string
}

export function ProductCatalog({ category_id, tag }: Props) {
  const [search, setSearch] = useState("")
  const { products, loading, error } = useProductList({ category_id, tag, search })
  const [selected, setSelected] = useState<Product | null>(null)
  const { addItem } = useCart()

  function handleSelect(product: Product) {
    const hasVariants = product.variant_groups && product.variant_groups.length > 0
    if (hasVariants) {
      setSelected(product)
    } else {
      addItem({
        product_id: product.id,
        product,
        variant_sku_id: null,
        sku_selections: {},
        addon_selections: {},
        quantity: 1,
        unit_price: computeItemUnitPrice(product, {}),
      })
    }
  }

  return (
    <div className="catalog">
      <Input
        type="search"
        placeholder="חיפוש מוצרים..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <p style={{ color: "var(--ui-danger)", textAlign: "center" }}>שגיאה בטעינת מוצרים</p>
      ) : products.length === 0 ? (
        <p style={{ color: "var(--ui-text-muted)", textAlign: "center" }}>לא נמצאו מוצרים</p>
      ) : (
        <div className="catalog__grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onSelect={handleSelect} />
          ))}
        </div>
      )}

      <ProductVariantDrawer product={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
