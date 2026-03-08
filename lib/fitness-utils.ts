// Shared fitness utilities — used by onboarding, dashboard, and workout-complete pages

export type Goal = "muscle" | "fat_loss" | "strength" | "fitness"
export type Experience = "beginner" | "intermediate" | "advanced"
export type Equipment = "gym" | "home_gym" | "dumbbells"

export interface FitnessProfile {
  goal?: Goal
  experienceLevel?: Experience
  height?: number
  weight?: number
  age?: number
  workoutDaysPerWeek?: number
  equipment?: Equipment
  onboardingCompleted?: boolean
}

// ─── AI Insight (rule-based program recommendation) ──────────────────────────

export function getInsight(p: Partial<FitnessProfile>): { program: string; description: string } {
  const { goal, experienceLevel, workoutDaysPerWeek = 4 } = p
  if (goal === "strength") {
    return {
      program: workoutDaysPerWeek <= 3 ? "3-day Strength Program" : "4-day Upper/Lower Strength",
      description: "Heavy compound lifts with progressive overload to build raw strength.",
    }
  }
  if (goal === "fat_loss") {
    return {
      program: `${workoutDaysPerWeek}-day Metabolic Conditioning`,
      description: "Strength training combined with cardio to maximise calorie burn.",
    }
  }
  if (goal === "muscle") {
    if (experienceLevel === "beginner") {
      return {
        program: "3-day Full Body Split",
        description: "Full-body sessions 3× per week — the fastest way to build your foundation.",
      }
    }
    return {
      program: workoutDaysPerWeek >= 5 ? "5-day PPL Split" : "4-day Upper/Lower Split",
      description: "Optimised volume and frequency to maximise muscle growth.",
    }
  }
  // fitness
  return {
    program: "3-day Full Body Fitness",
    description: "Balanced mix of strength, cardio and mobility to keep you feeling great.",
  }
}

// ─── AI Coach tips (rule-based, keyed to goal) ────────────────────────────────

const TIPS: Record<string, string[]> = {
  muscle: [
    "Progressive overload is the #1 driver of muscle growth. Add 2.5 kg each week you hit your rep target.",
    "Aim for 1.6–2.2 g of protein per kg of body weight daily to support muscle repair.",
    "Sleep is when you grow. 7–9 hours accelerates recovery more than any supplement.",
    "Mind-muscle connection matters. Slow the eccentric (lowering) phase to 2–3 seconds.",
    "Deload every 4–6 weeks — drop volume by 40% to let connective tissue recover.",
  ],
  strength: [
    "Train the big 3 (squat, bench, deadlift) at least 2× per week for maximum strength gains.",
    "Rest 3–5 minutes between heavy compound sets to fully restore ATP for the next set.",
    "Grip strength limits progress. Add 2 sets of heavy farmer carries each week.",
    "Video your lifts occasionally — form breaks down gradually and is hard to feel.",
    "Eat at a small surplus (200–300 kcal) to fuel strength progress without excessive fat gain.",
  ],
  fat_loss: [
    "Resistance training preserves muscle while cutting — never skip it on a fat-loss phase.",
    "A 300–500 kcal daily deficit is the sweet spot: fast enough to see results, slow enough to keep muscle.",
    "NEAT (daily steps, fidgeting) burns more calories than most gym sessions. Aim for 8,000+ steps.",
    "Eat protein first at every meal — it keeps you full and protects lean mass.",
    "Cardio after weights: your glycogen is lower, so the body draws more from fat stores.",
  ],
  fitness: [
    "Consistency beats intensity. Four 45-minute sessions beats one 3-hour session every time.",
    "Mobility work for 10 minutes post-session prevents the stiffness that derails training.",
    "Track one metric per month (push-up count, resting HR) to stay motivated without obsessing.",
    "Add one new movement per month to keep sessions fresh and challenge new muscle patterns.",
    "Recovery is training. Active rest days (walk, stretch, swim) outperform total rest.",
  ],
}

