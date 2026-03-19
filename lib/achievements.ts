import type { Workout } from "./workout-storage"
import type { FitnessProfile } from "./fitness-utils"

export type BadgeCategory = "consistency" | "strength" | "effort" | "explorer"

export interface BadgeDefinition {
  id: string
  name: string
  description: string
  emoji: string
  category: BadgeCategory
}

export interface AchievementResult {
  badge: BadgeDefinition
  unlocked: boolean
  unlockedAt?: string
  progress: number
  total: number
}

export interface AchievementInputs {
  workouts: Workout[]
  stats: { totalWorkouts: number; currentStreak: number; totalWeight: number }
  prs: Record<string, { weight: number; reps: number; date: string }>
  profile: Partial<FitnessProfile> | null
}

export const BADGES: BadgeDefinition[] = [
  // Consistency
  { id: "first_step",    name: "First Step",    description: "Complete your first workout",        emoji: "🎯", category: "consistency" },
  { id: "on_fire",       name: "On Fire",        description: "Reach a 3-day workout streak",       emoji: "🔥", category: "consistency" },
  { id: "week_warrior",  name: "Week Warrior",   description: "Reach a 7-day workout streak",       emoji: "📅", category: "consistency" },
  { id: "monthly_grind", name: "Monthly Grind",  description: "Reach a 30-day workout streak",      emoji: "🗓️", category: "consistency" },
  { id: "regular",       name: "Regular",        description: "Complete 10 workouts",               emoji: "🏃", category: "consistency" },
  { id: "dedicated",     name: "Dedicated",      description: "Complete 25 workouts",               emoji: "⭐", category: "consistency" },
  { id: "elite",         name: "Elite",          description: "Complete 50 workouts",               emoji: "🏆", category: "consistency" },
  { id: "century",       name: "Century",        description: "Complete 100 workouts",              emoji: "💯", category: "consistency" },
  // Strength
  { id: "first_blood",   name: "First Blood",    description: "Log your first personal record",     emoji: "💪", category: "strength" },
  { id: "pr_hunter",     name: "PR Hunter",      description: "Earn 5 personal records",            emoji: "🔨", category: "strength" },
  { id: "pr_machine",    name: "PR Machine",     description: "Earn 10 personal records",           emoji: "⚡", category: "strength" },
  { id: "pr_legend",     name: "PR Legend",      description: "Earn 25 personal records",           emoji: "🌟", category: "strength" },
  { id: "lightweight",   name: "Lightweight",    description: "Lift 10,000 kg total volume",        emoji: "🏋️", category: "strength" },
  { id: "middleweight",  name: "Middleweight",   description: "Lift 50,000 kg total volume",        emoji: "🦾", category: "strength" },
  { id: "heavyweight",   name: "Heavyweight",    description: "Lift 100,000 kg total volume",       emoji: "💥", category: "strength" },
  // Effort
  { id: "endurance",     name: "Endurance",      description: "Complete a 60+ minute workout",      emoji: "⏱️", category: "effort" },
  { id: "volume_king",   name: "Volume King",    description: "Complete 20+ sets in one session",   emoji: "🧱", category: "effort" },
  { id: "early_bird",    name: "Early Bird",     description: "Log a workout before 7am",           emoji: "🌅", category: "effort" },
  { id: "night_owl",     name: "Night Owl",      description: "Log a workout after 9pm",            emoji: "🌙", category: "effort" },
  { id: "superset_pro",  name: "Superset Pro",   description: "Complete a workout with a superset", emoji: "🔗", category: "effort" },
  // Explorer
  { id: "planner",       name: "Planner",        description: "Start a workout from a template",    emoji: "📋", category: "explorer" },
  { id: "tech_savvy",    name: "Tech Savvy",     description: "Generate a workout with AI",         emoji: "🤖", category: "explorer" },
  { id: "versatile",     name: "Versatile",      description: "Log 10 different exercises",         emoji: "🎨", category: "explorer" },
  { id: "self_aware",    name: "Self-Aware",     description: "Rate RPE on 5 completed sets",       emoji: "💬", category: "explorer" },
]

