"use client"

import { Calendar, Plus, TrendingUp, Target } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function BottomNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  const navigationItems = [
    { icon: Calendar, label: "Home", href: "/" },
    { icon: Plus, label: "Log", href: "/log-workout" },
    { icon: TrendingUp, label: "Progress", href: "/progress" },
    { icon: Target, label: "Goals", href: "/goals" },
  ]

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  const isActive = (href: string) => {
    if (!mounted) return false
    
    // Normalize paths by removing trailing slashes
    const normalizedPathname = pathname.replace(/\/$/, '') || '/'
    const normalizedHref = href.replace(/\/$/, '') || '/'
    
    // Exact match for home page
    if (normalizedHref === '/') {
      return normalizedPathname === '/'
    }
    
    // For other pages, check if pathname starts with href
    return normalizedPathname === normalizedHref || normalizedPathname.startsWith(normalizedHref + '/')
  }

  // Show skeleton while mounting to prevent flash
  if (!mounted) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            {navigationItems.map((_, index) => (
              <div key={index} className="flex flex-col items-center py-2 px-3">
                <div className="h-5 w-5 bg-muted-foreground/20 rounded animate-pulse" />
                <div className="h-3 w-8 bg-muted-foreground/20 rounded mt-1 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {navigationItems.map((item, index) => {
            const active = isActive(item.href)
            return (
              <button
                key={index}
                onClick={() => handleNavigation(item.href)}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                  active
                    ? "text-primary bg-primary/10 scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/10 active:scale-95"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
