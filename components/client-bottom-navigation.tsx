"use client"

import { BottomNavigation } from "@/components/bottom-navigation"
import { useEffect, useState } from "react"

export function ClientBottomNavigation() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <BottomNavigation />
}
