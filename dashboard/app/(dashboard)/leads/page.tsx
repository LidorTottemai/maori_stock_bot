"use client"

import { useState } from "react"
import useSWR from "swr"
import { Search, ChevronLeft, ChevronRight, ExternalLink, Building2 } from "lucide-react"
import clsx from "clsx"
import { api, type Lead } from "@/lib/api"
import FixPromptModal from "@/components/FixPromptModal"

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 61
      ? "bg-green-500/10 text-green-400 border-green-500/20"
      : score >= 31
        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
        : "bg-red-500/10 text-red-400 border-red-500/20"

  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center min-w-[44px] px-2 py-0.5 rounded-full text-xs font-bold border",
        color
      )}
    >
      {score}
    </span>
  )
}

function BuildButton({ lead }: { lead: Lead }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-h-fuchsia/10 text-h-fuchsia hover:bg-h-fuchsia/20 border border-h-fuchsia/20 transition-colors whitespace-nowrap"
      >
        <Building2 size={12} />
        בנה אתר
      </button>
      {open && (
        <FixPromptModal
          businessName={lead.name}
          placeId={lead.place_id}
          onClose={() => setOpen(false)}
          onSuccess={() => setOpen(false)}
        />
      )}
    </>
  )
}

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showOnlyOpportunities, setShowOnlyOpportunities] = useState(false)
  const [page, setPage] = useState(1)

  const { data, isLoading } = useSWR(
    ["leads", page, showOnlyOpportunities],
    () =>
      api.leads({
        page,
        has_booking: showOnlyOpportunities ? false : undefined,
      }),
    { refreshInterval: 60000 }
  )

  const filtered =
    data?.items?.filter((lead) => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        lead.name.toLowerCase().includes(q) ||
        lead.city.toLowerCase().includes(q) ||
        lead.category.toLowerCase().includes(q)
      )
    }) ?? []

  const totalPages = data ? Math.ceil(data.total / data.size) : 1

  return (
    <div dir="rtl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-h-text flex items-center gap-2">
          <Search size={22} className="text-h-fuchsia" />
          לידים
        </h1>
        {data && (
          <p className="text-h-muted text-sm mt-1">
            {data.total} לידים בסך הכל
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-h-muted"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            placeholder="חפש לפי שם, עיר, קטגוריה..."
            dir="rtl"
            className="w-full bg-h-card border border-h-border text-h-text focus:border-h-fuchsia focus:ring-1 focus:ring-h-fuchsia rounded-md pr-9 pl-3 py-2 text-sm outline-none transition-colors placeholder:text-h-muted/50"
          />
        </div>

        {/* Opportunity toggle */}
        <button
          onClick={() => {
            setShowOnlyOpportunities((v) => !v)
            setPage(1)
          }}
          className={clsx(
            "px-4 py-2 rounded-md text-sm font-medium border transition-colors whitespace-nowrap",
            showOnlyOpportunities
              ? "bg-h-fuchsia/10 text-h-fuchsia border-h-fuchsia/30"
              : "bg-h-card text-h-muted border-h-border hover:text-h-text"
          )}
        >
          הזדמנויות (ללא מערכת הזמנות)
        </button>
      </div>

      {/* Table */}
      <div className="bg-h-card border border-h-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-h-bg rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Search size={40} className="mx-auto text-h-border mb-3" />
            <p className="text-h-muted">לא נמצאו לידים</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0d0d0d] text-right">
                  <th className="px-4 py-3 text-h-muted font-medium">שם</th>
                  <th className="px-4 py-3 text-h-muted font-medium">ניקוד</th>
                  <th className="px-4 py-3 text-h-muted font-medium hidden md:table-cell">עיר</th>
                  <th className="px-4 py-3 text-h-muted font-medium hidden lg:table-cell">קטגוריה</th>
                  <th className="px-4 py-3 text-h-muted font-medium hidden md:table-cell">אתר</th>
                  <th className="px-4 py-3 text-h-muted font-medium">פעולה</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead, idx) => (
                  <tr
                    key={lead.place_id}
                    className={clsx(
                      "border-t border-h-border hover:bg-white/5 transition-colors",
                      idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                    )}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-h-text font-medium">{lead.name}</p>
                        {lead.phone && (
                          <p className="text-h-muted text-xs mt-0.5">{lead.phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBadge score={lead.score} />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-h-muted">
                      {lead.city || "—"}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-h-muted">
                      {lead.category || "—"}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {lead.website ? (
                        <a
                          href={
                            lead.website.startsWith("http")
                              ? lead.website
                              : `https://${lead.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-h-fuchsia hover:text-h-fuchsia-dim text-xs transition-colors max-w-[140px] truncate"
                          title={lead.website}
                        >
                          <ExternalLink size={11} className="flex-shrink-0" />
                          <span className="truncate">{lead.website.replace(/^https?:\/\//, "")}</span>
                        </a>
                      ) : (
                        <span className="text-h-muted text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <BuildButton lead={lead} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm text-h-muted bg-h-card border border-h-border hover:text-h-text disabled:opacity-40 transition-colors"
          >
            <ChevronRight size={15} />
            הקודם
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 7) {
                pageNum = i + 1
              } else if (page <= 4) {
                pageNum = i + 1
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + i
              } else {
                pageNum = page - 3 + i
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={clsx(
                    "w-8 h-8 rounded-md text-sm font-medium transition-colors",
                    page === pageNum
                      ? "bg-h-fuchsia text-white"
                      : "text-h-muted hover:text-h-text hover:bg-white/5"
                  )}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm text-h-muted bg-h-card border border-h-border hover:text-h-text disabled:opacity-40 transition-colors"
          >
            הבא
            <ChevronLeft size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