export function computeAchievements({ workouts, stats, prs }: AchievementInputs): AchievementResult[] {
  const { totalWorkouts, currentStreak, totalWeight } = stats
  const prCount = Object.keys(prs).length
  const sorted = [...workouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Pre-compute derived values
  const maxDuration = workouts.length > 0 ? Math.max(...workouts.map(w => w.duration)) : 0
  const maxSets     = workouts.length > 0 ? Math.max(...workouts.map(w => w.totalSets ?? w.exercises.reduce((s, e) => s + e.sets.length, 0))) : 0
  const uniqueExercises = new Set(workouts.flatMap(w => w.exercises.map(e => e.name)))
  const rpeSetCount = workouts.flatMap(w => w.exercises.flatMap(e => e.sets))
    .filter(s => s.completed && s.rpe != null && s.rpe > 0).length
  const hasEarlyBird   = workouts.some(w => new Date(w.date).getHours() < 7)
  const hasNightOwl    = workouts.some(w => new Date(w.date).getHours() >= 21)
  const hasSuperset    = workouts.some(w => w.exercises.some(e => !!(e as any).supersetGroup))
  const hasTemplate    = workouts.some(w => (w as any).usedTemplate === true)
  const hasAIGenerate  = workouts.some(w => (w as any).usedAIGenerate === true)

  // Helper: date of the Nth workout (1-indexed) when sorted by date asc
  const nthWorkoutDate = (n: number) => sorted[n - 1]?.date

  // Helper: date of first workout matching a condition
  const firstMatchDate = (fn: (w: Workout) => boolean) => sorted.find(fn)?.date

  // Accumulate running total weight to find when a volume threshold was crossed
  const volumeThresholdDate = (threshold: number) => {
    let acc = 0
    for (const w of sorted) {
      acc += w.totalWeight ?? 0
      if (acc >= threshold) return w.date
    }
    return undefined
  }

  // PR date: sort PRs by date, take Nth
  const nthPrDate = (n: number) => {
    const dates = Object.values(prs).map(p => p.date).filter(Boolean).sort()
    return dates[n - 1]
  }

  const results: AchievementResult[] = BADGES.map(badge => {
    let unlocked = false
    let progress = 0
    let total    = 1
    let unlockedAt: string | undefined

    switch (badge.id) {
      // Consistency
      case "first_step":
        total = 1; progress = Math.min(totalWorkouts, 1); unlocked = totalWorkouts >= 1
        if (unlocked) unlockedAt = nthWorkoutDate(1)
        break
      case "on_fire":
        total = 3; progress = Math.min(currentStreak, 3); unlocked = currentStreak >= 3
        break
      case "week_warrior":
        total = 7; progress = Math.min(currentStreak, 7); unlocked = currentStreak >= 7
        break
      case "monthly_grind":
        total = 30; progress = Math.min(currentStreak, 30); unlocked = currentStreak >= 30
        break
      case "regular":
        total = 10; progress = Math.min(totalWorkouts, 10); unlocked = totalWorkouts >= 10
        if (unlocked) unlockedAt = nthWorkoutDate(10)
        break
      case "dedicated":
        total = 25; progress = Math.min(totalWorkouts, 25); unlocked = totalWorkouts >= 25
        if (unlocked) unlockedAt = nthWorkoutDate(25)
        break
      case "elite":
        total = 50; progress = Math.min(totalWorkouts, 50); unlocked = totalWorkouts >= 50
        if (unlocked) unlockedAt = nthWorkoutDate(50)
        break
      case "century":
        total = 100; progress = Math.min(totalWorkouts, 100); unlocked = totalWorkouts >= 100
        if (unlocked) unlockedAt = nthWorkoutDate(100)
        break
      // Strength
      case "first_blood":
        total = 1; progress = Math.min(prCount, 1); unlocked = prCount >= 1
        if (unlocked) unlockedAt = nthPrDate(1)
        break
      case "pr_hunter":
        total = 5; progress = Math.min(prCount, 5); unlocked = prCount >= 5
        if (unlocked) unlockedAt = nthPrDate(5)
        break
      case "pr_machine":
        total = 10; progress = Math.min(prCount, 10); unlocked = prCount >= 10
        if (unlocked) unlockedAt = nthPrDate(10)
        break
      case "pr_legend":
        total = 25; progress = Math.min(prCount, 25); unlocked = prCount >= 25
        if (unlocked) unlockedAt = nthPrDate(25)
        break
      case "lightweight":
        total = 10000; progress = Math.min(totalWeight, 10000); unlocked = totalWeight >= 10000
        if (unlocked) unlockedAt = volumeThresholdDate(10000)
        break
      case "middleweight":
        total = 50000; progress = Math.min(totalWeight, 50000); unlocked = totalWeight >= 50000
        if (unlocked) unlockedAt = volumeThresholdDate(50000)
        break
      case "heavyweight":
        total = 100000; progress = Math.min(totalWeight, 100000); unlocked = totalWeight >= 100000
        if (unlocked) unlockedAt = volumeThresholdDate(100000)
        break
      // Effort
      case "endurance":
        total = 60; progress = Math.min(maxDuration, 60); unlocked = maxDuration >= 60
        if (unlocked) unlockedAt = firstMatchDate(w => w.duration >= 60)
        break
      case "volume_king":
        total = 20; progress = Math.min(maxSets, 20); unlocked = maxSets >= 20
        if (unlocked) unlockedAt = firstMatchDate(w => (w.totalSets ?? w.exercises.reduce((s, e) => s + e.sets.length, 0)) >= 20)
        break
      case "early_bird":
        total = 1; progress = hasEarlyBird ? 1 : 0; unlocked = hasEarlyBird
        if (unlocked) unlockedAt = firstMatchDate(w => new Date(w.date).getHours() < 7)
        break
      case "night_owl":
        total = 1; progress = hasNightOwl ? 1 : 0; unlocked = hasNightOwl
        if (unlocked) unlockedAt = firstMatchDate(w => new Date(w.date).getHours() >= 21)
        break
      case "superset_pro":
        total = 1; progress = hasSuperset ? 1 : 0; unlocked = hasSuperset
        if (unlocked) unlockedAt = firstMatchDate(w => w.exercises.some(e => !!(e as any).supersetGroup))
        break
      // Explorer
      case "planner":
        total = 1; progress = hasTemplate ? 1 : 0; unlocked = hasTemplate
        if (unlocked) unlockedAt = firstMatchDate(w => (w as any).usedTemplate === true)
        break
      case "tech_savvy":
        total = 1; progress = hasAIGenerate ? 1 : 0; unlocked = hasAIGenerate
        if (unlocked) unlockedAt = firstMatchDate(w => (w as any).usedAIGenerate === true)
        break
      case "versatile":
        total = 10; progress = Math.min(uniqueExercises.size, 10); unlocked = uniqueExercises.size >= 10
        break
      case "self_aware":
        total = 5; progress = Math.min(rpeSetCount, 5); unlocked = rpeSetCount >= 5
        break
    }

    return { badge, unlocked, unlockedAt, progress, total }
  })

  return results
}

export function formatProgress(badgeId: string, progress: number, total: number): string {
  switch (badgeId) {
    case "on_fire":
    case "week_warrior":
    case "monthly_grind":
      return `${progress} / ${total} day streak`
    case "first_step":
    case "regular":
    case "dedicated":
    case "elite":
    case "century":
      return `${progress} / ${total} workouts`
    case "first_blood":
    case "pr_hunter":
    case "pr_machine":
    case "pr_legend":
      return `${progress} / ${total} personal records`
    case "lightweight":
    case "middleweight":
    case "heavyweight":
      return `${progress.toLocaleString()} / ${total.toLocaleString()} kg`
    case "endurance":
      return `${progress} / ${total} min (best session)`
    case "volume_king":
      return `${progress} / ${total} sets (best session)`
    case "versatile":
      return `${progress} / ${total} different exercises`
    case "self_aware":
      return `${progress} / ${total} sets rated`
    default:
      return ""
  }
}
