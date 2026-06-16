export interface ProductVariantOption {
  id: string
  group_id: string
  label: string
  is_default: boolean
  sort_order: number
  price_delta: string
  sku_suffix: string | null
}

export interface ProductVariantGroup {
  id: string
  product_id: string
  name: string
  sort_order: number
  selection_type: "single_required" | "single_optional" | "multi_optional"
  affects_stock: boolean
  affects_price: boolean
  options: ProductVariantOption[]
}

export interface Product {
  id: string
  place_id: string
  slug: string
  name: string
  description: string | null
  price: string
  compare_price: string | null
  currency: string
  image_urls: string[]
  tags: string[]
  product_type: "physical" | "digital" | "service_voucher"
  track_inventory: boolean
  stock: number
  available_stock: number
  allow_backorder: boolean
  is_active: boolean
  sort_order: number
  variant_groups?: ProductVariantGroup[]
}

export interface CartItem {
  product_id: string
  product: Product
  variant_sku_id: string | null
  /** Selected option IDs for affects_stock=true groups */
  sku_selections: Record<string, string>
  /** Selected options for affects_stock=false (addon) groups */
  addon_selections: Record<string, string | string[]>
  quantity: number
  /** Server-computed unit price including variant delta */
  unit_price: string
}

export type OrderType = "delivery" | "pickup" | "digital"
export type PaymentMode = "tranzila" | "whatsapp" | "cash"

export interface ShippingAddress {
  street: string
  city: string
  zip?: string
}

export interface CheckoutForm {
  customer_name: string
  customer_email: string
  customer_phone: string
  order_type: OrderType
  payment_mode: PaymentMode
  shipping_address: ShippingAddress | null
  coupon_code: string | null
  notes: string | null
}

export interface EstimateResult {
  subtotal: string
  discount: string
  shipping_fee: string
  total: string
  coupon: { code: string; discount: string } | null
}

export interface OrderTracking {
  order_number: string
  order_status: string
  payment_status: string
  fulfillment_status: string
  order_type: OrderType
  tracking_number: string | null
  created_at: string
  items: {
    product_name: string
    quantity: number
    item_total: string
  }[]
}
