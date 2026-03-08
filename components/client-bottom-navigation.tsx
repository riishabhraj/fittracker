"use client"

import { BottomNavigation } from "@/components/bottom-navigation"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

const HIDDEN_PATHS = ["/sign-in", "/onboarding", "/workout-complete"]

export function ClientBottomNavigation() {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => { setMounted(true) }, [])

  if (!mounted || HIDDEN_PATHS.includes(pathname)) return null

  return <BottomNavigation />
}

export function BottomNavPadding({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hidden = HIDDEN_PATHS.includes(pathname)
  return <div className={hidden ? "" : "pb-16"}>{children}</div>
}
