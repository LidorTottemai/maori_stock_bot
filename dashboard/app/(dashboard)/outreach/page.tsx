"use client"

import useSWR from "swr"
import { format } from "date-fns"
import { he } from "date-fns/locale"
import { Mail, RefreshCw, AlertTriangle } from "lucide-react"
import clsx from "clsx"
import { api, type OutreachItem } from "@/lib/api"

const STAGE_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  pending: {
    label: "ממתין",
    className: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  },
  initial: {
    label: "ראשוני",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  reminder: {
    label: "תזכורת",
    className: "bg-green-500/10 text-green-400 border-green-500/20",
  },
  discount: {
    label: "הנחה",
    className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  },
  final: {
    label: "סופי",
    className: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  recycled: {
    label: "ממוחזר",
    className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
}

function StageBadge({ stage }: { stage: string }) {
  const config = STAGE_CONFIG[stage] ?? {
    label: stage,
    className: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  }
  const isFinal = stage === "final"

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className
      )}
    >
      {isFinal && <span>⏰</span>}
      {config.label}
    </span>
  )
}

function DaysSinceCell({ days }: { days: number | null }) {
  if (days === null) return <span className="text-h-muted">—</span>

  return (
    <span
      className={clsx(
        "text-sm font-medium",
        days > 14 ? "text-red-400" : "text-h-text"
      )}
    >
      {days > 14 && (
        <AlertTriangle size={12} className="inline ml-1 mb-0.5" />
      )}
      {days} ימים
    </span>
  )
}

function OutreachRow({
  item,
  idx,
}: {
  item: OutreachItem
  idx: number
}) {
  const formattedDate = item.last_sent_at
    ? format(new Date(item.last_sent_at), "dd/MM/yy", { locale: he })
    : null

  return (
    <tr
      className={clsx(
        "border-t border-h-border hover:bg-white/5 transition-colors",
        idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]",
        item.opted_out && "opacity-50"
      )}
    >
      <td className="px-4 py-3">
        <div
          className={clsx(
            item.opted_out && "line-through text-h-muted"
          )}
        >
          <p className="text-h-text font-medium text-sm">{item.lead_name}</p>
          <p className="text-h-muted text-xs mt-0.5">
            {item.city}
            {item.category ? ` · ${item.category}` : ""}
          </p>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={clsx(
            "text-xs text-h-muted",
            item.opted_out && "line-through"
          )}
        >
          {item.lead_email || "—"}
        </span>
      </td>
      <td className="px-4 py-3">
        <StageBadge stage={item.stage} />
      </td>
      <td className="px-4 py-3 text-h-muted text-xs hidden md:table-cell">
        {formattedDate ?? "—"}
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <DaysSinceCell days={item.days_since_last} />
      </td>
      <td className="px-4 py-3">
        {item.opted_out ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-500/10 text-gray-500 border border-gray-500/20">
            הוסר
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20">
            פעיל
          </span>
        )}
      </td>
    </tr>
  )
}

export default function OutreachPage() {
  const { data: outreach, isLoading, mutate } = useSWR(
    "outreach",
    api.outreach,
    { refreshInterval: 60000 }
  )

  const activeCount = outreach?.filter((o) => !o.opted_out).length ?? 0
  const optedOutCount = outreach?.filter((o) => o.opted_out).length ?? 0
  const urgentCount =
    outreach?.filter(
      (o) => !o.opted_out && o.days_since_last !== null && o.days_since_last > 14
    ).length ?? 0

  return (
    <div dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-h-text flex items-center gap-2">
            <Mail size={22} className="text-h-fuchsia" />
            Outreach
          </h1>
          {outreach && (
            <p className="text-h-muted text-sm mt-1">
              {outreach.length} איש קשר בסך הכל
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

      {/* Summary chips */}
      {outreach && (
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-h-card border border-h-border">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-h-text text-sm font-medium">{activeCount}</span>
            <span className="text-h-muted text-sm">פעילים</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-h-card border border-h-border">
            <span className="w-2 h-2 rounded-full bg-gray-500" />
            <span className="text-h-text text-sm font-medium">{optedOutCount}</span>
            <span className="text-h-muted text-sm">הוסרו</span>
          </div>
          {urgentCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertTriangle size={14} className="text-red-400" />
              <span className="text-red-400 text-sm font-medium">{urgentCount}</span>
              <span className="text-red-400/70 text-sm">דורשים מעקב</span>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-h-card border border-h-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-h-bg rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !outreach || outreach.length === 0 ? (
          <div className="text-center py-20">
            <Mail size={40} className="mx-auto text-h-border mb-3" />
            <p className="text-h-muted">אין נתוני outreach</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0d0d0d] text-right">
                  <th className="px-4 py-3 text-h-muted font-medium">שם</th>
                  <th className="px-4 py-3 text-h-muted font-medium">מייל</th>
                  <th className="px-4 py-3 text-h-muted font-medium">שלב</th>
                  <th className="px-4 py-3 text-h-muted font-medium hidden md:table-cell">
                    נשלח לאחרונה
                  </th>
                  <th className="px-4 py-3 text-h-muted font-medium hidden md:table-cell">
                    ימים מאז
                  </th>
                  <th className="px-4 py-3 text-h-muted font-medium">סטטוס</th>
                </tr>
              </thead>
              <tbody>
                {outreach.map((item, idx) => (
                  <OutreachRow key={item.contact_id} item={item} idx={idx} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
