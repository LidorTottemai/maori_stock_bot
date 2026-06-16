// ── Types ──────────────────────────────────────────────────────────────────────

export interface Stats {
  total_built: number
  total_queued: number
  in_progress: number
  total_leads: number
  total_outreach: number
  avg_build_minutes: number
  next_eta_minutes: number | null
}

export interface SiteItem {
  job_id: string
  lead_place_id: string
  lead_name: string
  category: string
  city: string
  vercel_url: string | null
  repo_url: string | null
  finished_at: string | null
  marketing_approved: boolean
}

export interface SitesPage {
  items: SiteItem[]
  total: number
  page: number
  size: number
}

export interface QueueItem {
  job_id: string
  lead_name: string
  lead_website: string
  status: string
  current_phase: string | null
  queued_at: string
  started_at: string | null
  queue_position: number
  eta_minutes: number
}

export interface Lead {
  place_id: string
  name: string
  score: number
  city: string
  category: string
  website: string
  phone: string
  has_booking_system: boolean
  marketing_approved: boolean
}

export interface LeadsPage {
  items: Lead[]
  total: number
  page: number
  size: number
}

export interface OutreachItem {
  contact_id: string
  lead_name: string
  lead_email: string
  stage: string
  last_sent_at: string | null
  days_since_last: number | null
  opted_out: boolean
  city: string
  category: string
}

// ── Shop Types ─────────────────────────────────────────────────────────────────

export interface ShopOrder {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  order_status: string
  payment_status: string
  fulfillment_status: string
  order_type: string
  payment_mode: string
  total: string
  subtotal: string
  discount: string
  shipping_fee: string
  tracking_number: string | null
  notes: string | null
  created_at: string
  cancelled_at: string | null
  cancellation_reason: string | null
}

export interface ShopProduct {
  id: string
  name: string
  slug: string
  description: string | null
  price: string
  compare_price: string | null
  currency: string
  sku: string | null
  stock: number
  available_stock: number
  is_active: boolean
  deleted_at: string | null
  image_urls: string[]
  product_type: string
  track_inventory: boolean
  allow_backorder: boolean
  sort_order: number
  created_at: string
}

export interface ShopProductCreate {
  name: string
  slug: string
  price: number
  description?: string | null
  stock?: number
  is_active?: boolean
  product_type?: string
  currency?: string
  image_urls?: string[]
  tags?: string[]
  track_inventory?: boolean
  allow_backorder?: boolean
  requires_shipping?: boolean
  sort_order?: number
}

// ── Helpers ────────────────────────────────────────────────────────────────────

async function fetchJson<T>(path: string): Promise<T> {
  // path is like /api/v1/dashboard/stats → proxy to /api/proxy/dashboard/stats
  const proxyPath = path.replace("/api/v1/", "/api/proxy/")
  const res = await fetch(proxyPath)
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

async function fetchMutation<T>(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  const proxyPath = path.replace("/api/v1/", "/api/proxy/")
  const res = await fetch(proxyPath, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err?.detail ?? `API error ${res.status}`)
  }
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T
  }
  return res.json() as Promise<T>
}

// ── API client ─────────────────────────────────────────────────────────────────

export const api = {
  stats: (): Promise<Stats> =>
    fetchJson<Stats>("/api/v1/dashboard/stats"),

  sites: (page = 1): Promise<SitesPage> =>
    fetchJson<SitesPage>(`/api/v1/dashboard/sites?page=${page}&size=30`),

  queue: (): Promise<QueueItem[]> =>
    fetchJson<QueueItem[]>("/api/v1/dashboard/queue"),

  leads: (params?: { page?: number; min_score?: number }): Promise<LeadsPage> => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set("page", String(params.page))
    if (params?.min_score !== undefined)
      qs.set("min_score", String(params.min_score))
    const query = qs.toString() ? `?${qs.toString()}` : ""
    return fetchJson<LeadsPage>(`/api/v1/leads${query}`)
  },

  outreach: (): Promise<OutreachItem[]> =>
    fetchJson<OutreachItem[]>("/api/v1/dashboard/outreach"),

  queueRebuild: (placeId: string, fixPrompt?: string): Promise<Response> =>
    fetch(`/api/proxy/rebuild/queue/${placeId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fix_prompt: fixPrompt ?? null }),
    }),

  approveMarketing: (placeId: string): Promise<Response> =>
    fetch(`/api/proxy/leads/${placeId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }),

  deleteJob: (jobId: string): Promise<Response> =>
    fetch(`/api/proxy/rebuild/${jobId}`, {
      method: "DELETE",
    }),

  // ── Shop ───────────────────────────────────────────────────────────────────

  shopOrders: (params?: {
    order_status?: string
    fulfillment_status?: string
    payment_status?: string
    order_type?: string
  }): Promise<ShopOrder[]> => {
    const qs = new URLSearchParams()
    if (params?.order_status) qs.set("order_status", params.order_status)
    if (params?.fulfillment_status) qs.set("fulfillment_status", params.fulfillment_status)
    if (params?.payment_status) qs.set("payment_status", params.payment_status)
    if (params?.order_type) qs.set("order_type", params.order_type)
    const query = qs.toString() ? `?${qs.toString()}` : ""
    return fetchJson<ShopOrder[]>(`/api/v1/shop-orders/admin/${query}`)
  },

  shopUpdateFulfillment: (orderId: string, fulfillmentStatus: string): Promise<ShopOrder> =>
    fetchMutation<ShopOrder>(
      `/api/v1/shop-orders/${orderId}/fulfillment`,
      "PUT",
      { fulfillment_status: fulfillmentStatus },
    ),

  shopCancelOrder: (orderId: string, reason: string): Promise<unknown> =>
    fetchMutation<unknown>(
      `/api/v1/shop-orders/${orderId}/cancel`,
      "POST",
      { reason },
    ),

  shopProducts: (params?: { search?: string; is_active?: boolean }): Promise<ShopProduct[]> => {
    const qs = new URLSearchParams()
    if (params?.search) qs.set("search", params.search)
    if (params?.is_active !== undefined) qs.set("is_active", String(params.is_active))
    const query = qs.toString() ? `?${qs.toString()}` : ""
    return fetchJson<ShopProduct[]>(`/api/v1/products/admin/${query}`)
  },

  shopUpdateStock: (productId: string, stock: number): Promise<ShopProduct> =>
    fetchMutation<ShopProduct>(`/api/v1/products/${productId}/stock`, "PATCH", { stock }),

  shopToggleActive: (productId: string, isActive: boolean): Promise<ShopProduct> =>
    fetchMutation<ShopProduct>(`/api/v1/products/${productId}`, "PUT", { is_active: isActive }),

  shopDeleteProduct: (productId: string): Promise<void> =>
    fetchMutation<void>(`/api/v1/products/${productId}`, "DELETE"),

  shopCreateProduct: (body: ShopProductCreate): Promise<ShopProduct> =>
    fetchMutation<ShopProduct>(`/api/v1/products/`, "POST", body),
}
