"use client"

import { Button } from "@/components/ui/button"
import { Plus, Trophy, TrendingUp, Target, Flame, ArrowLeft, Trash2 } from "lucide-react"
import { CreateGoalDialog } from "@/components/create-goal-dialog"
import { WorkoutSessionNotification } from "@/components/workout-session-notification"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getGoals, deleteGoal } from "@/lib/goal-storage"
import { toast } from "sonner"

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
  const router = useRouter()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const loadGoals = async () => {
    try {
      const savedGoals = await getGoals()
      setGoals(savedGoals)
    } catch (err) {
      console.error("Failed to load goals:", err)
    } finally {
      setLoading(false)
    }
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

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteGoal(deleteId)
      toast.success("Goal deleted")
    } catch {
      toast.error("Failed to delete goal")
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <div className="px-5 pt-4 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </button>
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

      <main className="px-5 py-5 pb-24 space-y-6">
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
                    <div className="flex items-start gap-3">
                      <div className="text-right">
                        <p className="text-xl font-bold" style={{ color: style.color }}>{Math.round(pct)}%</p>
                        <p className="text-[11px] text-muted-foreground">{statusText}</p>
                      </div>
                      <button
                        onClick={() => setDeleteId(goal.id)}
                        className="mt-0.5 text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-green-500">✓</span>
                    <button
                      onClick={() => setDeleteId(goal.id)}
                      className="text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null) }}>
        <DialogContent className="sm:max-w-xs bg-card border-border p-0 overflow-hidden">
          <div className="h-1 w-full" style={{ backgroundColor: "#ef4444" }} />
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(239,68,68,0.12)" }}>
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Delete goal?</p>
                <p className="text-xs text-muted-foreground mt-0.5">This can't be undone.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 h-10 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 h-10 rounded-xl text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: "#ef4444" }}
              >
                Delete
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
