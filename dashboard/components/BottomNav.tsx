"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Globe, Clock, Search, Mail } from "lucide-react"
import clsx from "clsx"

const NAV_LINKS = [
  { href: "/", label: "דשבורד", icon: LayoutDashboard },
  { href: "/sites", label: "אתרים", icon: Globe },
  { href: "/queue", label: "תור", icon: Clock },
  { href: "/leads", label: "לידים", icon: Search },
  { href: "/outreach", label: "Outreach", icon: Mail },
]

export default function BottomNav() {
  const pathname = usePathname()
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-h-card border-t border-h-border safe-area-pb">
      {NAV_LINKS.map(({ href, label, icon: Icon }) => {
        const active = isActive(href)
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex flex-col items-center justify-center flex-1 py-2.5 gap-1 text-[10px] font-medium transition-colors",
              active ? "text-h-fuchsia" : "text-h-muted"
            )}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
