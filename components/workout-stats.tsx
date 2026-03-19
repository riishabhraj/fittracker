"use client"

import { Flame, Calendar, TrendingUp, Clock, Target, Zap } from "lucide-react"
import { getWorkoutStats } from "@/lib/workout-storage"
import { useEffect, useState } from "react"

export function WorkoutStats() {
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    weeklyWorkouts: 0,
    totalWeight: 0,
    totalHours: 0,
    currentStreak: 0,
    weeklyGoal: 4,
    avgDuration: 0,
  })

  useEffect(() => {
    const update = async () => {
      try { setStats(await getWorkoutStats()) } catch { /* keep previous state */ }
    }
    update()
    window.addEventListener("workoutDataChanged", update)
    window.addEventListener("storage", update)
    return () => {
      window.removeEventListener("workoutDataChanged", update)
      window.removeEventListener("storage", update)
    }
  }, [])

  const weeklyPct = stats.weeklyGoal > 0
    ? Math.min((stats.weeklyWorkouts / stats.weeklyGoal) * 100, 100)
    : 0

  return (
    <div className="space-y-3">
      {/* Hero row: streak + weekly goal */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl shrink-0" style={{ background: "rgba(249,115,22,0.15)" }}>
            <Flame className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground leading-none">{stats.currentStreak}</p>
            <p className="text-xs text-muted-foreground mt-1">Day streak 🔥</p>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-primary" />
              <p className="text-xs text-muted-foreground">Weekly goal</p>
            </div>
            <p className="text-sm font-bold text-foreground">{stats.weeklyWorkouts}/{stats.weeklyGoal}</p>
          </div>
          <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${weeklyPct}%`, backgroundColor: "hsl(80 100% 50%)" }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            {weeklyPct >= 100 ? "Goal crushed! 💪" : `${Math.round(weeklyPct)}% complete`}
          </p>
        </div>
      </div>

      {/* Mini 4-stat row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Calendar,   value: stats.totalWorkouts,  label: "Total",    color: "#3b82f6",          bg: "rgba(59,130,246,0.1)" },
          { icon: Clock,      value: `${stats.avgDuration}m`, label: "Avg",   color: "#a855f7",          bg: "rgba(168,85,247,0.1)" },
          { icon: TrendingUp, value: stats.totalHours,     label: "Hours",    color: "hsl(80 100% 50%)", bg: "rgba(170,255,0,0.1)" },
          {
            icon: Zap,
            value: stats.totalWeight > 9999
              ? `${(stats.totalWeight / 1000).toFixed(1)}k`
              : stats.totalWeight,
            label: "kg",
            color: "#f59e0b",
            bg: "rgba(245,158,11,0.1)",
          },
        ].map(({ icon: Icon, value, label, color, bg }) => (
          <div key={label} className="rounded-2xl bg-card border border-border p-3 text-center">
            <div className="p-1.5 rounded-lg w-fit mx-auto mb-1.5" style={{ background: bg }}>
              <Icon className="h-3.5 w-3.5" style={{ color }} />
            </div>
            <p className="text-base font-bold text-foreground leading-none">{value}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
