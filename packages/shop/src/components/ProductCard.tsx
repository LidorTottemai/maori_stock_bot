"use client"

import React from "react"
import { Badge, Card } from "@tottemai/ui"
import type { Product } from "../types/shop"

interface Props {
  product: Product
  onSelect: (product: Product) => void
}

export function ProductCard({ product, onSelect }: Props) {
  const hasVariants = product.variant_groups && product.variant_groups.length > 0
  const outOfStock = !product.allow_backorder && product.available_stock <= 0

  const price = `${parseFloat(product.price).toFixed(2)} ${product.currency}`
  const subtitle = product.compare_price
    ? `${price} · ${parseFloat(product.compare_price).toFixed(2)}`
    : price

  return (
    <Card
      image={product.image_urls[0]}
      imageAlt={product.name}
      title={product.name}
      subtitle={subtitle}
      badges={
        <>
          {outOfStock && <Badge variant="error">אזל מהמלאי</Badge>}
          {hasVariants && !outOfStock && <Badge variant="default">בחר אפשרויות</Badge>}
        </>
      }
      onClick={() => onSelect(product)}
      disabled={outOfStock}
    />
  )
}
