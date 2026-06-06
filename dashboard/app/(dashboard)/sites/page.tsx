"use client"

import { useState } from "react"
import useSWR from "swr"
import { format } from "date-fns"
import { Globe, ExternalLink, CheckCircle, Wrench, LayoutGrid, Loader2 } from "lucide-react"
import clsx from "clsx"
import { api, type SiteItem } from "@/lib/api"
import FixPromptModal from "@/components/FixPromptModal"

type FilterMode = "all" | "pending" | "approved"

const FILTER_LABELS: { key: FilterMode; label: string }[] = [
  { key: "all", label: "הכל" },
  { key: "pending", label: "ממתינים לאישור" },
  { key: "approved", label: "מאושרים" },
]

function SiteCard({
  site,
  onRefresh,
}: {
  site: SiteItem
  onRefresh: () => void
}) {
  const [fixModal, setFixModal] = useState(false)
  const [approving, setApproving] = useState(false)

  const handleApprove = async () => {
    setApproving(true)
    try {
      await api.approveMarketing(site.lead_place_id)
      onRefresh()
    } finally {
      setApproving(false)
    }
  }

  const buildDate = site.finished_at
    ? format(new Date(site.finished_at), "dd/MM/yyyy")
    : null

  return (
    <>
      <div className="bg-h-card border border-h-border rounded-xl p-6 flex flex-col gap-4 hover:border-h-fuchsia/30 transition-colors">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-h-text font-semibold text-base leading-snug">
              {site.lead_name}
            </h3>
            {site.marketing_approved && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 flex-shrink-0">
                <CheckCircle size={11} />
                אושר לשיווק
              </span>
            )}
          </div>
          <p className="text-h-muted text-xs">
            {site.city}
            {site.category ? ` · ${site.category}` : ""}
          </p>
        </div>

        {/* Build date */}
        {buildDate && (
          <p className="text-h-muted text-xs">
            <span className="text-h-text/60">בניה הושלמה:</span> {buildDate}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-auto flex-wrap">
          <a
            href={site.vercel_url ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!site.vercel_url}
            tabIndex={!site.vercel_url ? -1 : undefined}
            className={clsx(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              site.vercel_url
                ? "bg-h-bg text-h-text hover:bg-white/10 border border-h-border"
                : "bg-h-bg text-h-muted border border-h-border opacity-40 cursor-not-allowed pointer-events-none"
            )}
          >
            <ExternalLink size={12} />
            אתר
          </a>

          <button
            onClick={() => setFixModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-h-bg text-h-text hover:bg-white/10 border border-h-border transition-colors"
          >
            <Wrench size={12} />
            תיקונים
          </button>

          {!site.marketing_approved && (
            <button
              onClick={handleApprove}
              disabled={approving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 transition-colors disabled:opacity-50"
            >
              {approving ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <CheckCircle size={12} />
              )}
              אשר
            </button>
          )}
        </div>
      </div>

      {fixModal && (
        <FixPromptModal
          businessName={site.lead_name}
          placeId={site.lead_place_id}
          onClose={() => setFixModal(false)}
          onSuccess={onRefresh}
        />
      )}
    </>
  )
}

export default function SitesPage() {
  const [filter, setFilter] = useState<FilterMode>("all")
  const [page, setPage] = useState(1)

  const { data, isLoading, mutate } = useSWR(
    ["sites", page],
    () => api.sites(page),
    { refreshInterval: 30000 }
  )

  const filtered =
    data?.items?.filter((site) => {
      if (filter === "approved") return site.marketing_approved
      if (filter === "pending") return !site.marketing_approved
      return true
    }) ?? []

  const totalPages = data ? Math.ceil(data.total / data.size) : 1

  return (
    <div dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-h-text flex items-center gap-2">
            <Globe size={22} className="text-h-fuchsia" />
            אתרים שנבנו
          </h1>
          {data && (
            <p className="text-h-muted text-sm mt-1">
              {data.total} אתרים בסך הכל
            </p>
          )}
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {FILTER_LABELS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={clsx(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
              filter === key
                ? "bg-h-fuchsia/10 text-h-fuchsia border-h-fuchsia/30"
                : "bg-h-card text-h-muted border-h-border hover:text-h-text hover:border-h-fuchsia/20"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-h-card border border-h-border rounded-xl p-6 h-48 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <LayoutGrid size={40} className="mx-auto text-h-border mb-3" />
          <p className="text-h-muted">אין אתרים להצגה</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((site) => (
            <SiteCard key={site.job_id} site={site} onRefresh={() => mutate()} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-md text-sm text-h-muted bg-h-card border border-h-border hover:text-h-text disabled:opacity-40 transition-colors"
          >
            הקודם
          </button>
          <span className="text-h-muted text-sm px-3">
            עמוד {page} מתוך {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-md text-sm text-h-muted bg-h-card border border-h-border hover:text-h-text disabled:opacity-40 transition-colors"
          >
            הבא
          </button>
        </div>
      )}
    </div>
  )
}
