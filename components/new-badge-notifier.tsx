"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { getWorkouts, getWorkoutStats, computePersonalRecords } from "@/lib/workout-storage"
import { computeAchievements } from "@/lib/achievements"

const STORAGE_KEY = "fittracker_seen_badge_ids"

function getSeenIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch { return new Set() }
}

function markSeen(ids: string[]): void {
  try {
    const seen = getSeenIds()
    ids.forEach(id => seen.add(id))
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]))
  } catch {}
}

export function NewBadgeNotifier() {
  useEffect(() => {
    const check = async () => {
      try {
        const [workouts, stats] = await Promise.all([getWorkouts(), getWorkoutStats()])
        const prs = computePersonalRecords(workouts)
        const profile = await fetch("/api/profile").then(r => r.ok ? r.json() : null).catch(() => null)
        const results = computeAchievements({ workouts, stats, prs, profile })
        const unlockedIds = results.filter(a => a.unlocked).map(a => a.badge.id)

        const isFirstRun = !localStorage.getItem(STORAGE_KEY)
        if (isFirstRun) {
          markSeen(unlockedIds)
          return
        }

        const seenIds = getSeenIds()
        const newIds  = unlockedIds.filter(id => !seenIds.has(id))
        if (newIds.length === 0) return

        markSeen(newIds)
        newIds.forEach((id, i) => {
          const result = results.find(r => r.badge.id === id)!
          setTimeout(() => {
            toast.success(`${result.badge.emoji} Badge Unlocked: ${result.badge.name}`, {
              description: result.badge.description,
              duration: 5000,
            })
          }, i * 900)
        })
      } catch {}
    }

    check()
    window.addEventListener("workoutDataChanged", check)
    return () => window.removeEventListener("workoutDataChanged", check)
  }, [])

  return null
}
