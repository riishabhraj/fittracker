export interface Goal {
  id: string
  title: string
  description?: string
  type: "strength" | "habit" | "consistency" | "bodyweight"
  target: number
  current: number
  unit: string
  category: string
  createdDate: string
  targetDate?: string
  completed: boolean
  completedDate?: string
  icon: string
  color?: string
}

export interface StrengthGoal extends Goal {
  type: "strength"
  exerciseName: string
  metric: "weight" | "reps" | "volume"
}

export interface HabitGoal extends Goal {
  type: "habit"
  frequency: "daily" | "weekly" | "monthly"
  streak: number
  lastCompletedDate?: string
}

// ── Core CRUD (API-backed) ────────────────────────────────────────────────────

export const getGoals = async (): Promise<Goal[]> => {
  const res = await fetch("/api/goals")
  if (!res.ok) throw new Error(`Failed to fetch goals (${res.status})`)
  return res.json()
}

export const saveGoal = async (goal: Omit<Goal, "id"> & { id?: string }): Promise<void> => {
  const res = await fetch("/api/goals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(goal),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Failed to save goal (${res.status})`)
  }
  window.dispatchEvent(new CustomEvent("goalDataChanged"))
}

export const updateGoalProgress = async (id: string, newProgress: number): Promise<void> => {
  try {
    const goals = await getGoals()
    const goal = goals.find((g) => g.id === id)
    if (!goal) return

    const completed = newProgress >= goal.target
    await fetch(`/api/goals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        current: newProgress,
        completed,
        completedDate: completed && !goal.completed ? new Date().toISOString() : goal.completedDate,
      }),
    })
    window.dispatchEvent(new CustomEvent("goalDataChanged"))
  } catch (error) {
    console.error("Failed to update goal progress:", error)
  }
}

export const deleteGoal = async (id: string): Promise<void> => {
  const res = await fetch(`/api/goals/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error(`Failed to delete goal (${res.status})`)
  window.dispatchEvent(new CustomEvent("goalDataChanged"))
}

export const getGoalById = async (id: string): Promise<Goal | null> => {
  const res = await fetch(`/api/goals/${id}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Failed to fetch goal (${res.status})`)
  return res.json()
}

export const getActiveGoals = async (): Promise<Goal[]> => {
  const goals = await getGoals()
  return goals.filter((g) => !g.completed)
}

export const getCompletedGoals = async (): Promise<Goal[]> => {
  const goals = await getGoals()
  return goals.filter((g) => g.completed)
}

export const getGoalsByType = async (type: Goal["type"]): Promise<Goal[]> => {
  const goals = await getGoals()
  return goals.filter((g) => g.type === type)
}

// Auto-track strength goals based on a saved workout
export const updateGoalsFromWorkout = async (workout: any): Promise<void> => {
  try {
    const goals = await getGoals()

    for (const goal of goals) {
      if (goal.type !== "strength") continue
      const strengthGoal = goal as StrengthGoal

      const exercise = workout.exercises?.find((ex: any) =>
        ex.name?.toLowerCase().includes(strengthGoal.exerciseName?.toLowerCase())
      )
      if (!exercise) continue

      let maxValue = 0
      exercise.sets?.forEach((set: any) => {
        if (!set.completed) return
        if (strengthGoal.metric === "weight" && set.weight > maxValue) maxValue = set.weight
        else if (strengthGoal.metric === "reps" && set.reps > maxValue) maxValue = set.reps
        else if (strengthGoal.metric === "volume") maxValue += (Number(set.weight) || 0) * (Number(set.reps) || 0)
      })

      if (maxValue > goal.current) {
        await updateGoalProgress(goal.id, maxValue)
      }
    }
  } catch (error) {
    console.error("Failed to update goals from workout:", error)
  }
}

// ── Utilities ─────────────────────────────────────────────────────────────────

export const generateId = (): string =>
  Date.now().toString() + Math.random().toString(36).substr(2, 9)

export const exportGoalData = async (): Promise<string> => {
  const goals = await getGoals()
  return JSON.stringify({ goals, exportDate: new Date().toISOString(), version: "2.0.0" }, null, 2)
}

// ── Goal templates ────────────────────────────────────────────────────────────

export const strengthGoalTemplates = [
  { title: "Bench Press 135 lbs", description: "Achieve a 135 lb bench press", target: 135, unit: "lbs", exerciseName: "Bench Press", metric: "weight" as const, icon: "💪", color: "#ef4444" },
  { title: "Squat Body Weight",    description: "Squat your body weight",       target: 150, unit: "lbs", exerciseName: "Squat",        metric: "weight" as const, icon: "🏋️", color: "#3b82f6" },
  { title: "Deadlift 225 lbs",     description: "Achieve a 225 lb deadlift",   target: 225, unit: "lbs", exerciseName: "Deadlift",     metric: "weight" as const, icon: "💥", color: "#8b5cf6" },
  { title: "100 Push-ups",         description: "Complete 100 push-ups",       target: 100, unit: "reps", exerciseName: "Push-up",     metric: "reps"   as const, icon: "⚡", color: "#f59e0b" },
]

export const habitGoalTemplates = [
  { title: "Workout 4x per week", description: "Maintain consistent schedule", target: 4,     unit: "workouts", frequency: "weekly" as const, icon: "🎯", color: "#10b981" },
  { title: "Daily cardio",        description: "30 minutes of cardio/day",     target: 30,    unit: "minutes",  frequency: "daily"  as const, icon: "🏃", color: "#f59e0b" },
  { title: "Track meals daily",   description: "Log all meals",                target: 1,     unit: "entries",  frequency: "daily"  as const, icon: "🍎", color: "#ef4444" },
  { title: "10k steps daily",     description: "Walk 10,000 steps/day",        target: 10000, unit: "steps",    frequency: "daily"  as const, icon: "👟", color: "#6366f1" },
]
