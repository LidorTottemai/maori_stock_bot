"use client"

import useSWR from "swr"
import { format } from "date-fns"
import { he } from "date-fns/locale"
import { Clock, Trash2, RefreshCw } from "lucide-react"
import clsx from "clsx"
import { api, type QueueItem } from "@/lib/api"

const PHASES: Record<string, string> = {
  scraping: "סריקת אתר",
  researching: "מחקר מתחרים",
  generating: "גנרציה עם Claude",
  pushing: "העלאה ל-GitHub",
}

const PHASE_STEPS = [
  { key: "scraping", label: "סריקה" },
  { key: "researching", label: "מחקר" },
  { key: "generating", label: "גנרציה" },
  { key: "pushing", label: "העלאה" },
  { key: "done", label: "הושלם" },
]

function StatusBadge({ status, phase }: { status: string; phase: string | null }) {
  if (status === "done") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
        הושלם
      </span>
    )
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
        נכשל
      </span>
    )
  }
  if (status === "queued") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-500 inline-block" />
        בתור
      </span>
    )
  }
  // in_progress variants: scraping, researching, generating, pushing
  const phaseLabel = phase ? (PHASES[phase] ?? phase) : "בתהליך"
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-h-fuchsia/10 text-h-fuchsia border border-h-fuchsia/20">
      <span className="w-1.5 h-1.5 rounded-full bg-h-fuchsia inline-block pulse-fuchsia" />
      {phaseLabel}
    </span>
  )
}

function PhaseProgressBar({ currentPhase, status }: { currentPhase: string | null; status: string }) {
  const activeIndex = status === "done"
    ? PHASE_STEPS.length - 1
    : currentPhase
      ? PHASE_STEPS.findIndex((s) => s.key === currentPhase)
      : -1

  return (
    <div className="flex items-center gap-0 w-full">
      {PHASE_STEPS.map((step, idx) => {
        const isActive = idx === activeIndex
        const isDone = idx < activeIndex || status === "done"
        return (
          <div key={step.key} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={clsx(
                "w-full h-1.5 transition-all duration-500",
                idx === 0 ? "rounded-r-full" : "",
                idx === PHASE_STEPS.length - 1 ? "rounded-l-full" : "",
                isActive
                  ? "bg-h-fuchsia"
                  : isDone
                    ? "bg-h-fuchsia/50"
                    : "bg-h-border"
              )}
              style={isActive ? { boxShadow: "0 0 8px rgba(255,0,110,0.6)" } : {}}
            />
            <span
              className={clsx(
                "text-xs whitespace-nowrap",
                isActive
                  ? "text-h-fuchsia font-semibold"
                  : isDone
                    ? "text-h-fuchsia/60"
                    : "text-h-muted"
              )}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function QueuePage() {
  const { data: queue, isLoading, mutate } = useSWR("queue", api.queue, {
    refreshInterval: 15000,
  })

  const handleDelete = async (jobId: string) => {
    await api.deleteJob(jobId)
    mutate()
  }

  const activeJob = queue?.find(
    (j) => j.status !== "queued" && j.status !== "done" && j.status !== "failed"
  )

  return (
    <div dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-h-text flex items-center gap-2">
            <Clock size={22} className="text-h-fuchsia" />
            תור בנייה
          </h1>
          {queue && (
            <p className="text-h-muted text-sm mt-1">
              {queue.length} פריטים בתור
            </p>
          )}
        </div>
        <button
          onClick={() => mutate()}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-h-muted hover:text-h-text bg-h-card border border-h-border text-sm transition-colors"
        >
          <RefreshCw size={14} />
          רענן
        </button>
      </div>

      {/* Active phase progress */}
      {activeJob && (
        <div className="bg-h-card border border-h-fuchsia/30 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-h-text text-sm font-medium">
              בנייה פעילה: <span className="text-h-fuchsia">{activeJob.lead_name}</span>
            </p>
            <span className="text-h-muted text-xs">
              {activeJob.current_phase
                ? PHASES[activeJob.current_phase] ?? activeJob.current_phase
                : "מתחיל..."}
            </span>
          </div>
          <PhaseProgressBar
            currentPhase={activeJob.current_phase}
            status={activeJob.status}
          />
        </div>
      )}

      {/* Table */}
      <div className="bg-h-card border border-h-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-h-bg rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !queue || queue.length === 0 ? (
          <div className="text-center py-20">
            <Clock size={40} className="mx-auto text-h-border mb-3" />
            <p className="text-h-muted">התור ריק</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0d0d0d] text-right">
                  <th className="px-4 py-3 text-h-muted font-medium">שם עסק</th>
                  <th className="px-4 py-3 text-h-muted font-medium">סטטוס</th>
                  <th className="px-4 py-3 text-h-muted font-medium hidden md:table-cell">שלב</th>
                  <th className="px-4 py-3 text-h-muted font-medium hidden lg:table-cell">נכנס לתור</th>
                  <th className="px-4 py-3 text-h-muted font-medium">ETA</th>
                  <th className="px-4 py-3 text-h-muted font-medium">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((item, idx) => (
                  <tr
                    key={item.job_id}
                    className={clsx(
                      "border-t border-h-border hover:bg-white/5 transition-colors",
                      idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                    )}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-h-text font-medium">{item.lead_name}</p>
                        <p className="text-h-muted text-xs">{item.lead_website}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} phase={item.current_phase} />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-h-muted">
                      {item.current_phase
                        ? (PHASES[item.current_phase] ?? item.current_phase)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-h-muted text-xs">
                      {format(new Date(item.queued_at), "dd/MM/yy HH:mm", { locale: he })}
                    </td>
                    <td className="px-4 py-3 text-h-muted text-xs">
                      {item.status === "in_progress"
                        ? "בתהליך"
                        : item.status === "queued"
                          ? `~${item.eta_minutes} דקות`
                          : item.status === "done"
                            ? "הושלם"
                            : "נכשל"}
                    </td>
                    <td className="px-4 py-3">
                      {item.status === "queued" && (
                        <button
                          onClick={() => handleDelete(item.job_id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors"
                          title="הסר מהתור"
                        >
                          <Trash2 size={13} />
                          הסר
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
