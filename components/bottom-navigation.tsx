"use client"

import { Home, TrendingUp, Target, History, Plus } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const NAV_ITEMS = [
  { icon: Home,       label: "Home",     href: "/" },
  { icon: History,    label: "Workouts", href: "/workouts" },
  { icon: TrendingUp, label: "Progress", href: "/progress" },
  { icon: Target,     label: "Goals",    href: "/goals" },
]

export function BottomNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const isActive = (href: string) => {
    if (!mounted) return false
    const p = pathname.replace(/\/$/, "") || "/"
    const h = href.replace(/\/$/, "") || "/"
    if (h === "/") return p === "/"
    return p === h || p.startsWith(h + "/")
  }

  if (!mounted) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border">
        <div className="flex items-center justify-around px-2 pt-3 pb-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="h-5 w-5 rounded bg-muted/20 animate-pulse" />
              <div className="h-2 w-8 rounded bg-muted/20 animate-pulse" />
            </div>
          ))}
        </div>
      </nav>
    )
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur border-t border-border">
      <div className="flex items-end justify-around px-2 pt-3 pb-6">
        {/* Left two nav items */}
        {NAV_ITEMS.slice(0, 2).map((item) => {
          const active = isActive(item.href)
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="flex flex-col items-center gap-1 min-w-[52px] transition-all duration-200"
            >
              <item.icon
                className={`h-5 w-5 transition-colors duration-200 ${active ? "text-primary" : "text-muted-foreground"}`}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span className={`text-[10px] font-medium transition-colors duration-200 ${active ? "text-primary" : "text-muted-foreground"}`}>
                {item.label}
              </span>
              <span className={`h-1 w-1 rounded-full transition-all duration-200 ${active ? "bg-primary" : "bg-transparent"}`} />
            </button>
          )
        })}

        {/* Center FAB — Log Workout */}
        <button
          onClick={() => router.push("/log-workout")}
          className="flex flex-col items-center -mt-5"
        >
          <div
            className="h-14 w-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/30 transition-transform duration-200 active:scale-95"
            style={{ backgroundColor: "hsl(80 100% 50%)" }}
          >
            <Plus className="h-7 w-7" style={{ color: "hsl(0 0% 6%)" }} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground mt-1">Log</span>
          <span className="h-1 w-1 rounded-full bg-transparent" />
        </button>

        {/* Right two nav items */}
        {NAV_ITEMS.slice(2).map((item) => {
          const active = isActive(item.href)
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="flex flex-col items-center gap-1 min-w-[52px] transition-all duration-200"
            >
              <item.icon
                className={`h-5 w-5 transition-colors duration-200 ${active ? "text-primary" : "text-muted-foreground"}`}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span className={`text-[10px] font-medium transition-colors duration-200 ${active ? "text-primary" : "text-muted-foreground"}`}>
                {item.label}
              </span>
              <span className={`h-1 w-1 rounded-full transition-all duration-200 ${active ? "bg-primary" : "bg-transparent"}`} />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
