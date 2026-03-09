import type { Workout } from "./workout-storage"

/**
 * Epley formula: estimated 1-rep max from a given weight × reps.
 * Returns the weight itself for single-rep sets.
 */
export function calculateEpley1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}

/**
 * Label describing how hard the 1RM estimate is
 * (helps users understand which sets drove the number).
 */
export function get1RMLabel(reps: number): string {
  if (reps === 1) return "Actual 1RM"
  if (reps <= 3) return "Near-max estimate"
  if (reps <= 6) return "Strength estimate"
  if (reps <= 10) return "Hypertrophy estimate"
  return "Endurance estimate"
}

export interface OneRMDataPoint {
  date: string        // ISO string
  label: string       // "Jan 5" etc.
  estimated1RM: number
  weight: number
  reps: number
}

/**
 * Build a chronological 1RM time-series for a given exercise.
 * One data point per workout session (best set of that session).
 */
export function build1RMHistory(
  workouts: Workout[],
  exerciseName: string
): OneRMDataPoint[] {
  const points: OneRMDataPoint[] = []

  const sorted = [...workouts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  for (const workout of sorted) {
    const ex = workout.exercises.find((e) => e.name === exerciseName)
    if (!ex) continue

    let best1RM = 0
    let bestWeight = 0
    let bestReps = 0

    for (const set of ex.sets) {
      if (!set.completed || set.reps <= 0 || set.weight <= 0) continue
      const orm = calculateEpley1RM(set.weight, set.reps)
      if (orm > best1RM) {
        best1RM = orm
        bestWeight = set.weight
        bestReps = set.reps
      }
    }

    if (best1RM === 0) continue

    points.push({
      date: workout.date,
      label: new Date(workout.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      estimated1RM: best1RM,
      weight: bestWeight,
      reps: bestReps,
    })
  }

  return points
}
