const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

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

// ── Helpers ────────────────────────────────────────────────────────────────────

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

// ── API client ─────────────────────────────────────────────────────────────────

export const api = {
  stats: (): Promise<Stats> => fetchJson<Stats>("/api/stats"),

  sites: (page = 1): Promise<SitesPage> =>
    fetchJson<SitesPage>(`/api/sites?page=${page}&size=30`),

  queue: (): Promise<QueueItem[]> => fetchJson<QueueItem[]>("/api/queue"),

  leads: (params?: {
    page?: number
    min_score?: number
    has_booking?: boolean
  }): Promise<LeadsPage> => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set("page", String(params.page))
    if (params?.min_score !== undefined)
      qs.set("min_score", String(params.min_score))
    if (params?.has_booking !== undefined)
      qs.set("has_booking", String(params.has_booking))
    const query = qs.toString() ? `?${qs.toString()}` : ""
    return fetchJson<LeadsPage>(`/api/leads${query}`)
  },

  outreach: (): Promise<OutreachItem[]> =>
    fetchJson<OutreachItem[]>("/api/outreach"),

  queueRebuild: (placeId: string, fixPrompt?: string): Promise<Response> =>
    fetch(`${API_BASE}/api/queue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        place_id: placeId,
        fix_prompt: fixPrompt ?? null,
      }),
    }),

  approveMarketing: (placeId: string): Promise<Response> =>
    fetch(`${API_BASE}/api/sites/${placeId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }),

  deleteJob: (jobId: string): Promise<Response> =>
    fetch(`${API_BASE}/api/queue/${jobId}`, {
      method: "DELETE",
    }),
}
