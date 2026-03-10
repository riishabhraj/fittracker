"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/back-button"
import { Sparkles, Dumbbell, ChevronRight, RotateCcw } from "lucide-react"
import { toast } from "sonner"

// ─── Form config ──────────────────────────────────────────────────────────────

const GOALS = [
  { value: "Build Muscle",     emoji: "💪" },
  { value: "Lose Fat",         emoji: "🔥" },
  { value: "Build Strength",   emoji: "🏋️" },
  { value: "General Fitness",  emoji: "⚡" },
]

const EQUIPMENT = [
  { value: "Full Gym",        emoji: "🏋️" },
  { value: "Home Gym",        emoji: "🏠" },
  { value: "Dumbbells Only",  emoji: "🥊" },
  { value: "Bodyweight Only", emoji: "🤸" },
]

const MUSCLES = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core"]

const DURATIONS = [15, 30, 45, 60, 75, 90]

const DIFFICULTIES = [
  { value: "Beginner",     color: "#4ade80" },
  { value: "Intermediate", color: "#fbbf24" },
  { value: "Advanced",     color: "#f87171" },
]

// ─── Result types ─────────────────────────────────────────────────────────────

interface AIExercise {
  name: string
  category: string
  sets: number
  reps: number
  notes?: string
}

interface AIWorkout {
  workoutName: string
  exercises: AIExercise[]
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Chip({
  label,
  selected,
  onClick,
  color,
}: {
  label: string
  selected: boolean
  onClick: () => void
  color?: string
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-2 rounded-xl text-sm font-medium border transition-all"
      style={
        selected
          ? {
              backgroundColor: color ?? "hsl(80 100% 50%)",
              color: color ? "#fff" : "hsl(0 0% 6%)",
              borderColor: color ?? "hsl(80 100% 50%)",
            }
          : { backgroundColor: "transparent", color: "hsl(0 0% 55%)", borderColor: "hsl(0 0% 18%)" }
      }
    >
      {label}
    </button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
        {title}
      </p>
      {children}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GenerateWorkoutPage() {
  const router = useRouter()

  const [goal, setGoal] = useState("Build Muscle")
  const [duration, setDuration] = useState(45)
  const [equipment, setEquipment] = useState("Full Gym")
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState("Intermediate")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AIWorkout | null>(null)

  const toggleMuscle = (m: string) =>
    setSelectedMuscles((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    )

  const generate = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/ai/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          duration,
          equipment,
          muscles: selectedMuscles.length > 0 ? selectedMuscles.join(", ") : "full body",
          difficulty,
        }),
      })

      if (res.status === 429) {
        toast.error("Daily limit reached (10 AI workouts/day). Try again tomorrow.")
        return
      }
      if (res.status === 503) {
        toast.error("AI generator not configured — add ANTHROPIC_API_KEY to .env.local.")
        return
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error ?? "Failed to generate workout. Please try again.")
        return
      }

      const workout: AIWorkout = await res.json()
      if (!workout.workoutName || !Array.isArray(workout.exercises) || workout.exercises.length === 0) {
        toast.error("AI returned an unexpected format. Please try again.")
        return
      }
      // Sanitise each exercise — fill in defaults for any missing fields
      workout.exercises = workout.exercises.map((ex) => ({
        name: ex.name ?? "Unknown Exercise",
        category: ex.category ?? "Other",
        sets: Math.max(1, Number(ex.sets) || 3),
        reps: Math.max(1, Number(ex.reps) || 10),
        notes: ex.notes ?? "",
      }))
      setResult(workout)
    } catch {
      toast.error("Network error. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  const startWorkout = () => {
    if (!result) return
    sessionStorage.setItem("fittracker_ai_workout", JSON.stringify(result))
    router.push("/log-workout?source=ai")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="px-5 pt-4 pb-5 flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Workout</h1>
            <p className="text-sm text-muted-foreground">Generate a personalised plan</p>
          </div>
        </div>
      </header>

      <main className="px-5 py-5 space-y-5 pb-28">
        {/* Form card */}
        <Card className="p-4 bg-card border-border space-y-5">
          {/* Goal */}
          <Section title="Goal">
            <div className="grid grid-cols-2 gap-2">
              {GOALS.map(({ value, emoji }) => (
                <Chip
                  key={value}
                  label={`${emoji} ${value}`}
                  selected={goal === value}
                  onClick={() => setGoal(value)}
                />
              ))}
            </div>
          </Section>

          {/* Duration */}
          <Section title={`Duration — ${duration} min`}>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <Chip
                  key={d}
                  label={`${d}m`}
                  selected={duration === d}
                  onClick={() => setDuration(d)}
                />
              ))}
            </div>
          </Section>

          {/* Equipment */}
          <Section title="Equipment">
            <div className="grid grid-cols-2 gap-2">
              {EQUIPMENT.map(({ value, emoji }) => (
                <Chip
                  key={value}
                  label={`${emoji} ${value}`}
                  selected={equipment === value}
                  onClick={() => setEquipment(value)}
                />
              ))}
            </div>
          </Section>

          {/* Muscle focus */}
          <Section title="Muscle Focus (optional)">
            <div className="flex flex-wrap gap-2">
              {MUSCLES.map((m) => (
                <Chip
                  key={m}
                  label={m}
                  selected={selectedMuscles.includes(m)}
                  onClick={() => toggleMuscle(m)}
                />
              ))}
            </div>
          </Section>

          {/* Difficulty */}
          <Section title="Difficulty">
            <div className="flex gap-2">
              {DIFFICULTIES.map(({ value, color }) => (
                <Chip
                  key={value}
                  label={value}
                  selected={difficulty === value}
                  onClick={() => setDifficulty(value)}
                  color={color}
                />
              ))}
            </div>
          </Section>
        </Card>

        {/* Generate button */}
        <Button
          className="w-full h-13 text-base font-semibold"
          style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
          onClick={generate}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-[hsl(0_0%_6%)] border-t-transparent rounded-full animate-spin" />
              Generating…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Generate Workout
            </span>
          )}
        </Button>

        {/* Result */}
        {result && (
          <div className="space-y-3">
            {/* Workout name header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-0.5">
                  AI Generated
                </p>
                <h2 className="text-lg font-bold text-foreground">{result.workoutName}</h2>
                <p className="text-xs text-muted-foreground">
                  {result.exercises.length} exercises · {duration} min · {difficulty}
                </p>
              </div>
              <button
                onClick={generate}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Regenerate
              </button>
            </div>

            {/* Exercise list */}
            <Card className="divide-y divide-border bg-card border-border overflow-hidden">
              {result.exercises.map((ex, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Dumbbell className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{ex.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {ex.sets} sets × {ex.reps} reps
                      {ex.notes ? ` · ${ex.notes}` : ""}
                    </p>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground shrink-0 bg-muted/20 px-2 py-0.5 rounded-full">
                    {ex.category}
                  </span>
                </div>
              ))}
            </Card>

            {/* Start workout CTA */}
            <Button
              className="w-full h-12 font-semibold text-sm flex items-center gap-2"
              style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
              onClick={startWorkout}
            >
              Start Workout
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
