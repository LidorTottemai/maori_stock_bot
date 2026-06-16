"use client"

import React, { useState } from "react"
import { Button, Drawer } from "@tottemai/ui"
import type { Product, ProductVariantGroup, ProductVariantOption } from "../types/shop"
import { useCart } from "../context/CartContext"
import { computeItemUnitPrice } from "../utils/price"

interface Props {
  product: Product | null
  onClose: () => void
}

function resolveVariantSku(
  product: Product,
  sku_selections: Record<string, string>,
): { sku_id: string | null; unit_price: string } {
  const stockGroups = product.variant_groups?.filter((g) => g.affects_stock) ?? []
  const selectedOptionIds = new Set(
    stockGroups.map((g) => sku_selections[g.id]).filter(Boolean),
  )
  const basePrice = computeItemUnitPrice(product, sku_selections)

  if (selectedOptionIds.size === 0 || !product.variant_skus?.length) {
    return { sku_id: null, unit_price: basePrice }
  }

  const match = product.variant_skus.find(
    (s) =>
      s.option_ids.length === selectedOptionIds.size &&
      s.option_ids.every((id) => selectedOptionIds.has(id)),
  )
  if (!match) return { sku_id: null, unit_price: basePrice }

  const price = match.price_override ?? basePrice
  return { sku_id: match.id, unit_price: String(price) }
}

export function ProductVariantDrawer({ product, onClose }: Props) {
  const { addItem } = useCart()
  const [skuSelections, setSkuSelections] = useState<Record<string, string>>({})
  const [addonSelections, setAddonSelections] = useState<Record<string, string | string[]>>({})
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  if (!product) return null

  const stockGroups = product.variant_groups?.filter((g) => g.affects_stock) ?? []
  const addonGroups = product.variant_groups?.filter((g) => !g.affects_stock) ?? []

  const allRequiredSelected = stockGroups
    .filter((g) => g.selection_type === "single_required")
    .every((g) => skuSelections[g.id])

  const { sku_id: resolvedSkuId, unit_price: unitPrice } = resolveVariantSku(product, skuSelections)

  function handleSkuSelect(group: ProductVariantGroup, option: ProductVariantOption) {
    setSkuSelections((prev) => ({ ...prev, [group.id]: option.id }))
  }

  function handleAddonToggle(group: ProductVariantGroup, option: ProductVariantOption) {
    if (group.selection_type === "multi_optional") {
      setAddonSelections((prev) => {
        const current = (prev[group.id] as string[]) ?? []
        const next = current.includes(option.id)
          ? current.filter((id) => id !== option.id)
          : [...current, option.id]
        return { ...prev, [group.id]: next }
      })
    } else {
      setAddonSelections((prev) => ({
        ...prev,
        [group.id]: prev[group.id] === option.id ? "" : option.id,
      }))
    }
  }

  function handleAddToCart() {
    if (!product || !allRequiredSelected) return
    setAdding(true)
    addItem({
      product_id: product.id,
      product,
      variant_sku_id: resolvedSkuId,
      sku_selections: skuSelections,
      addon_selections: addonSelections,
      quantity,
      unit_price: unitPrice,
    })
    setAdding(false)
    onClose()
  }

  return (
    <Drawer open onClose={onClose} title={product.name}>
      {product.image_urls[0] && (
        <img
          src={product.image_urls[0]}
          alt={product.name}
          style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: "var(--ui-radius)" }}
        />
      )}

      {product.description && (
        <p style={{ color: "var(--ui-text-muted)", margin: 0 }}>{product.description}</p>
      )}

      <p style={{ fontWeight: 600, fontSize: "1.25rem", margin: 0 }}>
        {parseFloat(unitPrice).toFixed(2)} {product.currency}
      </p>

      {stockGroups.map((group) => (
        <div key={group.id}>
          <p style={{ fontWeight: 500, marginBottom: "0.5rem" }}>
            {group.name}
            {group.selection_type === "single_required" && " *"}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {group.options.map((opt) => (
              <Button
                key={opt.id}
                variant={skuSelections[group.id] === opt.id ? "primary" : "secondary"}
                size="sm"
                onClick={() => handleSkuSelect(group, opt)}
              >
                {opt.label}
                {parseFloat(opt.price_delta) !== 0 && (
                  <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                    {" "}({parseFloat(opt.price_delta) > 0 ? "+" : ""}
                    {parseFloat(opt.price_delta).toFixed(2)})
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>
      ))}

      {addonGroups.map((group) => (
        <div key={group.id}>
          <p style={{ fontWeight: 500, marginBottom: "0.5rem" }}>{group.name}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {group.options.map((opt) => {
              const selected =
                group.selection_type === "multi_optional"
                  ? ((addonSelections[group.id] as string[]) ?? []).includes(opt.id)
                  : addonSelections[group.id] === opt.id
              return (
                <Button
                  key={opt.id}
                  variant={selected ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => handleAddonToggle(group, opt)}
                >
                  {opt.label}
                </Button>
              )
            })}
          </div>
        </div>
      ))}

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <Button variant="ghost" size="sm" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</Button>
        <span style={{ fontWeight: 600, minWidth: "1.5rem", textAlign: "center" }}>{quantity}</span>
        <Button variant="ghost" size="sm" onClick={() => setQuantity((q) => q + 1)}>+</Button>
      </div>

      <Button
        variant="primary"
        loading={adding}
        disabled={!allRequiredSelected}
        onClick={handleAddToCart}
        style={{ width: "100%" }}
      >
        הוסף לעגלה
      </Button>
    </Drawer>
  )
}
