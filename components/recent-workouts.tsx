"use client"

import { Plus, Clock, Zap, Activity, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getRecentWorkouts } from "@/lib/workout-storage"
import { useState, useEffect } from "react"

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`
}

function formatDate(date: Date): string {
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function RecentWorkouts() {
  const [workouts, setWorkouts] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      try { setWorkouts(await getRecentWorkouts(3)) } catch { /* keep previous state */ }
    }
    load()
    window.addEventListener("storage", load)
    window.addEventListener("workoutDataChanged", load)
    return () => {
      window.removeEventListener("storage", load)
      window.removeEventListener("workoutDataChanged", load)
    }
  }, [])

  return (
    <div className="rounded-2xl bg-card border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="font-semibold text-foreground">Recent Workouts</p>
        <Link href="/workouts" className="flex items-center gap-0.5 text-xs text-primary font-medium">
          View All <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {workouts.length === 0 ? (
        <div className="text-center py-8">
          <Image src="/fittracker-app-icon.png" alt="FitTracker" width={56} height={56} className="rounded-2xl mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground mb-4">No workouts yet — let&apos;s get started!</p>
          <Link href="/log-workout">
            <button
              className="h-10 px-5 rounded-xl font-semibold text-sm flex items-center gap-2 mx-auto transition-transform active:scale-95"
              style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
            >
              <Plus className="h-4 w-4" />
              Log First Workout
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((workout) => {
            const totalWeight = workout.exercises.reduce(
              (sum: number, ex: any) =>
                sum + ex.sets.reduce((s: number, set: any) => s + (set.weight || 0) * (set.reps || 0), 0),
              0
            )
            const totalSets = workout.exercises.reduce((sum: number, ex: any) => sum + ex.sets.length, 0)

            return (
              <div
                key={workout.id}
                className="rounded-xl border border-border overflow-hidden"
                style={{ borderLeft: "3px solid hsl(80 100% 50%)" }}
              >
                <div className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground text-sm leading-tight">{workout.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {workout.exercises.map((e: any) => e.name).slice(0, 3).join(" · ")}
                        {workout.exercises.length > 3 ? ` +${workout.exercises.length - 3}` : ""}
                      </p>
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
                      {formatDate(new Date(workout.date))}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{formatDuration(workout.duration)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{totalSets} sets</span>
                    </div>
                    {totalWeight > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {totalWeight > 9999
                            ? `${(totalWeight / 1000).toFixed(1)}k`
                            : totalWeight.toLocaleString()} lbs
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
