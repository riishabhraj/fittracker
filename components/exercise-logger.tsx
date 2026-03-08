"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, Check, MoreVertical, Trophy } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface Set {
  reps: number
  weight: number
  completed: boolean
}

interface Exercise {
  id: string
  name: string
  category: string
  sets: Set[]
}

export interface PersonalRecord {
  weight: number
  reps: number
  date?: string
}

interface ExerciseLoggerProps {
  exercise: Exercise
  exerciseNumber: number
  onUpdate: (exercise: Exercise) => void
  onRemove: () => void
  personalRecord?: PersonalRecord
}

export function ExerciseLogger({
  exercise,
  exerciseNumber,
  onUpdate,
  onRemove,
  personalRecord,
}: ExerciseLoggerProps) {
  const [restTimer, setRestTimer] = useState<number | null>(null)
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Track which set indices hit a PR this session (for the badge)
  const [prSetIndices, setPrSetIndices] = useState<Set<number>>(new Set())

  useEffect(() => {
    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current)
    }
  }, [])

  const updateSet = (setIndex: number, field: "reps" | "weight" | "completed", value: number | boolean) => {
    const updatedSets = exercise.sets.map((set, index) => (index === setIndex ? { ...set, [field]: value } : set))
    onUpdate({ ...exercise, sets: updatedSets })
  }

  const addSet = () => {
    const lastSet = exercise.sets[exercise.sets.length - 1]
    const newSet: Set = {
      reps: lastSet?.reps || 0,
      weight: lastSet?.weight || 0,
      completed: false,
    }
    onUpdate({ ...exercise, sets: [...exercise.sets, newSet] })
  }

  const removeSet = (setIndex: number) => {
    if (exercise.sets.length > 1) {
      const updatedSets = exercise.sets.filter((_, index) => index !== setIndex)
      onUpdate({ ...exercise, sets: updatedSets })
      // Remove PR badge for removed set
      setPrSetIndices((prev) => {
        const next = new Set(prev)
        next.delete(setIndex)
        return next
      })
    }
  }

  function isNewPR(set: Set): boolean {
    if (!set.reps || !set.weight) return false
    if (!personalRecord) return false // No previous PR — technically everything is a PR, but only flag weight-based PRs
    return (
      set.weight > personalRecord.weight ||
      (set.weight === personalRecord.weight && set.reps > personalRecord.reps)
    )
  }

  const completeSet = (setIndex: number) => {
    const set = exercise.sets[setIndex]
    updateSet(setIndex, "completed", true)

    // PR detection
    if (isNewPR(set)) {
      setPrSetIndices((prev) => new Set([...prev, setIndex]))
      toast(`🏆 New PR! ${exercise.name} — ${set.weight} kg × ${set.reps}`, {
        duration: 4000,
      })
    }

    // Rest timer
    if (restTimerRef.current) clearInterval(restTimerRef.current)
    setRestTimer(90)
    restTimerRef.current = setInterval(() => {
      setRestTimer((prev) => {
        if (prev && prev <= 1) {
          clearInterval(restTimerRef.current!)
          restTimerRef.current = null
          return null
        }
        return prev ? prev - 1 : null
      })
    }, 1000)
  }

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">{exerciseNumber}</span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{exercise.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="secondary" className="text-xs">
                {exercise.category}
              </Badge>
              {personalRecord && (
                <span className="text-xs text-muted-foreground">
                  PR: {personalRecord.weight} kg × {personalRecord.reps}
                </span>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onRemove} className="text-destructive">
              Remove Exercise
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Rest Timer */}
      {restTimer && (
        <div className="mb-4 p-3 bg-primary/10 rounded-lg text-center">
          <p className="text-sm text-primary font-medium">Rest Time</p>
          <p className="text-2xl font-bold text-primary">
            {Math.floor(restTimer / 60)}:{(restTimer % 60).toString().padStart(2, "0")}
          </p>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setRestTimer(null)}
            className="mt-1 text-primary hover:text-primary/80"
          >
            Skip Rest
          </Button>
        </div>
      )}

      {/* Sets Table Header */}
      <div className="grid grid-cols-5 gap-2 mb-2 text-sm text-muted-foreground">
        <div className="text-center">Set</div>
        <div className="text-center">Reps</div>
        <div className="text-center">Weight</div>
        <div className="text-center">Best PR</div>
        <div className="text-center">✓</div>
      </div>

      {/* Sets */}
      <div className="space-y-2">
        {exercise.sets.map((set, setIndex) => (
          <div
            key={setIndex}
            className={`grid grid-cols-5 gap-2 items-center rounded-lg transition-colors ${
              prSetIndices.has(setIndex) ? "bg-yellow-500/8" : ""
            }`}
          >
            <div className="text-center text-sm font-medium text-foreground flex items-center justify-center gap-1">
              {setIndex + 1}
              {prSetIndices.has(setIndex) && (
                <Trophy className="h-3 w-3 text-yellow-500" />
              )}
            </div>

            <Input
              type="number"
              value={set.reps || ""}
              onChange={(e) => updateSet(setIndex, "reps", Number.parseInt(e.target.value) || 0)}
              className="text-center h-8"
              disabled={set.completed}
            />

            <Input
              type="number"
              value={set.weight || ""}
              onChange={(e) => updateSet(setIndex, "weight", Number.parseInt(e.target.value) || 0)}
              className="text-center h-8"
              disabled={set.completed}
            />

            {/* Best PR column (replaces "Previous" which was showing the prior set in the same session) */}
            <div className="text-center text-sm text-muted-foreground">
              {personalRecord
                ? `${personalRecord.weight}×${personalRecord.reps}`
                : "—"}
            </div>

            <div className="flex justify-center">
              {set.completed ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className={`h-8 w-8 p-0 ${prSetIndices.has(setIndex) ? "text-yellow-500 hover:text-yellow-600" : "text-green-500 hover:text-green-600"}`}
                  onClick={() => updateSet(setIndex, "completed", false)}
                >
                  {prSetIndices.has(setIndex) ? (
                    <Trophy className="h-4 w-4" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:text-primary"
                  onClick={() => completeSet(setIndex)}
                  disabled={!set.reps || !set.weight}
                >
                  <div className="w-4 h-4 border-2 border-muted-foreground rounded" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Remove Set Buttons */}
      <div className="flex justify-center space-x-2 mt-4">
        <Button size="sm" variant="outline" onClick={addSet} className="flex items-center space-x-1 bg-transparent">
          <Plus className="h-3 w-3" />
          <span>Add Set</span>
        </Button>

        {exercise.sets.length > 1 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => removeSet(exercise.sets.length - 1)}
            className="flex items-center space-x-1"
          >
            <Minus className="h-3 w-3" />
            <span>Remove Set</span>
          </Button>
        )}
      </div>
    </Card>
  )
}
