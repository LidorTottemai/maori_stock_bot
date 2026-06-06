"use client"

import { useState, FormEvent } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("שם משתמש או סיסמה שגויים")
      } else if (result?.ok) {
        router.push("/")
        router.refresh()
      } else {
        setError("אירעה שגיאה. נסה שוב.")
      }
    } catch {
      setError("אירעה שגיאה. נסה שוב.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-h-bg flex flex-col items-center justify-center p-4"
      dir="rtl"
    >
      {/* Center card */}
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="flex items-center justify-center rounded-full text-h-fuchsia font-bold text-2xl mb-4 select-none"
            style={{
              width: 72,
              height: 72,
              background: "rgba(255,0,110,0.12)",
              border: "2px solid rgba(255,0,110,0.35)",
              boxShadow: "0 0 40px rgba(255,0,110,0.15)",
            }}
          >
            HH
          </div>
          <h1 className="text-white text-2xl font-bold">Hipster Hippo</h1>
          <p className="text-h-muted text-sm mt-1">מערכת ניהול</p>
        </div>

        {/* Form card */}
        <div className="bg-h-card border border-h-border rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-h-muted text-xs font-medium mb-1.5"
              >
                שם משתמש
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                required
                dir="ltr"
                className="w-full bg-h-card border border-h-border text-h-text focus:border-h-fuchsia focus:ring-1 focus:ring-h-fuchsia rounded-md px-3 py-2 text-sm outline-none transition-colors placeholder:text-h-muted/40"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-h-muted text-xs font-medium mb-1.5"
              >
                סיסמה
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  dir="ltr"
                  className="w-full bg-h-card border border-h-border text-h-text focus:border-h-fuchsia focus:ring-1 focus:ring-h-fuchsia rounded-md px-3 py-2 pl-10 text-sm outline-none transition-colors placeholder:text-h-muted/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-h-muted hover:text-h-text transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full bg-h-fuchsia hover:bg-h-fuchsia-dim text-white font-medium px-4 py-2.5 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  מתחבר...
                </>
              ) : (
                "LOGIN"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <p className="text-h-muted text-xs mt-8">
        &copy; 2026 Hipster Hippo
      </p>
    </div>
  )
}