export function getAICoachTip(goal: string, workoutCount: number): string {
  const tips = TIPS[goal] ?? TIPS.fitness
  const day = new Date().getDay()
  return tips[(day + workoutCount) % tips.length]
}

// ─── Goal label helpers ───────────────────────────────────────────────────────

export const GOAL_LABELS: Record<string, string> = {
  muscle: "Build Muscle 💪",
  fat_loss: "Lose Fat 🔥",
  strength: "Strength 🏋️",
  fitness: "Stay Fit ⚡",
}

export const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: "Beginner 🌱",
  intermediate: "Intermediate 💪",
  advanced: "Advanced 🏆",
}

// ─── Personalized template generation ────────────────────────────────────────

interface ExerciseSpec {
  name: string
  category: string
  sets: number
}

export interface TemplateSpec {
  name: string
  exercises: ExerciseSpec[]
}

const EXERCISES: Record<string, ExerciseSpec> = {
  squats:      { name: "Barbell Squats",           category: "Legs",      sets: 3 },
  bench:       { name: "Bench Press",              category: "Chest",     sets: 4 },
  rows:        { name: "Barbell Rows",             category: "Back",      sets: 4 },
  deadlifts:   { name: "Deadlifts",                category: "Back",      sets: 3 },
  ohp:         { name: "Overhead Press",           category: "Shoulders", sets: 3 },
  pullups:     { name: "Pull-ups",                 category: "Back",      sets: 3 },
  frontSquat:  { name: "Front Squats",             category: "Legs",      sets: 3 },
  inclineDB:   { name: "Incline Dumbbell Press",   category: "Chest",     sets: 3 },
  latPulldown: { name: "Lat Pulldown",             category: "Back",      sets: 3 },
  curls:       { name: "Bicep Curls",              category: "Arms",      sets: 3 },
  tricepDips:  { name: "Tricep Dips",              category: "Arms",      sets: 3 },
  lateralRais: { name: "Lateral Raises",           category: "Shoulders", sets: 3 },
  hammerCurls: { name: "Hammer Curls",             category: "Arms",      sets: 3 },
  cgBench:     { name: "Close-Grip Bench Press",   category: "Arms",      sets: 3 },
  rdl:         { name: "Romanian Deadlifts",       category: "Legs",      sets: 3 },
  lunges:      { name: "Walking Lunges",           category: "Legs",      sets: 3 },
  calfRaises:  { name: "Calf Raises",              category: "Legs",      sets: 4 },
  legPress:    { name: "Leg Press",                category: "Legs",      sets: 3 },
  legCurls:    { name: "Leg Curls",               category: "Legs",      sets: 3 },
  hipThrusts:  { name: "Hip Thrusts",              category: "Legs",      sets: 3 },
  cableRows:   { name: "Seated Cable Rows",        category: "Back",      sets: 3 },
  facePulls:   { name: "Face Pulls",               category: "Shoulders", sets: 3 },
  dbRows:      { name: "Single-Arm Dumbbell Rows", category: "Back",      sets: 3 },
  hackSquats:  { name: "Hack Squats",              category: "Legs",      sets: 3 },
  legExt:      { name: "Leg Extensions",           category: "Legs",      sets: 3 },
  arnoldPress: { name: "Arnold Press",             category: "Shoulders", sets: 3 },
  ohtricep:    { name: "Overhead Tricep Extension",category: "Arms",      sets: 3 },
  incCurls:    { name: "Incline Dumbbell Curls",   category: "Arms",      sets: 3 },
}

