"use client"

import React, { useState } from "react"
import useSWR from "swr"
import { UserCog, Plus, X } from "lucide-react"
import { api, type ShopStaff } from "@/lib/api"

const ROLES = ["owner", "admin", "manager", "cashier", "viewer"] as const
const ROLE_LABELS: Record<string, string> = {
  owner: "בעלים",
  admin: "מנהל",
  manager: "מנג׳ר",
  cashier: "קופאי",
  viewer: "צופה",
}
const ROLE_COLORS: Record<string, string> = {
  owner: "bg-h-fuchsia/20 text-h-fuchsia",
  admin: "bg-purple-500/20 text-purple-400",
  manager: "bg-blue-500/20 text-blue-400",
  cashier: "bg-green-500/20 text-green-400",
  viewer: "bg-gray-500/20 text-gray-400",
}

function InviteModal({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<string>("manager")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ token: string; expires_at: string } | null>(null)
  const [error, setError] = useState("")

  const send = async () => {
    if (!email.trim()) { setError("מייל חובה"); return }
    setLoading(true)
    setError("")
    try {
      const res = await api.shopInviteStaff(email.trim(), role)
      setResult(res)
      onSent()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "שגיאה")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-h-card border border-h-border rounded-2xl w-96 shadow-2xl p-6" dir="rtl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-h-text font-semibold">הזמן איש צוות</h2>
          <button onClick={onClose} className="text-h-muted hover:text-h-text"><X size={16} /></button>
        </div>

        {result ? (
          <div className="space-y-3">
            <p className="text-green-400 text-sm font-medium">ההזמנה נוצרה בהצלחה!</p>
            <div>
              <label className="text-h-muted text-xs block mb-1">טוקן הזמנה (שתף עם המוזמן)</label>
              <div className="bg-h-bg border border-h-border rounded-lg px-3 py-2 text-h-text text-xs font-mono break-all select-all">
                {result.token}
              </div>
            </div>
            <p className="text-h-muted text-xs">פג תוקף: {result.expires_at.slice(0, 16).replace("T", " ")}</p>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-h-fuchsia text-white rounded-lg font-medium text-sm"
            >
              סגור
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-h-muted text-xs block mb-1">כתובת מייל</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@example.com"
                className="w-full bg-h-bg border border-h-border rounded-lg px-3 py-2 text-h-text text-sm focus:outline-none focus:border-h-fuchsia"
              />
            </div>
            <div>
              <label className="text-h-muted text-xs block mb-1">תפקיד</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-h-bg border border-h-border rounded-lg px-3 py-2 text-h-text text-sm focus:outline-none focus:border-h-fuchsia"
              >
                {ROLES.filter((r) => r !== "owner").map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              onClick={send}
              disabled={loading}
              className="w-full py-2.5 bg-h-fuchsia text-white rounded-lg font-medium text-sm disabled:opacity-50"
            >
              {loading ? "שולח…" : "צור הזמנה"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function StaffPage() {
  const { data: staff, isLoading, mutate } = useSWR("shop-staff", api.shopStaff)
  const [showInvite, setShowInvite] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const changeRole = async (member: ShopStaff, newRole: string) => {
    setUpdatingId(member.id)
    try {
      await api.shopUpdateRole(member.id, newRole)
      mutate()
    } finally {
      setUpdatingId(null)
    }
  }

  const disable = async (member: ShopStaff) => {
    if (!confirm(`להשבית את ${member.name}?`)) return
    setUpdatingId(member.id)
    try {
      await api.shopDisableStaff(member.id)
      mutate()
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div dir="rtl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-h-text flex items-center gap-2">
          <UserCog size={22} className="text-h-fuchsia" />
          צוות
        </h1>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2 bg-h-fuchsia text-white rounded-xl text-sm font-medium"
        >
          <Plus size={15} />
          הזמן צוות
        </button>
      </div>

      <div className="bg-h-card border border-h-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="space-y-0">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 border-b border-h-border animate-pulse last:border-0" />
            ))}
          </div>
        ) : !staff?.length ? (
          <p className="text-h-muted text-sm text-center py-10">אין אנשי צוות</p>
        ) : (
          <>
            {/* Header */}
            <div className="grid grid-cols-[1fr_130px_100px_80px_80px] gap-3 px-4 py-2 text-h-muted text-xs border-b border-h-border">
              <span>שם / מייל</span>
              <span>תפקיד</span>
              <span>כניסה אחרונה</span>
              <span>סטטוס</span>
              <span />
            </div>
            {staff.map((m) => (
              <div
                key={m.id}
                className={`grid grid-cols-[1fr_130px_100px_80px_80px] gap-3 items-center px-4 py-3 border-b border-h-border last:border-0 transition-opacity ${
                  !m.is_active ? "opacity-40" : ""
                }`}
              >
                <div>
                  <div className="text-h-text text-sm font-medium">{m.name}</div>
                  <div className="text-h-muted text-xs">{m.email}</div>
                </div>

                {/* Role selector */}
                <select
                  value={m.role}
                  disabled={!m.is_active || updatingId === m.id}
                  onChange={(e) => changeRole(m, e.target.value)}
                  className={`bg-h-bg border border-h-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-h-fuchsia disabled:opacity-50 ${
                    ROLE_COLORS[m.role] ?? ""
                  }`}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>

                <span className="text-h-muted text-xs">
                  {m.last_login ? m.last_login.slice(0, 10) : "מעולם"}
                </span>

                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  m.is_active
                    ? "bg-green-500/15 text-green-400"
                    : "bg-red-500/15 text-red-400"
                }`}>
                  {m.is_active ? "פעיל" : "מושבת"}
                </span>

                <div className="flex justify-end">
                  {m.is_active && (
                    <button
                      onClick={() => disable(m)}
                      disabled={updatingId === m.id}
                      className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-500/10 disabled:opacity-50"
                    >
                      השבת
                    </button>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onSent={() => mutate()}
        />
      )}
    </div>
  )
}
