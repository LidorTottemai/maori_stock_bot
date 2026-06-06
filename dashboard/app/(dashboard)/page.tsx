"use client"

import useSWR from "swr"
import { format } from "date-fns"
import { he } from "date-fns/locale"
import { Building2, Clock, Loader2, Users, BarChart3 } from "lucide-react"
import StatsCard from "@/components/StatsCard"
import { api, type QueueItem } from "@/lib/api"

const fetcher = {
  stats: () => api.stats(),
  queue: () => api.queue(),
}

const PHASE_LABELS: Record<string, string> = {
  scraping: "סריקת אתר",
  researching: "מחקר מתחרים",
  generating: "גנרציה עם Claude",
  pushing: "העלאה ל-GitHub",
}

function StatusDot({ status }: { status: string }) {
  if (status === "done") {
    return <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
  }
  if (status === "failed") {
    return <span className="inline-block w-2 h-2 rounded-full bg-red-400" />
  }
  if (status === "queued") {
    return <span className="inline-block w-2 h-2 rounded-full bg-gray-500" />
  }
  return (
    <span className="inline-block w-2 h-2 rounded-full bg-h-fuchsia pulse-fuchsia" />
  )
}

function QueueRow({ item }: { item: QueueItem }) {
  const phaseLabel = item.current_phase
    ? (PHASE_LABELS[item.current_phase] ?? item.current_phase)
    : null

  return (
    <div className="flex items-center justify-between py-3 border-b border-h-border last:border-0">
      <div className="flex items-center gap-3">
        <StatusDot status={item.status} />
        <div>
          <p className="text-h-text text-sm font-medium">{item.lead_name}</p>
          {phaseLabel && (
            <p className="text-h-muted text-xs mt-0.5">{phaseLabel}</p>
          )}
        </div>
      </div>
      <div className="text-left">
        <p className="text-h-muted text-xs">
          {item.status === "in_progress" || item.status === "queued"
            ? `~${item.eta_minutes} דקות`
            : item.status === "done"
              ? "הושלם"
              : "נכשל"}
        </p>
        <p className="text-h-muted text-xs opacity-60">
          מיקום #{item.queue_position}
        </p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useSWR(
    "stats",
    fetcher.stats,
    { refreshInterval: 15000 }
  )
  const { data: queue, isLoading: queueLoading } = useSWR(
    "queue",
    fetcher.queue,
    { refreshInterval: 15000 }
  )

  const todayHebrew = format(new Date(), "EEEE, d בMMMM yyyy", { locale: he })

  const activeJobs = queue?.filter(
    (j) => j.status !== "queued" && j.status !== "done" && j.status !== "failed"
  )
  const activeJob = activeJobs?.[0] ?? null

  const recentQueue = queue
    ? [...queue]
        .sort(
          (a, b) =>
            new Date(b.queued_at).getTime() - new Date(a.queued_at).getTime()
        )
        .slice(0, 3)
    : []

  return (
    <div dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-h-text">דשבורד</h1>
        <p className="text-h-muted text-sm mt-1 capitalize">{todayHebrew}</p>
      </div>

      {/* Active build banner */}
      {activeJob && (
        <div className="mb-6 flex items-center gap-3 bg-h-card border border-h-fuchsia/30 rounded-xl px-5 py-3.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-h-fuchsia pulse-fuchsia flex-shrink-0" />
          <p className="text-h-text text-sm font-medium">
            בנייה פעילה עכשיו
            {activeJob.current_phase && (
              <span className="text-h-fuchsia mr-2">
                —{" "}
                {PHASE_LABELS[activeJob.current_phase] ??
                  activeJob.current_phase}
              </span>
            )}
          </p>
          <span className="mr-auto text-h-muted text-xs">{activeJob.lead_name}</span>
        </div>
      )}

      {/* Stats grid */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-h-card border border-h-border rounded-xl p-6 h-32 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="אתרים שנבנו"
            value={stats?.total_built ?? 0}
            icon={<Building2 size={18} />}
            color="#FF006E"
            subtitle={
              stats?.avg_build_minutes
                ? `ממוצע ${stats.avg_build_minutes} דק' לבנייה`
                : undefined
            }
          />
          <StatsCard
            title="בתור"
            value={stats?.total_queued ?? 0}
            icon={<Clock size={18} />}
            color="#8B5CF6"
            subtitle={
              stats?.next_eta_minutes != null
                ? `הבא בעוד ~${stats.next_eta_minutes} דק'`
                : undefined
            }
          />
          <StatsCard
            title="בתהליך"
            value={stats?.in_progress ?? 0}
            icon={<Loader2 size={18} />}
            color="#06B6D4"
          />
          <StatsCard
            title="לידים"
            value={stats?.total_leads ?? 0}
            icon={<Users size={18} />}
            color="#10B981"
            subtitle={
              stats?.total_outreach
                ? `${stats.total_outreach} בOutreach`
                : undefined
            }
          />
        </div>
      )}

      {/* Queue section */}
      <div className="bg-h-card border border-h-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h-text font-semibold text-base flex items-center gap-2">
            <BarChart3 size={16} className="text-h-fuchsia" />
            תור הבנייה
          </h2>
          <a
            href="/queue"
            className="text-h-fuchsia text-xs hover:text-h-fuchsia-dim transition-colors"
          >
            הצג הכל
          </a>
        </div>

        {queueLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-h-bg rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : recentQueue.length === 0 ? (
          <div className="text-center py-8">
            <Clock size={32} className="mx-auto text-h-border mb-2" />
            <p className="text-h-muted text-sm">התור ריק</p>
          </div>
        ) : (
          <div>
            {recentQueue.map((item) => (
              <QueueRow key={item.job_id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