const TEMPLATE_LIBRARY: Record<string, TemplateSpec> = {
  "Full Body A": {
    name: "Full Body A",
    exercises: [EXERCISES.squats, EXERCISES.bench, EXERCISES.rows],
  },
  "Full Body B": {
    name: "Full Body B",
    exercises: [EXERCISES.deadlifts, EXERCISES.ohp, EXERCISES.pullups],
  },
  "Full Body C": {
    name: "Full Body C",
    exercises: [EXERCISES.frontSquat, EXERCISES.inclineDB, EXERCISES.latPulldown],
  },
  "Upper A": {
    name: "Upper A",
    exercises: [EXERCISES.bench, EXERCISES.rows, EXERCISES.ohp, EXERCISES.curls, EXERCISES.tricepDips],
  },
  "Upper B": {
    name: "Upper B",
    exercises: [EXERCISES.inclineDB, EXERCISES.pullups, EXERCISES.lateralRais, EXERCISES.hammerCurls, EXERCISES.cgBench],
  },
  "Lower A": {
    name: "Lower A",
    exercises: [EXERCISES.squats, EXERCISES.rdl, EXERCISES.lunges, EXERCISES.calfRaises],
  },
  "Lower B": {
    name: "Lower B",
    exercises: [EXERCISES.deadlifts, EXERCISES.legPress, EXERCISES.legCurls, EXERCISES.hipThrusts],
  },
  "Push": {
    name: "Push",
    exercises: [EXERCISES.bench, EXERCISES.ohp, EXERCISES.inclineDB, EXERCISES.lateralRais, EXERCISES.tricepDips],
  },
  "Pull": {
    name: "Pull",
    exercises: [EXERCISES.rows, EXERCISES.pullups, EXERCISES.cableRows, EXERCISES.curls, EXERCISES.hammerCurls],
  },
  "Legs": {
    name: "Legs",
    exercises: [EXERCISES.squats, EXERCISES.rdl, EXERCISES.legPress, EXERCISES.legCurls, EXERCISES.calfRaises],
  },
  "Push A": {
    name: "Push A",
    exercises: [EXERCISES.bench, EXERCISES.ohp, EXERCISES.inclineDB, EXERCISES.lateralRais, EXERCISES.tricepDips],
  },
  "Pull A": {
    name: "Pull A",
    exercises: [EXERCISES.rows, EXERCISES.pullups, EXERCISES.cableRows, EXERCISES.curls, EXERCISES.hammerCurls],
  },
  "Legs A": {
    name: "Legs A",
    exercises: [EXERCISES.squats, EXERCISES.rdl, EXERCISES.legPress, EXERCISES.legCurls, EXERCISES.calfRaises],
  },
  "Push B": {
    name: "Push B",
    exercises: [EXERCISES.inclineDB, EXERCISES.arnoldPress, EXERCISES.lateralRais, EXERCISES.ohtricep, EXERCISES.cgBench],
  },
  "Pull B": {
    name: "Pull B",
    exercises: [EXERCISES.dbRows, EXERCISES.facePulls, EXERCISES.latPulldown, EXERCISES.incCurls, EXERCISES.hammerCurls],
  },
  "Legs B": {
    name: "Legs B",
    exercises: [EXERCISES.hackSquats, EXERCISES.lunges, EXERCISES.legExt, EXERCISES.hipThrusts, EXERCISES.calfRaises],
  },
}

const SCHEDULE: Record<number, string[]> = {
  3: ["Full Body A", "Full Body B", "Full Body C"],
  4: ["Upper A", "Lower A", "Upper B", "Lower B"],
  5: ["Push", "Pull", "Legs", "Upper A", "Lower A"],
  6: ["Push A", "Pull A", "Legs A", "Push B", "Pull B", "Legs B"],
}

export function getPersonalizedTemplates(profile: Partial<FitnessProfile>): TemplateSpec[] {
  const days = profile.workoutDaysPerWeek ?? 4
  // Clamp to nearest supported schedule
  const key = days <= 3 ? 3 : days === 4 ? 4 : days === 5 ? 5 : 6
  const names = SCHEDULE[key] ?? SCHEDULE[4]
  return names.map((n) => TEMPLATE_LIBRARY[n]).filter(Boolean)
}
