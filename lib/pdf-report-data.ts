import { getWorkouts, calculateStreak, computePersonalRecords, type Workout } from "./workout-storage"
import { getGoals } from "./goal-storage"
import { computeMuscleVolumes, type MuscleGroup } from "./muscle-mapping"

export interface ReportData {
  generatedAt: string
  summary: {
    totalWorkouts: number
    currentStreak: number
    totalVolume: number
    totalDuration: number
    mostTrainedMuscle: string
    avgWorkoutsPerWeek: number
  }
  workoutHistory: Array<{
    date: string
    name: string
    exerciseCount: number
    totalVolume: number
    duration: number
  }>
  muscleBreakdown: Array<{ muscle: string; volume: number }>
  personalRecords: Array<{ exercise: string; weight: number; reps: number; date: string }>
  goals: Array<{ title: string; current: number; target: number; unit: string; completed: boolean }>
}

const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: "Chest", front_delts: "Front Delts", side_delts: "Side Delts",
  rear_delts: "Rear Delts", biceps: "Biceps", triceps: "Triceps",
  forearms: "Forearms", abs: "Abs", obliques: "Obliques",
  quads: "Quads", hamstrings: "Hamstrings", glutes: "Glutes",
  calves: "Calves", lats: "Lats", traps: "Traps", lower_back: "Lower Back",
}

export async function buildReportData(): Promise<ReportData> {
  const [workouts, goals] = await Promise.all([getWorkouts(), getGoals()])

  const sorted = [...workouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // Summary
  const totalVolume = workouts.reduce((s, w) => s + w.totalWeight, 0)
  const totalDuration = workouts.reduce((s, w) => s + w.duration, 0)
  const streak = calculateStreak(workouts)

  // Avg workouts per week
  let avgWorkoutsPerWeek = 0
  if (workouts.length >= 2) {
    const dates = workouts.map((w) => new Date(w.date).getTime())
    const spanMs = Math.max(...dates) - Math.min(...dates)
    const spanWeeks = Math.max(spanMs / (7 * 24 * 60 * 60 * 1000), 1)
    avgWorkoutsPerWeek = Math.round((workouts.length / spanWeeks) * 10) / 10
  } else {
    avgWorkoutsPerWeek = workouts.length
  }

  // Muscle volumes (all time)
  const muscleVols = computeMuscleVolumes(workouts, 99999)
  const muscleBreakdown = (Object.entries(muscleVols) as [MuscleGroup, number][])
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([m, v]) => ({ muscle: MUSCLE_LABELS[m], volume: Math.round(v) }))

  const mostTrainedMuscle = muscleBreakdown.length > 0 ? muscleBreakdown[0].muscle : "N/A"

  // PRs
  const prMap = computePersonalRecords(workouts)
  const personalRecords = Object.entries(prMap)
    .map(([exercise, pr]) => ({ exercise, ...pr }))
    .filter((pr) => pr.weight > 0)
    .sort((a, b) => b.weight - a.weight)

  // Workout history (last 50)
  const workoutHistory = sorted.slice(0, 50).map((w) => ({
    date: w.date,
    name: w.name,
    exerciseCount: w.exercises.length,
    totalVolume: w.totalWeight,
    duration: w.duration,
  }))

  // Goals
  const goalRows = goals.map((g) => ({
    title: g.title,
    current: g.current,
    target: g.target,
    unit: g.unit,
    completed: g.completed,
  }))

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalWorkouts: workouts.length,
      currentStreak: streak,
      totalVolume,
      totalDuration,
      mostTrainedMuscle,
      avgWorkoutsPerWeek,
    },
    workoutHistory,
    muscleBreakdown,
    personalRecords,
    goals: goalRows,
  }
}
