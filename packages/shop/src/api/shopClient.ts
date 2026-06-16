import type {
  CheckoutForm,
  EstimateResult,
  OrderTracking,
  Product,
} from "../types/shop"

const getApiUrl = () =>
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) || ""

async function request<T>(
  path: string,
  options: RequestInit = {},
  idempotencyKey?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey
  }

  const resp = await fetch(`${getApiUrl()}${path}`, { ...options, headers })

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}))
    throw new ShopApiError(resp.status, body?.detail ?? "Request failed")
  }
  return resp.json() as Promise<T>
}

export class ShopApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = "ShopApiError"
  }
}

// ---------------------------------------------------------------------------
// Public product API
// ---------------------------------------------------------------------------

export async function fetchProducts(params?: {
  category_id?: string
  tag?: string
  search?: string
  in_stock?: boolean
}): Promise<Product[]> {
  const qs = new URLSearchParams()
  if (params?.category_id) qs.set("category_id", params.category_id)
  if (params?.tag) qs.set("tag", params.tag)
  if (params?.search) qs.set("search", params.search)
  if (params?.in_stock !== undefined) qs.set("in_stock", String(params.in_stock))
  const query = qs.toString() ? `?${qs}` : ""
  return request<Product[]>(`/api/v1/products/${query}`)
}

export async function fetchProduct(slug: string): Promise<Product> {
  return request<Product>(`/api/v1/products/${slug}`)
}

// ---------------------------------------------------------------------------
// Estimate (server-authoritative total)
// ---------------------------------------------------------------------------

export async function fetchEstimate(
  items: { product_id: string; variant_sku_id?: string | null; quantity: number }[],
  coupon_code?: string | null,
  order_type = "delivery",
): Promise<EstimateResult> {
  return request<EstimateResult>("/api/v1/shop-orders/estimate", {
    method: "POST",
    body: JSON.stringify({ items, coupon_code, order_type }),
  })
}

// ---------------------------------------------------------------------------
// Validate coupon
// ---------------------------------------------------------------------------

export async function validateCoupon(
  code: string,
  subtotal: string,
): Promise<{ valid: boolean; discount: string; discount_type: string }> {
  return request("/api/v1/coupons/validate", {
    method: "POST",
    body: JSON.stringify({ code, subtotal, customer_email: "" }),
  })
}

// ---------------------------------------------------------------------------
// Create order
// ---------------------------------------------------------------------------

export async function createOrder(
  form: CheckoutForm,
  items: { product_id: string; variant_sku_id?: string | null; addon_selections?: Record<string, unknown>; quantity: number }[],
  idempotencyKey: string,
): Promise<{ id: string; order_number: string; public_tracking_token: string; total: string }> {
  return request(
    "/api/v1/shop-orders/",
    {
      method: "POST",
      body: JSON.stringify({ ...form, items }),
    },
    idempotencyKey,
  )
}

// ---------------------------------------------------------------------------
// Public order tracking
// ---------------------------------------------------------------------------

export async function fetchOrderTracking(token: string): Promise<OrderTracking> {
  return request<OrderTracking>(`/api/v1/shop-orders/track/${token}`)
}
