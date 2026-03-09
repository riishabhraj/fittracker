import type { Workout } from "./workout-storage"

export interface PlateauResult {
  exerciseName: string
  /** Total sessions tracked for this exercise */
  sessionCount: number
  /** How many consecutive recent sessions had no improvement */
  consecutiveStalls: number
  lastBestWeight: number
  lastBestReps: number
  /** Approximate weeks since last improvement */
  weeksStalled: number
}

/**
 * Scan all workouts and return exercises that appear to have hit a plateau.
 *
 * Logic: for each exercise, compare the best weight in the most recent `minStalls`
 * sessions against the best weight seen before those sessions. If there's no
 * improvement, the exercise is flagged. Requires at least `minSessions` total
 * logged sessions before flagging.
 */
export function detectPlateaus(
  workouts: Workout[],
  minStalls = 3,
  minSessions = 5
): PlateauResult[] {
  // Build per-exercise session history (newest first)
  type SessionPoint = { weight: number; reps: number; date: string }
  const exerciseMap = new Map<string, SessionPoint[]>()

  const sorted = [...workouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  for (const workout of sorted) {
    for (const exercise of workout.exercises) {
      const completed = exercise.sets.filter(
        (s) => s.completed && s.weight > 0 && s.reps > 0
      )
      if (completed.length === 0) continue

      const best = completed.reduce((b, s) =>
        s.weight > b.weight || (s.weight === b.weight && s.reps > b.reps) ? s : b
      )

      const arr = exerciseMap.get(exercise.name) ?? []
      arr.push({ weight: best.weight, reps: best.reps, date: workout.date })
      exerciseMap.set(exercise.name, arr)
    }
  }

  const plateaus: PlateauResult[] = []

  for (const [name, sessions] of exerciseMap) {
    if (sessions.length < minSessions) continue

    const recent = sessions.slice(0, minStalls)   // newest N sessions
    const older  = sessions.slice(minStalls)       // sessions before those

    const recentBestWeight = Math.max(...recent.map((s) => s.weight))
    const olderBestWeight  = Math.max(...older.map((s) => s.weight))

    // Plateau: recent sessions haven't beaten what came before
    if (recentBestWeight <= olderBestWeight) {
      // Count consecutive stalls (pairs: sessions[i] didn't improve on sessions[i+1])
      let consecutiveStalls = 0
      for (let i = 0; i < sessions.length - 1; i++) {
        const curr = sessions[i]
        const prev = sessions[i + 1]
        const improved =
          curr.weight > prev.weight ||
          (curr.weight === prev.weight && curr.reps > prev.reps)
        if (!improved) {
          consecutiveStalls++
        } else {
          break
        }
      }

      // Estimate weeks stalled from oldest recent session to newest
      const oldestRecent = recent[recent.length - 1]
      const newestRecent = recent[0]
      const daysDiff = Math.max(
        7,
        (new Date(newestRecent.date).getTime() -
          new Date(oldestRecent.date).getTime()) /
          (1000 * 60 * 60 * 24)
      )
      const weeksStalled = Math.max(1, Math.round(daysDiff / 7))

      plateaus.push({
        exerciseName: name,
        sessionCount: sessions.length,
        consecutiveStalls: Math.max(consecutiveStalls, minStalls),
        lastBestWeight: sessions[0].weight,
        lastBestReps: sessions[0].reps,
        weeksStalled,
      })
    }
  }

  return plateaus.sort((a, b) => b.consecutiveStalls - a.consecutiveStalls)
}
