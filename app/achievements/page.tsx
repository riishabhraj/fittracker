"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getWorkouts, getWorkoutStats, computePersonalRecords } from "@/lib/workout-storage"
import { computeAchievements, formatProgress, type AchievementResult } from "@/lib/achievements"

function formatRelativeDate(iso?: string): string {
  if (!iso) return ""
  const date = new Date(iso)
  const now  = new Date()
  const diff = Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return "Today"
  if (diff === 1) return "Yesterday"
  if (diff < 30)  return `${diff}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// Trophy shelf (unlocked)

function TrophyShelf({ items }: { items: AchievementResult[] }) {
  return (
    <section>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
        Earned Badges
      </p>
      <div className="grid grid-cols-3 gap-3">
        {items.map(({ badge, unlockedAt }) => (
          <div
            key={badge.id}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all"
            style={{
              backgroundColor: "hsl(80 100% 50% / 0.08)",
              borderColor: "hsl(80 100% 50% / 0.3)",
              boxShadow: "0 0 14px hsl(80 100% 50% / 0.1)",
            }}
          >
            <span className="text-2xl leading-none">{badge.emoji}</span>
            <p className="text-[11px] font-semibold text-foreground text-center leading-tight">
              {badge.name}
            </p>
            {unlockedAt && (
              <p className="text-[9px] text-muted-foreground">{formatRelativeDate(unlockedAt)}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

// In-progress cards

function InProgressSection({ items }: { items: AchievementResult[] }) {
  return (
    <section>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
        In Progress
      </p>
      <div className="space-y-3">
        {items.map(({ badge, progress, total }) => {
          const pct = Math.min(100, Math.round((progress / total) * 100))
          return (
            <div key={badge.id} className="rounded-2xl bg-card border border-border p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl shrink-0">{badge.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{badge.name}</p>
                  <p className="text-xs text-muted-foreground leading-snug">{badge.description}</p>
                </div>
                <span className="text-xs font-bold shrink-0" style={{ color: "hsl(80 100% 50%)" }}>
                  {pct}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
                <div
                  className="h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: "hsl(80 100% 50%)" }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                {formatProgress(badge.id, progress, total)}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// Locked grid

function LockedSection({ items }: { items: AchievementResult[] }) {
  return (
    <section>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
        Locked
      </p>
      <div className="grid grid-cols-3 gap-3">
        {items.map(({ badge }) => (
          <div
            key={badge.id}
            className="relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-border bg-card opacity-35"
          >
            <span className="text-2xl leading-none grayscale">{badge.emoji}</span>
            <p className="text-[11px] font-medium text-muted-foreground text-center leading-tight">
              {badge.name}
            </p>
            <div className="absolute top-1.5 right-1.5">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" className="text-muted-foreground">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// Loading skeleton

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-24 rounded-2xl bg-card" />
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-card" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-card" />
        ))}
      </div>
    </div>
  )
}

// Page

export default function AchievementsPage() {
  const router = useRouter()
  const [achievements, setAchievements] = useState<AchievementResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [workouts, stats, profileRes] = await Promise.all([
          getWorkouts().catch(() => []),
          getWorkoutStats().catch(() => ({ totalWorkouts: 0, currentStreak: 0, totalWeight: 0 })),
          fetch("/api/profile").then(r => r.ok ? r.json() : null).catch(() => null),
        ])
        const prs = computePersonalRecords(workouts)
        setAchievements(computeAchievements({ workouts, stats, prs, profile: profileRes }))
      } finally {
        setLoading(false)
      }
    }
    load()
    window.addEventListener("workoutDataChanged", load)
    return () => window.removeEventListener("workoutDataChanged", load)
  }, [])

  const unlockedItems  = achievements.filter(a => a.unlocked)
  const lockedItems    = achievements.filter(a => !a.unlocked)
  const unlockedCount  = unlockedItems.length
  const total          = achievements.length
  const pct            = total > 0 ? Math.round((unlockedCount / total) * 100) : 0

  // In-progress: locked items with progress > 0, sorted by % descending, top 3
  const inProgressItems = lockedItems
    .filter(a => a.progress > 0)
    .sort((a, b) => (b.progress / b.total) - (a.progress / a.total))
    .slice(0, 3)

  const inProgressIds  = new Set(inProgressItems.map(a => a.badge.id))
  const lockedGridItems = lockedItems.filter(a => !inProgressIds.has(a.badge.id))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="px-4 pt-4 pb-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Achievements</h1>
          </div>
          {!loading && (
            <span className="text-sm font-semibold" style={{ color: "hsl(80 100% 50%)" }}>
              {unlockedCount} / {total}
            </span>
          )}
        </div>
      </header>

      <main className="px-4 py-5 pb-24 space-y-7">
        {loading ? <LoadingSkeleton /> : (
          <>
            {/* Overall progress bar */}
            <div className="rounded-2xl bg-card border border-border p-5">
              <div className="flex justify-between items-center mb-3">
                <p className="font-semibold text-foreground">Total Progress</p>
                <p className="text-sm font-bold" style={{ color: "hsl(80 100% 50%)" }}>{pct}%</p>
              </div>
              <div className="w-full h-2 rounded-full bg-border overflow-hidden">
                <div
                  className="h-2 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: "hsl(80 100% 50%)" }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {unlockedCount} of {total} badges earned
              </p>
            </div>

            {/* Empty state */}
            {unlockedCount === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <span className="text-5xl mb-4">🏅</span>
                <p className="font-semibold text-foreground text-lg">No badges yet</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  Complete your first workout to start earning achievements.
                </p>
                <Link href="/log-workout">
                  <button
                    className="mt-5 px-6 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
                    style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
                  >
                    Start a Workout
                  </button>
                </Link>
              </div>
            )}

            {/* Trophy shelf */}
            {unlockedCount > 0 && <TrophyShelf items={unlockedItems} />}

            {/* In progress */}
            {inProgressItems.length > 0 && <InProgressSection items={inProgressItems} />}

            {/* Locked grid */}
            {lockedGridItems.length > 0 && <LockedSection items={lockedGridItems} />}
          </>
        )}
      </main>
    </div>
  )
}
