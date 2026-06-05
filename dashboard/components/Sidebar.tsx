"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Globe,
  Clock,
  Search,
  Mail,
  LogOut,
} from "lucide-react"
import clsx from "clsx"

const NAV_LINKS = [
  { href: "/", label: "דשבורד", icon: LayoutDashboard },
  { href: "/sites", label: "אתרים שנבנו", icon: Globe },
  { href: "/queue", label: "תור בנייה", icon: Clock },
  { href: "/leads", label: "לידים", icon: Search },
  { href: "/outreach", label: "Outreach", icon: Mail },
]

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <aside
      className="flex flex-col h-screen bg-h-card border-l border-h-border"
      style={{ width: 240, minWidth: 240 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-h-border">
        <div
          className="flex items-center justify-center rounded-full text-h-fuchsia font-bold text-lg select-none"
          style={{
            width: 42,
            height: 42,
            background: "rgba(255,0,110,0.12)",
            border: "1.5px solid rgba(255,0,110,0.35)",
            flexShrink: 0,
          }}
        >
          HH
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-h-text font-semibold text-sm">
            Hipster Hippo
          </span>
          <span className="text-h-muted text-xs">Admin</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative",
                active
                  ? "text-h-fuchsia bg-[rgba(255,0,110,0.08)]"
                  : "text-h-muted hover:text-h-text hover:bg-white/5"
              )}
            >
              {/* Active left border indicator (appears on right in RTL but we want left visually) */}
              {active && (
                <span
                  className="absolute right-0 top-1 bottom-1 rounded-full bg-h-fuchsia"
                  style={{ width: 2 }}
                />
              )}
              <Icon
                size={17}
                className={clsx(
                  "transition-colors",
                  active
                    ? "text-h-fuchsia"
                    : "text-h-muted group-hover:text-h-text"
                )}
              />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-h-border">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-h-muted hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 w-full"
        >
          <LogOut size={17} />
          <span>יציאה</span>
        </button>
      </div>
    </aside>
  )
}
