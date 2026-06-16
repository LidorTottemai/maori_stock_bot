import type { Product } from "../types/shop"

export function computeItemUnitPrice(
  product: Product,
  sku_selections: Record<string, string>,
): string {
  let price = parseFloat(product.price)

  if (product.variant_groups) {
    for (const group of product.variant_groups) {
      if (!group.affects_price) continue
      const selectedOptionId = sku_selections[group.id]
      if (!selectedOptionId) continue
      const option = group.options.find((o) => o.id === selectedOptionId)
      if (option) {
        price += parseFloat(option.price_delta)
      }
    }
  }

  return price.toFixed(2)
}
