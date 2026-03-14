export interface Workout {
  id: string
  date: string
  name: string
  exercises: Exercise[]
  duration: number
  totalSets: number
  totalReps: number
  totalWeight: number
  usedTemplate?: boolean
  usedAIGenerate?: boolean
}

export interface Exercise {
  id: string
  name: string
  category: string
  sets: Set[]
  supersetGroup?: string
}

export interface Set {
  reps: number
  weight: number
  completed: boolean
  restTime?: number
  estimated1RM?: number
  rpe?: number
}

export interface WorkoutTemplate {
  id: string
  name: string
  description: string
  exercises: Omit<Exercise, "sets">[]
  color: string
  icon: string
}

// ── Core CRUD (API-backed) ────────────────────────────────────────────────────

export const getWorkouts = async (): Promise<Workout[]> => {
  const res = await fetch("/api/workouts")
  if (!res.ok) throw new Error(`Failed to fetch workouts (${res.status})`)
  return res.json()
}

export const saveWorkout = async (workout: Omit<Workout, "id"> & { id?: string }): Promise<void> => {
  const res = await fetch("/api/workouts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(workout),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Failed to save workout (${res.status})`)
  }
  window.dispatchEvent(new CustomEvent("workoutDataChanged"))
}

export const deleteWorkout = async (id: string): Promise<void> => {
  const res = await fetch(`/api/workouts/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error(`Failed to delete workout (${res.status})`)
  window.dispatchEvent(new CustomEvent("workoutDataChanged"))
}

export const getWorkoutById = async (id: string): Promise<Workout | null> => {
  const res = await fetch(`/api/workouts/${id}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Failed to fetch workout (${res.status})`)
  return res.json()
}

// ── Computed stats (fetch workouts once, compute locally) ─────────────────────

export const getWorkoutStats = async () => {
  const workouts = await getWorkouts()

  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const thisWeekWorkouts = workouts.filter((w) => new Date(w.date) >= startOfWeek)

  return {
    totalWorkouts: workouts.length,
    weeklyWorkouts: thisWeekWorkouts.length,
    totalSets: workouts.reduce((sum, w) => sum + w.totalSets, 0),
    totalReps: workouts.reduce((sum, w) => sum + w.totalReps, 0),
    totalWeight: workouts.reduce((sum, w) => sum + w.totalWeight, 0),
    totalHours: Math.round(workouts.reduce((sum, w) => sum + w.duration, 0) / 60),
    currentStreak: calculateStreak(workouts),
    weeklyGoal: 4,
    avgDuration:
      workouts.length > 0
        ? Math.round(workouts.reduce((sum, w) => sum + w.duration, 0) / workouts.length)
        : 0,
  }
}

export const calculateStreak = (workouts: Workout[]): number => {
  if (workouts.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const uniqueDates = [
    ...new Set(
      workouts.map((w) => {
        const d = new Date(w.date)
        d.setHours(0, 0, 0, 0)
        return d.getTime()
      })
    ),
  ].sort((a, b) => b - a)

  const mostRecentDiff = Math.floor((today.getTime() - uniqueDates[0]) / (1000 * 60 * 60 * 24))
  if (mostRecentDiff > 1) return 0

  let streak = 0
  let expectedTime = uniqueDates[0]

  for (const dateTime of uniqueDates) {
    if (dateTime === expectedTime) {
      streak++
      expectedTime -= 24 * 60 * 60 * 1000
    } else {
      break
    }
  }

  return streak
}

export const getRecentWorkouts = async (limit = 5): Promise<Workout[]> => {
  const workouts = await getWorkouts()
  // Deduplicate by id in case of double-saves
  const seen = new Set<string>()
  const unique = workouts.filter((w) => {
    if (seen.has(w.id)) return false
    seen.add(w.id)
    return true
  })
  return unique
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

export const getWorkoutsByDateRange = (workouts: Workout[], startDate: Date, endDate: Date): Workout[] => {
  return workouts.filter((w) => {
    const d = new Date(w.date)
    return d >= startDate && d <= endDate
  })
}

export const getPersonalRecords = async () => {
  const workouts = await getWorkouts()
  const records: { [exerciseName: string]: { weight: number; reps: number; date: string } } = {}

  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        if (set.completed) {
          const current = records[exercise.name]
          if (
            !current ||
            set.weight > current.weight ||
            (set.weight === current.weight && set.reps > current.reps)
          ) {
            records[exercise.name] = { weight: set.weight, reps: set.reps, date: workout.date }
          }
        }
      })
    })
  })

  return records
}

// ── Pure sync helpers (take pre-fetched workouts, no network call) ────────────

export function computePersonalRecords(
  workouts: Workout[]
): Record<string, { weight: number; reps: number; date: string }> {
  const records: Record<string, { weight: number; reps: number; date: string }> = {}
  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        if (set.completed) {
          const current = records[exercise.name]
          if (
            !current ||
            set.weight > current.weight ||
            (set.weight === current.weight && set.reps > current.reps)
          ) {
            records[exercise.name] = { weight: set.weight, reps: set.reps, date: workout.date }
          }
        }
      })
    })
  })
  return records
}

export function getExerciseHistoryFromWorkouts(
  workouts: Workout[],
  exerciseName: string,
  limit = 5
): Exercise[] {
  const sessions: Exercise[] = []
  const sorted = [...workouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  for (const w of sorted) {
    const ex = w.exercises.find((e) => e.name === exerciseName)
    if (ex && ex.sets.some((s) => s.completed)) {
      sessions.push(ex)
      if (sessions.length >= limit) break
    }
  }
  return sessions // newest first
}

// ── Utilities ─────────────────────────────────────────────────────────────────

export const generateId = (): string =>
  Date.now().toString() + Math.random().toString(36).substr(2, 9)

export const isToday = (date: Date): boolean =>
  date.toDateString() === new Date().toDateString()

export const isThisWeek = (date: Date): boolean => {
  const now = new Date()
  const start = new Date(now.setDate(now.getDate() - now.getDay()))
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return date >= start && date <= end
}

// Export/import kept for backward compat — reads from API
export const exportWorkoutData = async (): Promise<string> => {
  const workouts = await getWorkouts()
  return JSON.stringify({ workouts, exportDate: new Date().toISOString(), version: "2.0.0" }, null, 2)
}
