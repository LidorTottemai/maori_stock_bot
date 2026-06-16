"use client"

import React from "react"
import useSWR from "swr"
import { BarChart3, TrendingUp, ShoppingCart, DollarSign, CreditCard } from "lucide-react"
import StatsCard from "@/components/StatsCard"
import { api, type ShopRevenuePoint } from "@/lib/api"

const PAYMENT_LABELS: Record<string, string> = {
  tranzila: "כרטיס אשראי", whatsapp: "WhatsApp", cash: "מזומן/העברה",
}

function RevenueChart({ data }: { data: ShopRevenuePoint[] }) {
  const maxRevenue = Math.max(...data.map((d) => parseFloat(d.revenue_net)), 1)
  const barW = 100 / data.length

  // Show every 7th label
  const labelEvery = Math.ceil(data.length / 6)

  return (
    <div className="bg-h-card border border-h-border rounded-xl p-5">
      <h2 className="text-h-text font-semibold text-sm mb-4 flex items-center gap-2">
        <TrendingUp size={15} className="text-h-fuchsia" />
        הכנסות לפי יום (30 ימים אחרונים)
      </h2>
      <svg viewBox={`0 0 ${data.length * 12} 80`} className="w-full overflow-visible" style={{ height: 120 }}>
        {data.map((d, i) => {
          const h = Math.max(1, (parseFloat(d.revenue_net) / maxRevenue) * 70)
          const x = i * 12 + 1
          return (
            <g key={d.date}>
              <rect
                x={x}
                y={80 - h}
                width={10}
                height={h}
                rx={2}
                fill={d.order_count > 0 ? "rgba(255,0,110,0.7)" : "rgba(255,255,255,0.05)"}
              />
              {i % labelEvery === 0 && (
                <text
                  x={x + 5}
                  y={80 + 10}
                  textAnchor="middle"
                  fontSize={6}
                  fill="rgba(255,255,255,0.3)"
                >
                  {d.date.slice(5)}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function ShopAnalyticsPage() {
  const { data: summary, isLoading: summaryLoading } = useSWR("shop-analytics-summary", api.shopAnalyticsSummary)
  const { data: revenue, isLoading: revenueLoading } = useSWR("shop-analytics-revenue", () => api.shopAnalyticsRevenue(30))
  const { data: topProducts, isLoading: topLoading } = useSWR("shop-analytics-top", api.shopTopProducts)

  return (
    <div dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-h-text flex items-center gap-2">
          <BarChart3 size={22} className="text-h-fuchsia" />
          אנליטיקה
        </h1>
      </div>

      {/* Summary stats */}
      {summaryLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-h-card border border-h-border rounded-xl h-28 animate-pulse" />
          ))}
        </div>
      ) : summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="סה״כ הזמנות"
            value={summary.total_orders}
            icon={<ShoppingCart size={18} />}
            color="#8B5CF6"
          />
          <StatsCard
            title="הזמנות ששולמו"
            value={summary.paid_orders}
            icon={<CreditCard size={18} />}
            color="#10B981"
          />
          <StatsCard
            title="הכנסה נטו (₪)"
            value={parseFloat(summary.revenue_net).toFixed(0)}
            icon={<DollarSign size={18} />}
            color="#FF006E"
          />
          <StatsCard
            title="AOV (₪)"
            value={parseFloat(summary.aov).toFixed(0)}
            icon={<TrendingUp size={18} />}
            color="#06B6D4"
            subtitle={summary.top_payment_mode ? PAYMENT_LABELS[summary.top_payment_mode] ?? summary.top_payment_mode : undefined}
          />
        </div>
      )}

      {/* Revenue chart */}
      <div className="mb-6">
        {revenueLoading ? (
          <div className="bg-h-card border border-h-border rounded-xl h-44 animate-pulse" />
        ) : revenue && revenue.length > 0 && (
          <RevenueChart data={revenue} />
        )}
      </div>

      {/* Top products */}
      <div className="bg-h-card border border-h-border rounded-xl p-5">
        <h2 className="text-h-text font-semibold text-sm mb-4 flex items-center gap-2">
          <BarChart3 size={15} className="text-h-fuchsia" />
          מוצרים מובילים
        </h2>
        {topLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-h-bg rounded-lg animate-pulse" />)}
          </div>
        ) : !topProducts?.length ? (
          <p className="text-h-muted text-sm text-center py-6">אין נתונים עדיין</p>
        ) : (
          <div className="space-y-2">
            {topProducts.map((p, i) => (
              <div key={p.product_name} className="flex items-center gap-3 py-2 border-b border-h-border last:border-0">
                <span className="text-h-muted text-xs w-5 text-center">{i + 1}</span>
                <span className="text-h-text text-sm flex-1 truncate">{p.product_name}</span>
                <span className="text-h-muted text-xs">×{p.total_qty}</span>
                <span className="text-h-fuchsia text-sm font-semibold">
                  ₪{parseFloat(p.total_revenue).toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
