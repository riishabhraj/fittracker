"use client"

import { useState, useEffect, Suspense } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Play, Pause, Check, Activity } from "lucide-react"
import Image from "next/image"
import { WorkoutTimer } from "@/components/workout-timer"
import { ExerciseLogger } from "@/components/exercise-logger"
import { ExerciseSelector, EXERCISE_TYPE_MAP, type ExerciseType } from "@/components/exercise-selector"
import { SupersetBracket } from "@/components/superset-bracket"
import { BackButton } from "@/components/back-button"
import { templates } from "@/components/workout-templates"
import {
  saveWorkout,
  getWorkouts,
  computePersonalRecords,
  getExerciseHistoryFromWorkouts,
  type Workout,
} from "@/lib/workout-storage"
import {
  clearWorkoutSession,
  getWorkoutSession,
  useWorkoutSessionAutoSave,
} from "@/lib/workout-session-storage"
import { computeSuggestion, type SuggestedSet } from "@/lib/progressive-overload"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

// ─── Local types ──────────────────────────────────────────────────────────────

interface ExerciseSet {
  reps: number
  weight: number
  completed: boolean
  estimated1RM?: number
  rpe?: number
}

interface Exercise {
  id: string
  name: string
  category: string
  sets: ExerciseSet[]
  supersetGroup?: string
  exerciseType?: ExerciseType
  usedTemplate?: boolean
  usedAIGenerate?: boolean
}

// ─── Main component ───────────────────────────────────────────────────────────

function LogWorkoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get("template")
  const source = searchParams.get("source")
  const { saveSession } = useWorkoutSessionAutoSave()

  const [workoutName, setWorkoutName] = useState("New Workout")
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [isWorkoutActive, setIsWorkoutActive] = useState(false)
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null)
  const [workoutDuration, setWorkoutDuration] = useState(0)
  const [showExerciseSelector, setShowExerciseSelector] = useState(false)
  const [sessionLoaded, setSessionLoaded] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Single cache of all workouts — used for both PRs and suggestions
  const [existingPRs, setExistingPRs] = useState<
    Record<string, { weight: number; reps: number; date: string }>
  >({})
  const [suggestions, setSuggestions] = useState<Record<string, SuggestedSet | null>>({})
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([])

  // ── One fetch on mount for PRs + history ────────────────────────────────────
  useEffect(() => {
    getWorkouts()
      .then((workouts) => {
        setAllWorkouts(workouts)
        setExistingPRs(computePersonalRecords(workouts))
      })
      .catch(() => {})
  }, [])

  // Recompute suggestion whenever an exercise is added or allWorkouts loads
  useEffect(() => {
    if (allWorkouts.length === 0 && exercises.length === 0) return
    const newSuggestions: Record<string, SuggestedSet | null> = {}
    exercises.forEach((ex) => {
      if (!(ex.name in suggestions)) {
        const history = getExerciseHistoryFromWorkouts(allWorkouts, ex.name)
        newSuggestions[ex.name] = computeSuggestion(history)
      }
    })
    if (Object.keys(newSuggestions).length > 0) {
      setSuggestions((prev) => ({ ...prev, ...newSuggestions }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercises.length, allWorkouts])

  // ── Load session / template ──────────────────────────────────────────────────
  useEffect(() => {
    // ── AI-generated workout from /generate-workout ──────────────────────────
    if (source === "ai") {
      clearWorkoutSession()
      try {
        const raw = sessionStorage.getItem("fittracker_ai_workout")
        if (raw) {
          sessionStorage.removeItem("fittracker_ai_workout")
          const aiWorkout = JSON.parse(raw) as { workoutName: string; exercises: Array<{ name: string; category: string; sets: number; reps: number }> }
          setWorkoutName(aiWorkout.workoutName)
          const aiExercises: Exercise[] = aiWorkout.exercises.map((ex, i) => ({
            id: `ai-${i}-${Date.now()}`,
            name: ex.name ?? "Exercise",
            category: ex.category ?? "Other",
            exerciseType: EXERCISE_TYPE_MAP[ex.name] ?? "weighted",
            sets: Array(Math.max(1, Number(ex.sets) || 3)).fill(null).map(() => ({
              reps: Math.max(1, Number(ex.reps) || 10),
              weight: 0,
              completed: false,
            })),
          }))
          setExercises(aiExercises)
          setIsWorkoutActive(true)
          toast.success(`✨ ${aiWorkout.workoutName} loaded!`)
        } else {
          toast.error("AI workout data not found. Please generate a new workout.")
        }
      } catch {
        toast.error("Failed to load AI workout.")
      }
      setSessionLoaded(true)
      return
    }

    const existingSession = getWorkoutSession()

    if (existingSession && !templateId) {
      setWorkoutName(existingSession.workoutName)
      setExercises(existingSession.exercises as Exercise[])
      setIsWorkoutActive(existingSession.isWorkoutActive)
      setWorkoutDuration(existingSession.workoutDuration)
      if (existingSession.workoutStartTime) {
        setWorkoutStartTime(new Date(existingSession.workoutStartTime))
      }
      toast.success("🔄 Resumed your workout session!")
      setSessionLoaded(true)
    } else if (templateId) {
      clearWorkoutSession()
      const isUserTemplate = /^[0-9a-f]{24}$/i.test(templateId)

      if (isUserTemplate) {
        ;(async () => {
          try {
            const res = await fetch(`/api/templates/${templateId}`)
            if (res.ok) {
              const userTemplate = await res.json()
              setWorkoutName(userTemplate.name)
              const templateExercises: Exercise[] = userTemplate.exercises.map(
                (
                  exercise: {
                    name: string
                    category: string
                    sets: Array<{ reps: number; weight: number }>
                  },
                  index: number
                ) => ({
                  id: `template-${index}-${Date.now()}`,
                  name: exercise.name,
                  category: exercise.category,
                  exerciseType: EXERCISE_TYPE_MAP[exercise.name] ?? "weighted",
                  sets:
                    exercise.sets.length > 0
                      ? exercise.sets.map((s) => ({
                          reps: s.reps,
                          weight: s.weight,
                          completed: false,
                        }))
                      : [{ reps: 0, weight: 0, completed: false }],
                })
              )
              setExercises(templateExercises)
              setIsWorkoutActive(true)
              toast.success(
                `📋 Loaded ${userTemplate.name} with ${userTemplate.exercises.length} exercises!`
              )
            }
          } catch {
            toast.error("Failed to load template")
          }
          setSessionLoaded(true)
        })()
      } else {
        const template = templates.find((t) => t.id === templateId)
        if (template) {
          setWorkoutName(template.name)
          const templateExercises: Exercise[] = template.exerciseList.map(
            (exercise, index) => ({
              id: `template-${index}-${Date.now()}`,
              name: exercise.name,
              category: exercise.category,
              exerciseType: EXERCISE_TYPE_MAP[exercise.name] ?? "weighted",
              sets: Array(exercise.sets)
                .fill(null)
                .map(() => ({ reps: 0, weight: 0, completed: false })),
            })
          )
          setExercises(templateExercises)
          setIsWorkoutActive(true)
          toast.success(
            `📋 Loaded ${template.name} template with ${template.exerciseList.length} exercises!`
          )
        }
        setSessionLoaded(true)
      }
    } else {
      setSessionLoaded(true)
    }
  }, [templateId, source])

  // ── Auto-save session ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionLoaded) return
    const timeoutId = setTimeout(() => {
      saveSession({
        workoutName,
        exercises,
        isWorkoutActive,
        workoutStartTime: workoutStartTime?.toISOString() || null,
        workoutDuration,
        templateId,
      })
    }, 1000)
    return () => clearTimeout(timeoutId)
  }, [workoutName, exercises, isWorkoutActive, workoutStartTime, workoutDuration, templateId, saveSession, sessionLoaded])

  // ── Timer ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isWorkoutActive && !workoutStartTime) setWorkoutStartTime(new Date())
  }, [isWorkoutActive, workoutStartTime])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isWorkoutActive && workoutStartTime) {
      interval = setInterval(() => {
        const duration = Math.floor(
          (Date.now() - workoutStartTime.getTime()) / 1000 / 60
        )
        setWorkoutDuration(duration)
      }, 1000)
    }
    return () => { if (interval) clearInterval(interval) }
  }, [isWorkoutActive, workoutStartTime])

  // ── Exercise actions ─────────────────────────────────────────────────────────
  const addExercise = (exercise: { name: string; category: string; exerciseType: ExerciseType }) => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: exercise.name,
      category: exercise.category,
      exerciseType: exercise.exerciseType,
      sets: [{ reps: 0, weight: 0, completed: false }],
    }
    setExercises((prev) => [...prev, newExercise])
    setShowExerciseSelector(false)
    if (exercises.length === 0) setIsWorkoutActive(true)
  }

  const updateExercise = (exerciseId: string, updatedExercise: Exercise) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === exerciseId ? updatedExercise : ex))
    )
  }

  const removeExercise = (exerciseId: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId))
  }

  // ── Superset actions ─────────────────────────────────────────────────────────
  const linkAsSuperset = (exerciseId: string) => {
    setExercises((prev) => {
      const idx = prev.findIndex((ex) => ex.id === exerciseId)
      if (idx === -1 || idx >= prev.length - 1) return prev
      const groupId = `ss-${Date.now()}`
      return prev.map((ex, i) =>
        i === idx || i === idx + 1 ? { ...ex, supersetGroup: groupId } : ex
      )
    })
    toast.success("Superset created!")
  }

  const unlinkSuperset = (exerciseId: string) => {
    setExercises((prev) => {
      const ex = prev.find((e) => e.id === exerciseId)
      if (!ex?.supersetGroup) return prev
      const groupId = ex.supersetGroup
      return prev.map((e) =>
        e.supersetGroup === groupId ? { ...e, supersetGroup: undefined } : e
      )
    })
  }

  // ── Finish workout ───────────────────────────────────────────────────────────
  const finishWorkout = async () => {
    if (isSaving) return
    if (exercises.length === 0) {
      toast.error("Please add at least one exercise to finish the workout")
      return
    }
    const hasCompletedSets = exercises.some((ex) =>
      ex.sets.some((set) => set.completed)
    )
    if (!hasCompletedSets) {
      toast.error("Please complete at least one set to finish the workout")
      return
    }

    setIsSaving(true)
    try {
      const completedExercises = exercises
        .map((ex) => ({
          id: ex.id,
          name: ex.name,
          category: ex.category,
          supersetGroup: ex.supersetGroup,
          sets: ex.sets
            .filter((set) => set.completed)
            .map((set) => ({
              reps: set.reps,
              weight: set.weight,
              completed: set.completed,
              estimated1RM: set.estimated1RM,
              rpe: set.rpe,
              restTime: 0,
            })),
        }))
        .filter((ex) => ex.sets.length > 0)

      const totalSets = completedExercises.reduce((sum, ex) => sum + ex.sets.length, 0)
      const totalReps = completedExercises.reduce(
        (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.reps, 0),
        0
      )
      const totalWeight = completedExercises.reduce(
        (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0),
        0
      )

      const workout: Workout = {
        id: Date.now().toString(),
        name: workoutName.trim() || "Untitled Workout",
        date: (workoutStartTime || new Date()).toISOString(),
        duration: workoutDuration,
        exercises: completedExercises,
        totalSets,
        totalReps,
        totalWeight,
        usedTemplate: !!templateId,
        usedAIGenerate: source === "ai",
      }

      // PR detection using PRs loaded at session start
      const newPRNames: string[] = []
      completedExercises.forEach((ex) => {
        const bestSet = ex.sets.reduce(
          (best, set) =>
            !best ||
            set.weight > best.weight ||
            (set.weight === best.weight && set.reps > best.reps)
              ? set
              : best,
          null as (typeof ex.sets)[0] | null
        )
        if (!bestSet) return
        const prev = existingPRs[ex.name]
        const isPR =
          !prev ||
          bestSet.weight > prev.weight ||
          (bestSet.weight === prev.weight && bestSet.reps > prev.reps)
        if (isPR) newPRNames.push(ex.name)
      })

      await saveWorkout(workout)
      clearWorkoutSession()

      const topExercise = completedExercises.reduce((top, ex) => {
        const vol = ex.sets.reduce((s, set) => s + set.weight * set.reps, 0)
        const topVol = top.sets.reduce((s, set) => s + set.weight * set.reps, 0)
        return vol > topVol ? ex : top
      }, completedExercises[0])

      const params = new URLSearchParams({
        name: workout.name,
        sets: String(totalSets),
        reps: String(totalReps),
        weight: String(Math.round(totalWeight)),
        duration: String(workoutDuration),
        exercises: String(completedExercises.length),
        topExercise: topExercise?.name ?? "",
        topWeight: String(topExercise?.sets[0]?.weight ?? 0),
        prCount: String(newPRNames.length),
        prNames: newPRNames.join(","),
      })
      router.push(`/workout-complete?${params}`)
    } catch (error) {
      console.error("Error saving workout:", error)
      toast.error("Failed to save workout. Please try again.")
      setIsSaving(false)
    }
  }

  const cancelWorkout = () => {
    if (exercises.length > 0) {
      const hasData = exercises.some((ex) =>
        ex.sets.some((set) => set.reps > 0 || set.weight > 0)
      )
      if (hasData) {
        if (confirm("⚠️ Are you sure you want to cancel? All progress will be lost.")) {
          clearWorkoutSession()
          router.push("/")
        }
      } else {
        clearWorkoutSession()
        router.push("/")
      }
    } else {
      clearWorkoutSession()
      router.push("/")
    }
  }

  if (showExerciseSelector) {
    return (
      <ExerciseSelector
        onSelect={addExercise}
        onClose={() => setShowExerciseSelector(false)}
      />
    )
  }

  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0)
  const completedSets = exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((set) => set.completed).length,
    0
  )
  const progressPercentage =
    totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0

  // ── Helpers for rendering ────────────────────────────────────────────────────

  /** Get the partner name for a superset exercise */
  const getSupersetPartner = (ex: Exercise): string | undefined => {
    if (!ex.supersetGroup) return undefined
    const partner = exercises.find(
      (e) => e.supersetGroup === ex.supersetGroup && e.id !== ex.id
    )
    return partner?.name
  }

  /** Whether to show the bracket between index i and i+1 */
  const showBracketAfter = (index: number): boolean => {
    const a = exercises[index]
    const b = exercises[index + 1]
    return (
      !!a?.supersetGroup &&
      !!b?.supersetGroup &&
      a.supersetGroup === b.supersetGroup
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="container mx-auto px-4 pt-4 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BackButton onClick={cancelWorkout} />
              <div>
                <Input
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  className="text-lg font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                  placeholder="Workout name"
                />
                <p className="text-sm text-muted-foreground">
                  {exercises.length} exercise{exercises.length !== 1 ? "s" : ""} • {totalSets} sets
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <WorkoutTimer isActive={isWorkoutActive} duration={workoutDuration} />
              {exercises.length > 0 && (
                <Button
                  variant={isWorkoutActive ? "destructive" : "default"}
                  size="sm"
                  onClick={() => setIsWorkoutActive(!isWorkoutActive)}
                >
                  {isWorkoutActive ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Progress card */}
        {exercises.length > 0 && (
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Workout Progress</p>
                  <p className="text-sm text-muted-foreground">
                    {completedSets} of {totalSets} sets completed
                  </p>
                </div>
              </div>
              <p className="text-2xl font-bold text-primary">{progressPercentage}%</p>
            </div>
          </Card>
        )}

        {/* Exercises + superset brackets */}
        {exercises.length > 0 && (
          <div className="space-y-0">
            {exercises.map((exercise, index) => (
              <div key={exercise.id}>
                <div className="mb-3">
                  <ExerciseLogger
                    exercise={exercise}
                    exerciseNumber={index + 1}
                    onUpdate={(updated) => updateExercise(exercise.id, updated)}
                    onRemove={() => removeExercise(exercise.id)}
                    personalRecord={existingPRs[exercise.name]}
                    suggestion={suggestions[exercise.name]}
                    supersetPartnerName={getSupersetPartner(exercise)}
                    canLinkSuperset={
                      !exercise.supersetGroup && index < exercises.length - 1
                    }
                    onLinkSuperset={() => linkAsSuperset(exercise.id)}
                    onUnlinkSuperset={() => unlinkSuperset(exercise.id)}
                  />
                </div>

                {/* Superset bracket between this and the next exercise */}
                {showBracketAfter(index) && (
                  <SupersetBracket
                    topName={exercise.name}
                    bottomName={exercises[index + 1].name}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Exercise */}
        <Button
          onClick={() => setShowExerciseSelector(true)}
          variant="outline"
          className="w-full h-12 border-dashed border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/5"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Exercise
        </Button>

        {/* Finish Workout */}
        {exercises.length > 0 && (
          <div className="pt-4">
            <Button
              onClick={finishWorkout}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={completedSets === 0 || isSaving}
            >
              <Check className="h-4 w-4 mr-2" />
              Finish Workout
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}

export default function LogWorkoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Image
              src="/fittracker-app-icon.png"
              alt="FitTracker"
              width={40}
              height={40}
              className="mx-auto mb-2 rounded-xl animate-pulse"
            />
            <p className="text-muted-foreground">Loading workout...</p>
          </div>
        </div>
      }
    >
      <LogWorkoutContent />
    </Suspense>
  )
}
