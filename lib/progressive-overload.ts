import type { Exercise } from "./workout-storage"

export type OverloadReason = "increase_weight" | "increase_reps" | "maintain" | "first_session"

export interface SuggestedSet {
  weight: number
  reps: number
  reason: OverloadReason
  /** Human-readable explanation shown in the chip */
  label: string
}

/**
 * Given the last N sessions of a single exercise (newest first),
 * return a suggested weight/reps for the next set.
 *
 * Rules (simple linear progression):
 *  - No history          → null (nothing to suggest)
 *  - 1 session           → same weight + same reps (show as reference, reason: first_session)
 *  - Last session weight > session before → keep adding the same increment
 *  - Last session reps ≥ target and weight stayed same → bump weight by 2.5
 *  - Last session reps < target → stay at same weight
 */
export function computeSuggestion(history: Exercise[]): SuggestedSet | null {
  if (history.length === 0) return null

  const lastSession = history[0]
  const lastCompleted = lastSession.sets.filter(
    (s) => s.completed && s.weight > 0 && s.reps > 0
  )
  if (lastCompleted.length === 0) return null

  // Best set from last session (highest weight, then reps)
  const lastBest = lastCompleted.reduce((best, s) =>
    s.weight > best.weight || (s.weight === best.weight && s.reps > best.reps) ? s : best
  )

  // Only one session on record — show as reference
  if (history.length === 1) {
    return {
      weight: lastBest.weight,
      reps: lastBest.reps,
      reason: "first_session",
      label: `Last: ${lastBest.weight} kg × ${lastBest.reps}`,
    }
  }

  const prevSession = history[1]
  const prevCompleted = prevSession.sets.filter(
    (s) => s.completed && s.weight > 0 && s.reps > 0
  )

  // If no comparable prev data, nudge up
  if (prevCompleted.length === 0) {
    return {
      weight: lastBest.weight + 2.5,
      reps: lastBest.reps,
      reason: "increase_weight",
      label: `↑ ${lastBest.weight + 2.5} kg × ${lastBest.reps}`,
    }
  }

  const prevBest = prevCompleted.reduce((best, s) =>
    s.weight > best.weight ? s : best
  )

  const weightGain = lastBest.weight - prevBest.weight

  // Weight increased last session → keep the same increment
  if (weightGain > 0) {
    const nextWeight = lastBest.weight + weightGain
    return {
      weight: nextWeight,
      reps: lastBest.reps,
      reason: "increase_weight",
      label: `↑ ${nextWeight} kg × ${lastBest.reps}`,
    }
  }

  // Weight stayed same — check reps
  const repsGain = lastBest.reps - prevBest.reps

  // Reps improved or reps are solid (≥ 8) → bump weight by 2.5
  if (repsGain > 0 || lastBest.reps >= 8) {
    return {
      weight: lastBest.weight + 2.5,
      reps: lastBest.reps,
      reason: "increase_weight",
      label: `↑ ${lastBest.weight + 2.5} kg × ${lastBest.reps}`,
    }
  }

  // Reps dropped or stayed low → hold the weight
  return {
    weight: lastBest.weight,
    reps: lastBest.reps,
    reason: "maintain",
    label: `${lastBest.weight} kg × ${lastBest.reps}`,
  }
}
