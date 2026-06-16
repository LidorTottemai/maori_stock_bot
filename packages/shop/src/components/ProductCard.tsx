"use client"

import React from "react"
import { Badge, Button } from "@tottemai/ui"
import type { Product } from "../types/shop"

interface Props {
  product: Product
  onSelect: (product: Product) => void
}

export function ProductCard({ product, onSelect }: Props) {
  const hasVariants = product.variant_groups && product.variant_groups.length > 0
  const outOfStock = !product.allow_backorder && product.available_stock <= 0

  return (
    <div
      style={{ opacity: outOfStock ? 0.6 : 1 }}
      onClick={() => !outOfStock && onSelect(product)}
      role="button"
      tabIndex={outOfStock ? -1 : 0}
      onKeyDown={(e) => e.key === "Enter" && !outOfStock && onSelect(product)}
      aria-disabled={outOfStock}
      className="product-card"
    >
      {product.image_urls[0] && (
        <img
          src={product.image_urls[0]}
          alt={product.name}
          style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover" }}
        />
      )}
      <div className="product-card__body">
        <p className="product-card__name">{product.name}</p>
        <div className="product-card__footer">
          <span className="product-card__price">
            {parseFloat(product.price).toFixed(2)} {product.currency}
          </span>
          {product.compare_price && (
            <span className="product-card__compare-price">
              {parseFloat(product.compare_price).toFixed(2)}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.375rem", marginTop: "0.5rem" }}>
          {outOfStock && <Badge variant="error">אזל מהמלאי</Badge>}
          {hasVariants && !outOfStock && <Badge variant="default">בחר אפשרויות</Badge>}
        </div>
      </div>
    </div>
  )
}
