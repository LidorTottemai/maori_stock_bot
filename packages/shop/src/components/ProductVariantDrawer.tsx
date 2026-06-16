"use client"

import React, { useState } from "react"
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
    addItem({
      product_id: product.id,
      product,
      variant_sku_id: resolvedSkuId,
      sku_selections: skuSelections,
      addon_selections: addonSelections,
      quantity,
      unit_price: unitPrice,
    })
    onClose()
  }

  return (
    <div className="drawer-overlay" onClick={onClose} role="dialog" aria-modal>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <button className="drawer__close" onClick={onClose} aria-label="סגור">
          ✕
        </button>

        {product.image_urls[0] && (
          <img
            src={product.image_urls[0]}
            alt={product.name}
            style={{ width: "100%", maxHeight: 240, objectFit: "cover" }}
          />
        )}

        <div className="drawer__body">
          <h2>{product.name}</h2>
          {product.description && <p>{product.description}</p>}
          <p className="drawer__price">
            {parseFloat(unitPrice).toFixed(2)} {product.currency}
          </p>

          {stockGroups.map((group) => (
            <div key={group.id} className="variant-group">
              <p className="variant-group__label">
                {group.name}
                {group.selection_type === "single_required" && " *"}
              </p>
              <div className="variant-group__options">
                {group.options.map((opt) => (
                  <button
                    key={opt.id}
                    className={`variant-option${skuSelections[group.id] === opt.id ? " variant-option--selected" : ""}`}
                    onClick={() => handleSkuSelect(group, opt)}
                  >
                    {opt.label}
                    {parseFloat(opt.price_delta) !== 0 && (
                      <span>
                        {" "}
                        ({parseFloat(opt.price_delta) > 0 ? "+" : ""}
                        {parseFloat(opt.price_delta).toFixed(2)})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {addonGroups.map((group) => (
            <div key={group.id} className="variant-group">
              <p className="variant-group__label">{group.name}</p>
              <div className="variant-group__options">
                {group.options.map((opt) => {
                  const selected =
                    group.selection_type === "multi_optional"
                      ? ((addonSelections[group.id] as string[]) ?? []).includes(opt.id)
                      : addonSelections[group.id] === opt.id
                  return (
                    <button
                      key={opt.id}
                      className={`variant-option${selected ? " variant-option--selected" : ""}`}
                      onClick={() => handleAddonToggle(group, opt)}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          <div className="quantity-row">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity((q) => q + 1)}>+</button>
          </div>

          <button
            className="btn-primary"
            onClick={handleAddToCart}
            disabled={!allRequiredSelected}
          >
            הוסף לעגלה
          </button>
        </div>
      </div>
    </div>
  )
}
