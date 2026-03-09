"use client"

import { Button } from "@/components/ui/button"
import { Plus, Trophy, Calendar, TrendingUp, Target, Shield, Info, Flame } from "lucide-react"
import { BackButton } from "@/components/back-button"
import { CreateGoalDialog } from "@/components/create-goal-dialog"
import { WorkoutSessionNotification } from "@/components/workout-session-notification"
import { useEffect, useState } from "react"
import { getWorkoutStats } from "@/lib/workout-storage"
import { getGoals } from "@/lib/goal-storage"
import { signOut } from "next-auth/react"
import Link from "next/link"

interface Goal {
  id: string
  title: string
  type: "strength" | "habit" | "consistency" | "bodyweight"
  target: number
  current: number
  unit: string
  icon: any
  completed: boolean
  completedDate?: string
}

const GOAL_TYPE_STYLES: Record<string, { color: string; bg: string; icon: any }> = {
  strength:    { color: "#3b82f6", bg: "rgba(59,130,246,0.12)",  icon: TrendingUp },
  habit:       { color: "hsl(80 100% 50%)", bg: "rgba(170,255,0,0.12)", icon: Target },
  consistency: { color: "#f97316", bg: "rgba(249,115,22,0.12)",  icon: Flame },
  bodyweight:  { color: "#a855f7", bg: "rgba(168,85,247,0.12)",  icon: Trophy },
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  const loadGoals = async () => {
    const savedGoals = await getGoals()
    const stats = await getWorkoutStats()

    if (savedGoals.length === 0) {
      setGoals([
        {
          id: "weekly-workouts",
          title: "Workout 4x per week",
          type: "habit",
          target: 4,
          current: stats.weeklyWorkouts,
          unit: "workouts",
          icon: Target,
          completed: stats.weeklyWorkouts >= 4,
        },
        {
          id: "consistency-streak",
          title: "30-day streak",
          type: "consistency",
          target: 30,
          current: stats.currentStreak,
          unit: "days",
          icon: Calendar,
          completed: stats.currentStreak >= 30,
        },
      ])
    } else {
      setGoals(
        savedGoals.map((goal) => {
          if (goal.id === "weekly-workouts")
            return { ...goal, current: stats.weeklyWorkouts, completed: stats.weeklyWorkouts >= 4 }
          if (goal.id === "consistency-streak")
            return { ...goal, current: stats.currentStreak, completed: stats.currentStreak >= 30 }
          return goal
        })
      )
    }
    setLoading(false)
  }

  useEffect(() => {
    loadGoals()
    window.addEventListener("workoutDataChanged", loadGoals)
    window.addEventListener("goalDataChanged", loadGoals)
    return () => {
      window.removeEventListener("workoutDataChanged", loadGoals)
      window.removeEventListener("goalDataChanged", loadGoals)
    }
  }, [])

  const activeGoals = goals.filter((g) => !g.completed)
  const completedGoals = goals.filter((g) => g.completed)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <div className="px-5 pt-4 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BackButton />
              <div>
                <h1 className="text-2xl font-bold text-foreground leading-tight">Goals</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Track your fitness targets</p>
              </div>
            </div>
            <CreateGoalDialog onGoalCreated={loadGoals}>
              <button
                className="h-9 px-4 rounded-xl font-semibold text-sm flex items-center gap-1.5 transition-transform active:scale-95"
                style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
              >
                <Plus className="h-4 w-4" />
                New Goal
              </button>
            </CreateGoalDialog>
          </div>
        </div>
      </header>

      <main className="px-5 py-5 space-y-6">
        <WorkoutSessionNotification />

        {/* Active Goals */}
        <div className="space-y-3">
          <p className="font-semibold text-foreground">Active Goals</p>

          {loading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-muted/20 animate-pulse" />
              ))}
            </div>
          ) : activeGoals.length === 0 ? (
            <div className="rounded-2xl bg-card border border-border p-8 text-center">
              <Target className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium text-foreground mb-1">No active goals</p>
              <p className="text-xs text-muted-foreground mb-4">Create a goal to start tracking your progress</p>
              <CreateGoalDialog onGoalCreated={loadGoals}>
                <button
                  className="h-10 px-5 rounded-xl font-semibold text-sm flex items-center gap-2 mx-auto transition-transform active:scale-95"
                  style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
                >
                  <Plus className="h-4 w-4" />
                  Create First Goal
                </button>
              </CreateGoalDialog>
            </div>
          ) : (
            activeGoals.map((goal) => {
              const pct = Math.min((goal.current / goal.target) * 100, 100)
              const style = GOAL_TYPE_STYLES[goal.type] ?? GOAL_TYPE_STYLES.habit
              const Icon = style.icon
              const statusText = pct >= 100 ? "Achieved!" : pct >= 90 ? "Almost there!" : pct >= 50 ? "On track" : "Keep going!"

              return (
                <div
                  key={goal.id}
                  className="rounded-2xl bg-card border border-border p-4"
                  style={{ borderLeft: `3px solid ${style.color}` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl shrink-0" style={{ background: style.bg }}>
                        <Icon className="h-4 w-4" style={{ color: style.color }} />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm leading-tight">{goal.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {goal.current} / {goal.target} {goal.unit}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold" style={{ color: style.color }}>{Math.round(pct)}%</p>
                      <p className="text-[11px] text-muted-foreground">{statusText}</p>
                    </div>
                  </div>

                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "hsl(0 0% 15%)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: style.color }}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Quick-add categories */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { type: "strength" as const, label: "Strength Goal", icon: TrendingUp },
            { type: "habit"    as const, label: "Habit Goal",    icon: Target },
          ].map(({ type, label, icon: Icon }) => {
            const s = GOAL_TYPE_STYLES[type]
            return (
              <CreateGoalDialog key={type} goalType={type} onGoalCreated={loadGoals}>
                <button className="w-full h-16 rounded-2xl bg-card border border-border flex flex-col items-center justify-center gap-1 transition-transform active:scale-95">
                  <Icon className="h-5 w-5" style={{ color: s.color }} />
                  <span className="text-xs font-medium text-muted-foreground">{label}</span>
                </button>
              </CreateGoalDialog>
            )
          })}
        </div>

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div className="space-y-3">
            <p className="font-semibold text-foreground">Completed</p>
            {completedGoals.map((goal) => (
              <div key={goal.id} className="rounded-2xl bg-card border border-border p-4 opacity-70">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl shrink-0" style={{ background: "rgba(34,197,94,0.12)" }}>
                      <Trophy className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{goal.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {goal.completedDate ? `Completed ${goal.completedDate}` : "Recently completed"}
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-green-500">✓</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* App Settings */}
        <div className="rounded-2xl bg-card border border-border p-4 space-y-2">
          <p className="font-semibold text-foreground mb-3">Settings</p>
          <Link href="/privacy-policy" className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/20 transition-colors">
            <div className="p-1.5 rounded-lg" style={{ background: "rgba(168,85,247,0.12)" }}>
              <Shield className="h-4 w-4 text-purple-500" />
            </div>
            <span className="text-sm text-foreground">Privacy Policy</span>
          </Link>
          <div className="flex items-center gap-3 p-2 rounded-xl">
            <div className="p-1.5 rounded-lg" style={{ background: "rgba(59,130,246,0.12)" }}>
              <Info className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-sm text-foreground">FitTracker v2.0.0</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
            className="flex items-center gap-3 p-2 rounded-xl w-full hover:bg-muted/20 transition-colors text-left"
          >
            <div className="p-1.5 rounded-lg" style={{ background: "rgba(239,68,68,0.12)" }}>
              <svg className="h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm text-red-500 font-medium">Sign Out</span>
          </button>
        </div>
      </main>
    </div>
  )
}
