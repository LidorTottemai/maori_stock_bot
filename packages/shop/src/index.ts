// Context
export { CartProvider, useCart, useCartStore } from "./context/CartContext"

// Components
export { ProductCatalog } from "./components/ProductCatalog"
export { ProductCard } from "./components/ProductCard"
export { ProductVariantDrawer } from "./components/ProductVariantDrawer"
export { CartDrawer } from "./components/CartDrawer"
export { CheckoutWidget } from "./components/CheckoutWidget"
export { OrderTracking } from "./components/OrderTracking"

// Hooks
export { useProductList } from "./hooks/useProductList"
export { useEstimate } from "./hooks/useEstimate"
export { useShopApi } from "./hooks/useShopApi"

// API
export {
  fetchProducts,
  fetchProduct,
  fetchEstimate,
  validateCoupon,
  createOrder,
  fetchOrderTracking,
  ShopApiError,
} from "./api/shopClient"

// Types
export type {
  Product,
  ProductVariantGroup,
  ProductVariantOption,
  ProductVariantSku,
  CartItem,
  CheckoutForm,
  EstimateResult,
  OrderTracking as OrderTrackingData,
  OrderType,
  PaymentMode,
  ShippingAddress,
} from "./types/shop"

// Utils
export { computeItemUnitPrice } from "./utils/price"
