"use client"

import { useEffect } from "react"
import { cleanupStaleWorkoutSession } from "@/lib/workout-session-storage"

export function SessionCleanup() {
  useEffect(() => {
    // Clean up stale sessions on app startup
    cleanupStaleWorkoutSession()
  }, [])

  return null
}
