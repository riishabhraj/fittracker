"use client"

import { useState, useEffect, Suspense } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Play, Pause, Check, Activity } from "lucide-react"
import Image from "next/image"
import { WorkoutTimer } from "@/components/workout-timer"
import { ExerciseLogger } from "@/components/exercise-logger"
import { ExerciseSelector } from "@/components/exercise-selector"
import { BackButton } from "@/components/back-button"
import { templates } from "@/components/workout-templates"
import { saveWorkout, getPersonalRecords, Workout } from "@/lib/workout-storage"
import { 
  saveWorkoutSession, 
  getWorkoutSession, 
  clearWorkoutSession, 
  useWorkoutSessionAutoSave 
} from "@/lib/workout-session-storage"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

interface Exercise {
  id: string
  name: string
  category: string
  sets: Array<{
    reps: number
    weight: number
    completed: boolean
  }>
}

function LogWorkoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get('template')
  const { saveSession } = useWorkoutSessionAutoSave()
  
  const [workoutName, setWorkoutName] = useState("New Workout")
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [isWorkoutActive, setIsWorkoutActive] = useState(false)
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null)
  const [workoutDuration, setWorkoutDuration] = useState(0)
  const [showExerciseSelector, setShowExerciseSelector] = useState(false)
  const [sessionLoaded, setSessionLoaded] = useState(false)
  const [existingPRs, setExistingPRs] = useState<Record<string, { weight: number; reps: number; date: string }>>({})

  // Load existing PRs once on mount
  useEffect(() => {
    getPersonalRecords().then(setExistingPRs).catch(() => {})
  }, [])

  // Load existing workout session or template on mount
  useEffect(() => {
    const existingSession = getWorkoutSession()
    
    if (existingSession && !templateId) {
      // Restore existing session
      setWorkoutName(existingSession.workoutName)
      setExercises(existingSession.exercises)
      setIsWorkoutActive(existingSession.isWorkoutActive)
      setWorkoutDuration(existingSession.workoutDuration)
      
      if (existingSession.workoutStartTime) {
        setWorkoutStartTime(new Date(existingSession.workoutStartTime))
      }
      
      toast.success("🔄 Resumed your workout session!")
      setSessionLoaded(true)
    } else if (templateId) {
      // Clear existing session when loading a new template
      clearWorkoutSession()

      // Check if it's a user template (MongoDB ObjectId) or a system template (numeric string)
      const isUserTemplate = /^[0-9a-f]{24}$/i.test(templateId)

      if (isUserTemplate) {
        // Load user template from API (async IIFE inside sync useEffect)
        ;(async () => {
          try {
            const res = await fetch(`/api/templates/${templateId}`)
            if (res.ok) {
              const userTemplate = await res.json()
              setWorkoutName(userTemplate.name)
              const templateExercises: Exercise[] = userTemplate.exercises.map(
                (exercise: { id?: string; name: string; category: string; sets: Array<{ reps: number; weight: number }> }, index: number) => ({
                  id: `template-${index}-${Date.now()}`,
                  name: exercise.name,
                  category: exercise.category,
                  sets: exercise.sets.length > 0
                    ? exercise.sets.map((s) => ({ reps: s.reps, weight: s.weight, completed: false }))
                    : [{ reps: 0, weight: 0, completed: false }],
                })
              )
              setExercises(templateExercises)
              setIsWorkoutActive(true)
              toast.success(`📋 Loaded ${userTemplate.name} with ${userTemplate.exercises.length} exercises!`)
            }
          } catch {
            toast.error("Failed to load template")
          }
          setSessionLoaded(true)
        })();
      } else {
        // Load system template
        const template = templates.find(t => t.id === templateId)
        if (template) {
          setWorkoutName(template.name)
          const templateExercises: Exercise[] = template.exerciseList.map((exercise, index) => ({
            id: `template-${index}-${Date.now()}`,
            name: exercise.name,
            category: exercise.category,
            sets: Array(exercise.sets).fill(null).map(() => ({
              reps: 0,
              weight: 0,
              completed: false
            }))
          }))
          setExercises(templateExercises)
          setIsWorkoutActive(true)
          toast.success(`📋 Loaded ${template.name} template with ${template.exerciseList.length} exercises!`)
        }
        setSessionLoaded(true)
      }
    } else {
      setSessionLoaded(true)
    }
  }, [templateId])

  // Auto-save session whenever state changes
  useEffect(() => {
    if (!sessionLoaded) return // Don't save until initial load is complete
    
    const sessionData = {
      workoutName,
      exercises,
      isWorkoutActive,
      workoutStartTime: workoutStartTime?.toISOString() || null,
      workoutDuration,
      templateId
    }
    
    // Debounce auto-save to avoid too frequent saves
    const timeoutId = setTimeout(() => {
      saveSession(sessionData)
    }, 1000)
    
    return () => clearTimeout(timeoutId)
  }, [workoutName, exercises, isWorkoutActive, workoutStartTime, workoutDuration, templateId, saveSession, sessionLoaded])

  // Start workout timer when first exercise is added or timer is manually started
  useEffect(() => {
    if (isWorkoutActive && !workoutStartTime) {
      setWorkoutStartTime(new Date())
    }
  }, [isWorkoutActive, workoutStartTime])

  // Update duration every second when workout is active
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isWorkoutActive && workoutStartTime) {
      interval = setInterval(() => {
        const now = new Date()
        const duration = Math.floor((now.getTime() - workoutStartTime.getTime()) / 1000 / 60) // minutes
        setWorkoutDuration(duration)
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isWorkoutActive, workoutStartTime])

  const addExercise = (exercise: { name: string; category: string }) => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: exercise.name,
      category: exercise.category,
      sets: [{ reps: 0, weight: 0, completed: false }],
    }
    setExercises([...exercises, newExercise])
    setShowExerciseSelector(false)
    
    // Auto-start workout when first exercise is added
    if (exercises.length === 0) {
      setIsWorkoutActive(true)
    }
  }

  const updateExercise = (exerciseId: string, updatedExercise: Exercise) => {
    setExercises(exercises.map((ex) => (ex.id === exerciseId ? updatedExercise : ex)))
  }

  const removeExercise = (exerciseId: string) => {
    setExercises(exercises.filter((ex) => ex.id !== exerciseId))
  }

  const finishWorkout = async () => {
    if (exercises.length === 0) {
      toast.error("Please add at least one exercise to finish the workout")
      return
    }

    // Check if any sets are completed
    const hasCompletedSets = exercises.some(ex => ex.sets.some(set => set.completed))
    if (!hasCompletedSets) {
      toast.error("Please complete at least one set to finish the workout")
      return
    }

    try {
      const completedExercises = exercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        category: ex.category,
        sets: ex.sets.filter(set => set.completed).map(set => ({
          reps: set.reps,
          weight: set.weight,
          completed: set.completed,
          restTime: 0 // Could be enhanced to track actual rest time
        }))
      })).filter(ex => ex.sets.length > 0) // Only include exercises with completed sets

      const totalSets = completedExercises.reduce((sum, ex) => sum + ex.sets.length, 0)
      const totalReps = completedExercises.reduce((sum, ex) => 
        sum + ex.sets.reduce((setSum, set) => setSum + set.reps, 0), 0)
      const totalWeight = completedExercises.reduce((sum, ex) => 
        sum + ex.sets.reduce((setSum, set) => setSum + (set.weight * set.reps), 0), 0)

      const workout: Workout = {
        id: Date.now().toString(),
        name: workoutName.trim() || "Untitled Workout",
        date: (workoutStartTime || new Date()).toISOString(),
        duration: workoutDuration,
        exercises: completedExercises,
        totalSets,
        totalReps,
        totalWeight
      }

      // Detect new PRs (compare against PRs loaded at session start)
      const newPRNames: string[] = []
      completedExercises.forEach((ex) => {
        const bestSet = ex.sets.reduce(
          (best, set) =>
            !best ||
            set.weight > best.weight ||
            (set.weight === best.weight && set.reps > best.reps)
              ? set
              : best,
          null as typeof ex.sets[0] | null
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

      // Find top exercise by total volume (weight × reps)
      const topExercise = completedExercises.reduce((top, ex) => {
        const vol = ex.sets.reduce((s, set) => s + set.weight * set.reps, 0)
        const topVol = top.sets.reduce((s, set) => s + set.weight * set.reps, 0)
        return vol > topVol ? ex : top
      }, completedExercises[0])

      const searchParams = new URLSearchParams({
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
      router.push(`/workout-complete?${searchParams}`)
    } catch (error) {
      console.error("Error saving workout:", error)
      toast.error("Failed to save workout. Please try again.")
    }
  }

  const cancelWorkout = () => {
    if (exercises.length > 0) {
      const hasData = exercises.some(ex => ex.sets.some(set => set.reps > 0 || set.weight > 0))
      if (hasData) {
        if (confirm("⚠️ Are you sure you want to cancel this workout? All progress will be lost.")) {
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
    return <ExerciseSelector onSelect={addExercise} onClose={() => setShowExerciseSelector(false)} />
  }

  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0)
  const completedSets = exercises.reduce((acc, ex) => acc + ex.sets.filter((set) => set.completed).length, 0)
  const progressPercentage = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 pt-12 pb-6">
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
                  {exercises.length} exercise{exercises.length !== 1 ? 's' : ''} • {totalSets} sets
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
                  {isWorkoutActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
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
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{progressPercentage}%</p>
              </div>
            </div>
          </Card>
        )}

        {/* Exercises */}
        {exercises.length > 0 && (
          <div className="space-y-4">
            {exercises.map((exercise, index) => (
              <ExerciseLogger
                key={exercise.id}
                exercise={exercise}
                exerciseNumber={index + 1}
                onUpdate={(updatedExercise) => updateExercise(exercise.id, updatedExercise)}
                onRemove={() => removeExercise(exercise.id)}
                personalRecord={existingPRs[exercise.name]}
              />
            ))}
          </div>
        )}

        {/* Add Exercise Button */}
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
              disabled={completedSets === 0}
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
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Image src="/fittracker-app-icon.png" alt="FitTracker" width={40} height={40} className="mx-auto mb-2 rounded-xl animate-pulse" />
          <p className="text-muted-foreground">Loading workout...</p>
        </div>
      </div>
    }>
      <LogWorkoutContent />
    </Suspense>
  )
}
