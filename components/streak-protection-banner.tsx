"use client"

import { useEffect, useState } from "react"
import { Flame, X } from "lucide-react"
import { getWorkouts, getWorkoutStats } from "@/lib/workout-storage"
import { useSubscription } from "@/hooks/use-subscription"
import { UpgradeModal } from "@/components/upgrade-modal"
import Link from "next/link"

const DISMISSED_KEY = "fittracker_streak_banner_dismissed"

export function StreakProtectionBanner() {
  const [streak, setStreak] = useState(0)
  const [workedOutToday, setWorkedOutToday] = useState(true)
  const [dismissed, setDismissed] = useState(true) // start hidden, show after check
  const [showUpgrade, setShowUpgrade] = useState(false)
  const { isPro } = useSubscription()

  useEffect(() => {
    const alreadyDismissed = sessionStorage.getItem(DISMISSED_KEY)
    if (alreadyDismissed) return

    const load = async () => {
      try {
        const [stats, workouts] = await Promise.all([getWorkoutStats(), getWorkouts()])
        if (stats.currentStreak < 1) return

        const today = new Date().toDateString()
        const hasWorkoutToday = workouts.some(
          (w) => new Date(w.date).toDateString() === today
        )
        if (hasWorkoutToday) return

        setStreak(stats.currentStreak)
        setWorkedOutToday(false)
        setDismissed(false)
      } catch {}
    }
    load()
  }, [])

  function dismiss() {
    sessionStorage.setItem(DISMISSED_KEY, "1")
    setDismissed(true)
  }

  if (dismissed || workedOutToday) return null

  return (
    <>
      <div
        className="rounded-2xl p-4 flex items-center gap-3"
        style={{ backgroundColor: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: "rgba(249,115,22,0.15)" }}
        >
          <Flame className="h-5 w-5" style={{ color: "#f97316" }} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {streak}-day streak at risk 🔥
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isPro ? (
              <>Log a workout today to keep it alive.</>
            ) : (
              <button
                type="button"
                onClick={() => setShowUpgrade(true)}
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Pro members get streak reminders & insights →
              </button>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/log-workout">
            <button
              type="button"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-transform active:scale-95"
              style={{ backgroundColor: "#f97316", color: "#fff" }}
            >
              Log now
            </button>
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        reason={`You're on a ${streak}-day streak 🔥 Don't lose momentum — upgrade to Pro and keep training at your best.`}
      />
    </>
  )
}
