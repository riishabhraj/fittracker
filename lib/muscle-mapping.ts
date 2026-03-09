import type { Workout } from "./workout-storage"

/** Muscle groups shown on the SVG heatmap */
export type MuscleGroup =
  | "chest"
  | "front_delts"
  | "side_delts"
  | "rear_delts"
  | "biceps"
  | "triceps"
  | "forearms"
  | "abs"
  | "obliques"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "lats"
  | "traps"
  | "lower_back"

/** Which muscles a given exercise category primarily targets */
export const CATEGORY_TO_MUSCLES: Record<string, MuscleGroup[]> = {
  Chest:     ["chest", "front_delts", "triceps"],
  Back:      ["lats", "traps", "rear_delts", "lower_back"],
  Shoulders: ["front_delts", "side_delts", "rear_delts"],
  Arms:      ["biceps", "triceps", "forearms"],
  Legs:      ["quads", "hamstrings", "glutes", "calves"],
  Core:      ["abs", "obliques"],
  Cardio:    [],
}

/**
 * Compute total volume (sets × reps × weight) per muscle group
 * from an array of workouts, over a given number of recent days.
 */
export function computeMuscleVolumes(
  workouts: Workout[],
  days = 7
): Partial<Record<MuscleGroup, number>> {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  const volumes: Partial<Record<MuscleGroup, number>> = {}

  for (const workout of workouts) {
    if (new Date(workout.date).getTime() < cutoff) continue

    for (const exercise of workout.exercises) {
      const muscles = CATEGORY_TO_MUSCLES[exercise.category] ?? []
      const vol = exercise.sets
        .filter((s) => s.completed && s.weight > 0 && s.reps > 0)
        .reduce((sum, s) => sum + s.weight * s.reps, 0)

      if (vol === 0) continue
      for (const m of muscles) {
        volumes[m] = (volumes[m] ?? 0) + vol
      }
    }
  }

  return volumes
}

/**
 * Normalize volumes to a 0–1 scale for rendering intensity.
 * Returns 0 for muscles with no volume.
 */
export function normalizeVolumes(
  volumes: Partial<Record<MuscleGroup, number>>
): Partial<Record<MuscleGroup, number>> {
  const vals = Object.values(volumes).filter((v): v is number => v > 0)
  if (vals.length === 0) return {}
  const max = Math.max(...vals)
  const result: Partial<Record<MuscleGroup, number>> = {}
  for (const [m, v] of Object.entries(volumes) as [MuscleGroup, number][]) {
    result[m] = v / max
  }
  return result
}
