"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Wrench } from "lucide-react"
import { api } from "@/lib/api"

interface FixPromptModalProps {
  businessName: string
  placeId: string
  onClose: () => void
  onSuccess: () => void
}

export default function FixPromptModal({
  businessName,
  placeId,
  onClose,
  onSuccess,
}: FixPromptModalProps) {
  const [fixPrompt, setFixPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.queueRebuild(placeId, fixPrompt.trim() || undefined)
      if (!res.ok) {
        throw new Error(`שגיאה: ${res.status} ${res.statusText}`)
      }
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "אירעה שגיאה בלתי צפויה")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-h-card border border-h-border rounded-2xl p-6 w-full max-w-lg shadow-2xl"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg"
                style={{ background: "rgba(255,0,110,0.12)", color: "#FF006E" }}
              >
                <Wrench size={15} />
              </div>
              <div>
                <h2 className="text-h-text font-semibold text-base">
                  תיקונים לאתר
                </h2>
                <p className="text-h-muted text-xs">{businessName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-h-muted hover:text-h-text transition-colors p-1 rounded-lg hover:bg-white/5"
            >
              <X size={18} />
            </button>
          </div>

          {/* Textarea */}
          <div className="mb-4">
            <label className="block text-h-muted text-xs font-medium mb-2">
              הוראות לתיקון (אופציונלי)
            </label>
            <textarea
              value={fixPrompt}
              onChange={(e) => setFixPrompt(e.target.value)}
              placeholder="תאר מה לשנות: צבעים, תוכן, סגנון..."
              rows={5}
              dir="rtl"
              className="w-full bg-h-card border border-h-border text-h-text focus:border-h-fuchsia focus:ring-1 focus:ring-h-fuchsia rounded-md px-3 py-2 text-sm resize-none outline-none transition-colors placeholder:text-h-muted/50"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-md text-sm font-medium text-h-muted hover:text-h-text hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              ביטול
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-h-fuchsia hover:bg-h-fuchsia-dim text-white font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  שולח...
                </>
              ) : (
                "הכנס לתור עם תיקונים"
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
