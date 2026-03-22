"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/back-button"
import { FrontBody, BackBody, MUSCLE_LABELS, type Volumes } from "@/components/muscle-heatmap-body"
import { computeSingleWorkoutVolumes, normalizeVolumes, type MuscleGroup } from "@/lib/muscle-mapping"
import { Clock, Dumbbell, TrendingUp, Zap, CheckCircle2, Play } from "lucide-react"
import Link from "next/link"
import type { Workout } from "@/lib/workout-storage"

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function formatTime(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

export default function WorkoutDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [volumes, setVolumes] = useState<Volumes>({})

  useEffect(() => {
    const id = params.id as string
    if (!id) return

    fetch(`/api/workouts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? "Workout not found" : "Failed to load workout")
        return res.json()
      })
      .then((data: Workout) => {
        setWorkout(data)
        const raw = computeSingleWorkoutVolumes(data)
        setVolumes(normalizeVolumes(raw))
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
          <div className="container mx-auto px-4 pt-4 pb-6">
            <div className="flex items-center space-x-3">
              <BackButton />
              <div className="h-6 w-40 bg-muted/20 rounded animate-pulse" />
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6 bg-card border-border">
              <div className="animate-pulse space-y-3">
                <div className="h-5 bg-muted/20 rounded w-1/3" />
                <div className="h-4 bg-muted/20 rounded w-2/3" />
              </div>
            </Card>
          ))}
        </main>
      </div>
    )
  }

  if (error || !workout) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
          <div className="container mx-auto px-4 pt-4 pb-6">
            <div className="flex items-center space-x-3">
              <BackButton />
              <h1 className="text-xl font-bold text-foreground">Workout Details</h1>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6">
          <Card className="p-8 bg-card border-border text-center">
            <p className="text-lg font-semibold text-foreground mb-2">{error || "Workout not found"}</p>
            <p className="text-sm text-muted-foreground mb-4">This workout may have been deleted or doesn&apos;t exist.</p>
            <Button onClick={() => router.push("/workouts")} variant="outline">
              Back to Workouts
            </Button>
          </Card>
        </main>
      </div>
    )
  }

  const totalWeight = workout.exercises.reduce(
    (sum, ex) => sum + ex.sets.reduce((s, set) => s + (set.completed ? (set.weight || 0) * (set.reps || 0) : 0), 0),
    0
  )
  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.completed).length, 0)
  const totalReps = workout.exercises.reduce((sum, ex) => sum + ex.sets.reduce((s, set) => s + (set.completed ? set.reps || 0 : 0), 0), 0)

  const workedMuscles = (Object.entries(volumes) as [MuscleGroup, number][])
    .filter(([, i]) => i > 0)
    .sort(([, a], [, b]) => b - a)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <div className="container mx-auto px-4 pt-4 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BackButton />
              <div>
                <h1 className="text-xl font-bold text-foreground">{workout.name}</h1>
                <p className="text-sm text-muted-foreground">{formatDate(workout.date)}</p>
              </div>
            </div>
            <Link href="/log-workout">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <Play className="h-4 w-4 mr-1" />
                Repeat
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3">
          <Card className="p-3 bg-card border-border text-center">
            <Clock className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{formatDuration(workout.duration)}</p>
            <p className="text-[10px] text-muted-foreground">Duration</p>
          </Card>
          <Card className="p-3 bg-card border-border text-center">
            <Dumbbell className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{workout.exercises.length}</p>
            <p className="text-[10px] text-muted-foreground">Exercises</p>
          </Card>
          <Card className="p-3 bg-card border-border text-center">
            <CheckCircle2 className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{totalSets}</p>
            <p className="text-[10px] text-muted-foreground">Sets</p>
          </Card>
          <Card className="p-3 bg-card border-border text-center">
            <Zap className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">
              {totalWeight > 9999 ? `${(totalWeight / 1000).toFixed(1)}k` : totalWeight.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">kg Volume</p>
          </Card>
        </div>

        {/* Muscle Heatmap */}
        {workedMuscles.length > 0 && (
          <Card className="p-4 bg-card border-border">
            <h3 className="font-semibold text-foreground mb-3">Muscles Worked</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground text-center mb-1 uppercase tracking-widest">Front</p>
                <div className="flex justify-center" style={{ height: 340 }}>
                  <FrontBody v={volumes} showIdle />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground text-center mb-1 uppercase tracking-widest">Back</p>
                <div className="flex justify-center" style={{ height: 340 }}>
                  <BackBody v={volumes} showIdle />
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex flex-wrap gap-1.5">
                {workedMuscles.map(([m, intensity]) => (
                  <span
                    key={m}
                    className="text-[10px] font-semibold px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: `rgba(170,255,0,${(0.1 + intensity * 0.15).toFixed(2)})`,
                      color: `rgba(170,255,0,${(0.6 + intensity * 0.4).toFixed(2)})`,
                    }}
                  >
                    {MUSCLE_LABELS[m]}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-[10px] text-muted-foreground">Low</span>
              <div
                className="h-1.5 w-20 rounded-full"
                style={{ background: "linear-gradient(to right, hsl(0 0% 22%), rgba(170,255,0,0.95))" }}
              />
              <span className="text-[10px] text-muted-foreground">High</span>
            </div>
          </Card>
        )}

        {/* Exercise List */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Exercises</h3>
          {workout.exercises.map((exercise, exIdx) => {
            const completedSets = exercise.sets.filter((s) => s.completed)
            const bestSet = completedSets.reduce(
              (best, s) => (s.weight > (best?.weight ?? 0) ? s : best),
              completedSets[0] || null
            )

            return (
              <Card key={exercise.id || exIdx} className="p-4 bg-card border-border">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground">{exercise.name}</h4>
                    <p className="text-xs text-muted-foreground">{exercise.category}</p>
                  </div>
                  {bestSet && bestSet.weight > 0 && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Best: {bestSet.weight} kg × {bestSet.reps}
                    </Badge>
                  )}
                </div>

                {/* Sets table */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="grid grid-cols-4 gap-0 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/10 px-3 py-2">
                    <span>Set</span>
                    <span className="text-center">Weight</span>
                    <span className="text-center">Reps</span>
                    <span className="text-right">Volume</span>
                  </div>
                  {exercise.sets.map((set, setIdx) => (
                    <div
                      key={setIdx}
                      className={`grid grid-cols-4 gap-0 px-3 py-2 text-sm ${
                        set.completed ? "" : "opacity-40"
                      } ${setIdx % 2 === 0 ? "" : "bg-muted/5"}`}
                    >
                      <span className="text-muted-foreground">{setIdx + 1}</span>
                      <span className="text-center text-foreground font-medium">
                        {set.weight > 0 ? `${set.weight} kg` : "—"}
                      </span>
                      <span className="text-center text-foreground font-medium">
                        {set.reps > 0 ? set.reps : "—"}
                      </span>
                      <span className="text-right text-muted-foreground">
                        {set.completed && set.weight > 0 && set.reps > 0
                          ? `${(set.weight * set.reps).toLocaleString()} kg`
                          : "—"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Exercise summary */}
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span>{completedSets.length}/{exercise.sets.length} sets completed</span>
                  <span>{completedSets.reduce((s, set) => s + set.reps, 0)} total reps</span>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Session Info */}
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold text-foreground mb-2">Session Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="text-foreground">{formatDate(workout.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time</span>
              <span className="text-foreground">{formatTime(workout.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="text-foreground">{formatDuration(workout.duration)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Volume</span>
              <span className="text-foreground">{totalWeight.toLocaleString()} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Reps</span>
              <span className="text-foreground">{totalReps}</span>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
