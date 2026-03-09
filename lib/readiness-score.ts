import type { Workout } from "./workout-storage"

export interface ReadinessInput {
  workouts: Workout[]
  /** User's self-reported energy level 1–10 (from profile) */
  subjectiveEnergy?: number
}

export interface ReadinessResult {
  score: number          // 1–10
  label: string          // "Ready to crush it" / "Take it steady" / "Rest day recommended"
  color: string          // hex
  breakdown: {
    recovery: number     // 1–10
    freshness: number    // 1–10
    energy: number       // 1–10
  }
  recommendation: string
}

/**
 * Rule-based readiness score composed of three sub-scores:
 *  - Recovery:  inverse of avg RPE from last session (high RPE → need more rest)
 *  - Freshness: how long ago the last workout was (more days → more fresh, up to a cap)
 *  - Energy:    user's subjective energy slider (defaults to 7 if not set)
 */
export function computeReadinessScore({
  workouts,
  subjectiveEnergy = 7,
}: ReadinessInput): ReadinessResult {
  const sorted = [...workouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const lastWorkout = sorted[0]

  // ── Freshness: days since last workout ───────────────────────────────────
  let freshness = 10
  if (lastWorkout) {
    const daysSince =
      (Date.now() - new Date(lastWorkout.date).getTime()) / (1000 * 60 * 60 * 24)

    if (daysSince < 1)      freshness = 4   // worked out today
    else if (daysSince < 2) freshness = 7   // yesterday
    else if (daysSince < 3) freshness = 9   // 2 days ago
    else                    freshness = 10  // 3+ days — fully fresh
  }

  // ── Recovery: based on avg RPE of last session ────────────────────────────
  let recovery = 8 // default when no RPE data
  if (lastWorkout) {
    const rpeSets = lastWorkout.exercises
      .flatMap((e) => e.sets)
      .filter((s) => s.completed && s.rpe !== undefined && s.rpe! > 0)

    if (rpeSets.length > 0) {
      const avgRpe = rpeSets.reduce((sum, s) => sum + s.rpe!, 0) / rpeSets.length
      // RPE 10 → recovery 2, RPE 5 → recovery 7, RPE 1 → recovery 10
      recovery = Math.max(1, Math.min(10, Math.round(10 - avgRpe * 0.8)))
    }
  }

  // ── Energy: subjective slider ────────────────────────────────────────────
  const energy = Math.max(1, Math.min(10, subjectiveEnergy))

  // ── Composite score (weighted average) ──────────────────────────────────
  const score = Math.round(
    recovery  * 0.35 +
    freshness * 0.35 +
    energy    * 0.30
  )

  // ── Label & color ────────────────────────────────────────────────────────
  let label: string
  let color: string
  let recommendation: string

  if (score >= 8) {
    label = "Ready to crush it"
    color = "#aaff00"
    recommendation = "Your body is primed. Go for a PR or push volume today."
  } else if (score >= 6) {
    label = "Good to go"
    color = "#4ade80"
    recommendation = "Solid readiness. Train as planned — listen to your body."
  } else if (score >= 4) {
    label = "Take it steady"
    color = "#fbbf24"
    recommendation = "Moderate intensity is ideal today. Avoid max effort sets."
  } else {
    label = "Rest day recommended"
    color = "#f97316"
    recommendation = "Recovery beats training today. Prioritise sleep and nutrition."
  }

  return { score, label, color, breakdown: { recovery, freshness, energy }, recommendation }
}
