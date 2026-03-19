"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, Check, MoreVertical, Trophy, ChevronDown, ChevronUp, Link, Unlink } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { RPEPicker } from "@/components/rpe-picker"
import { calculateEpley1RM } from "@/lib/one-rm"
import type { SuggestedSet } from "@/lib/progressive-overload"
import type { ExerciseType } from "@/components/exercise-selector"
import { toast } from "sonner"

interface Set {
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
  sets: Set[]
  supersetGroup?: string
  exerciseType?: ExerciseType
  barbell?: boolean
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
  /** Progressive overload suggestion for the next set */
  suggestion?: SuggestedSet | null
  /** Name of the paired superset exercise (if any) */
  supersetPartnerName?: string
  /** Whether this exercise can be linked to the next one below it */
  canLinkSuperset?: boolean
  onLinkSuperset?: () => void
  onUnlinkSuperset?: () => void
}

export function ExerciseLogger({
  exercise,
  exerciseNumber,
  onUpdate,
  onRemove,
  personalRecord,
  suggestion,
  supersetPartnerName,
  canLinkSuperset,
  onLinkSuperset,
  onUnlinkSuperset,
}: ExerciseLoggerProps) {
  const [restTimer, setRestTimer] = useState<number | null>(null)
  const [supersetCue, setSupersetCue] = useState(false)
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [prSetIndices, setPrSetIndices] = useState<Set<number>>(new Set())
  const [rpeOpenIndices, setRpeOpenIndices] = useState<Set<number>>(new Set())

  useEffect(() => {
    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current)
    }
  }, [])

  const [barbell, setBarbell] = useState(exercise.barbell ?? false)
  const BAR_WEIGHT = 20 // standard Olympic bar in kg

  const toggleBarbell = () => {
    const next = !barbell
    setBarbell(next)
    onUpdate({ ...exercise, barbell: next })
  }

  const exerciseType: ExerciseType = exercise.exerciseType ?? "weighted"
  const isBodyweight = exerciseType === "bodyweight"
  const isOptionalWeight = exerciseType === "bodyweight_optional_weight"
  const showWeightColumn = !isBodyweight // weighted + bodyweight_optional_weight both show weight

  const updateSet = (
    setIndex: number,
    field: "reps" | "weight" | "completed" | "rpe" | "estimated1RM",
    value: number | boolean
  ) => {
    const updatedSets = exercise.sets.map((set, index) =>
      index === setIndex ? { ...set, [field]: value } : set
    )
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
      setPrSetIndices((prev) => {
        const next = new Set(prev)
        next.delete(setIndex)
        return next
      })
      setRpeOpenIndices((prev) => {
        const next = new Set(prev)
        next.delete(setIndex)
        return next
      })
    }
  }

  // Apply suggestion to the first incomplete set
  const applySuggestion = () => {
    if (!suggestion) return
    const firstIncompleteIdx = exercise.sets.findIndex((s) => !s.completed)
    if (firstIncompleteIdx === -1) return
    const updatedSets = exercise.sets.map((s, i) =>
      i === firstIncompleteIdx
        ? { ...s, weight: suggestion.weight, reps: suggestion.reps }
        : s
    )
    onUpdate({ ...exercise, sets: updatedSets })
  }

  function isNewPR(set: Set): boolean {
    if (!set.reps) return false
    if (!personalRecord) return false
    if (isBodyweight) {
      // For bodyweight, PR is just max reps
      return set.reps > personalRecord.reps
    }
    return (
      set.weight > personalRecord.weight ||
      (set.weight === personalRecord.weight && set.reps > personalRecord.reps)
    )
  }

  const completeSet = (setIndex: number) => {
    const set = exercise.sets[setIndex]

    // Convert per-side weight to total for barbell exercises
    const effectiveWeight = barbell && set.weight > 0
      ? set.weight * 2 + BAR_WEIGHT
      : set.weight

    const orm =
      effectiveWeight > 0 && set.reps > 0
        ? calculateEpley1RM(effectiveWeight, set.reps)
        : undefined

    const updatedSets = exercise.sets.map((s, i) =>
      i === setIndex ? { ...s, weight: effectiveWeight, completed: true, estimated1RM: orm } : s
    )
    onUpdate({ ...exercise, sets: updatedSets })

    // PR detection (use effective weight for comparison)
    const effectiveSet = { ...set, weight: effectiveWeight }
    if (isNewPR(effectiveSet)) {
      setPrSetIndices((prev) => new Set([...prev, setIndex]))
      const prLabel = isBodyweight
        ? `${exercise.name} — ${set.reps} reps`
        : `${exercise.name} — ${effectiveWeight} kg × ${set.reps}`
      toast(`🏆 New PR! ${prLabel}`, { duration: 4000 })
    }

    // Auto-open RPE picker
    setRpeOpenIndices((prev) => new Set([...prev, setIndex]))

    // Superset: show partner cue instead of rest timer
    if (supersetPartnerName) {
      setSupersetCue(true)
      setTimeout(() => setSupersetCue(false), 4000)
      return
    }

    // Normal rest timer
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

  const toggleRPE = (setIndex: number) => {
    setRpeOpenIndices((prev) => {
      const next = new Set(prev)
      if (next.has(setIndex)) next.delete(setIndex)
      else next.add(setIndex)
      return next
    })
  }

  // Which sets haven't been completed yet (for showing the suggestion)
  const firstIncompleteIdx = exercise.sets.findIndex((s) => !s.completed)
  const showSuggestion = suggestion && firstIncompleteIdx !== -1

  // PR display label
  const prLabel = personalRecord
    ? isBodyweight
      ? `${personalRecord.reps} reps`
      : `${personalRecord.weight}×${personalRecord.reps}`
    : null

  // Grid layout: 4-col for bodyweight (no weight), 5-col otherwise
  const gridClass = showWeightColumn ? "grid-cols-5" : "grid-cols-4"

  return (
    <Card className={`p-4 bg-card border-border ${supersetPartnerName ? "border-primary/30" : ""}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
            <span className="text-sm font-semibold text-primary">{exerciseNumber}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{exercise.name}</h3>
              {supersetPartnerName && (
                <span
                  className="text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: "hsl(80 100% 50% / 0.15)", color: "hsl(80 100% 50%)" }}
                >
                  SS
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="secondary" className="text-xs">
                {exercise.category}
              </Badge>
              {isBodyweight && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">BW</span>
              )}
              {isOptionalWeight && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">BW+</span>
              )}
              {showWeightColumn && !isOptionalWeight && (
                <button
                  onClick={toggleBarbell}
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded transition-colors ${
                    barbell
                      ? "bg-orange-500/15 text-orange-400"
                      : "bg-muted/20 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {barbell ? "BARBELL" : "BB"}
                </button>
              )}
              {prLabel && (
                <span className="text-xs text-muted-foreground">
                  PR: {prLabel}
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
            {!supersetPartnerName && canLinkSuperset && (
              <DropdownMenuItem onClick={onLinkSuperset} className="gap-2">
                <Link className="h-4 w-4" />
                Link as Superset
              </DropdownMenuItem>
            )}
            {supersetPartnerName && (
              <DropdownMenuItem onClick={onUnlinkSuperset} className="gap-2">
                <Unlink className="h-4 w-4" />
                Unlink Superset
              </DropdownMenuItem>
            )}
            {(canLinkSuperset || supersetPartnerName) && <DropdownMenuSeparator />}
            <DropdownMenuItem onClick={onRemove} className="text-destructive">
              Remove Exercise
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Progressive overload suggestion chip */}
      {showSuggestion && (
        <div
          className="flex items-center justify-between px-3 py-2 rounded-xl mb-3 gap-3"
          style={{ backgroundColor: "hsl(80 100% 50% / 0.08)", border: "1px solid hsl(80 100% 50% / 0.2)" }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-semibold shrink-0" style={{ color: "hsl(80 100% 50%)" }}>
              {suggestion!.reason === "first_session" ? "Last time" : "Suggested"}
            </span>
            <span className="text-xs text-foreground font-medium truncate">
              {suggestion!.label}
            </span>
          </div>
          {suggestion!.reason !== "first_session" && (
            <Button
              size="sm"
              className="h-6 px-2.5 text-xs shrink-0"
              style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
              onClick={applySuggestion}
            >
              Apply
            </Button>
          )}
        </div>
      )}

      {/* Superset partner cue */}
      {supersetCue && supersetPartnerName && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3"
          style={{ backgroundColor: "hsl(80 100% 50% / 0.1)", border: "1px solid hsl(80 100% 50% / 0.3)" }}
        >
          <span className="text-xs font-semibold" style={{ color: "hsl(80 100% 50%)" }}>
            ↓ Now do:
          </span>
          <span className="text-xs text-foreground font-medium">{supersetPartnerName}</span>
        </div>
      )}

      {/* Rest Timer (non-superset only) */}
      {restTimer && !supersetPartnerName && (
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
      <div className={`grid ${gridClass} gap-2 mb-2 text-sm text-muted-foreground`}>
        <div className="text-center">Set</div>
        <div className="text-center">Reps</div>
        {showWeightColumn && (
          <div className="text-center">
            {isOptionalWeight ? "+Weight" : "Weight"}
            {barbell && <div className="text-[9px] text-orange-400">per side</div>}
          </div>
        )}
        <div className="text-center">Best PR</div>
        <div className="text-center">✓</div>
      </div>

      {/* Sets */}
      <div className="space-y-1">
        {exercise.sets.map((set, setIndex) => (
          <div key={setIndex}>
            {/* Main set row */}
            <div
              className={`grid ${gridClass} gap-2 items-center rounded-lg transition-colors ${
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

              {showWeightColumn && (
                <div>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    value={set.weight || ""}
                    onChange={(e) => updateSet(setIndex, "weight", Number.parseFloat(e.target.value) || 0)}
                    placeholder={isOptionalWeight ? "+kg" : ""}
                    className="text-center h-8"
                    disabled={set.completed}
                  />
                  {barbell && set.weight > 0 && !set.completed && (
                    <div className="text-[9px] text-orange-400 text-center mt-0.5">
                      = {set.weight * 2 + BAR_WEIGHT} kg
                    </div>
                  )}
                </div>
              )}

              {/* Best PR column */}
              <div className="text-center text-sm text-muted-foreground">
                {prLabel ?? "—"}
              </div>

              <div className="flex justify-center">
                {set.completed ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`h-8 w-8 p-0 ${
                      prSetIndices.has(setIndex)
                        ? "text-yellow-500 hover:text-yellow-600"
                        : "text-green-500 hover:text-green-600"
                    }`}
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
                    disabled={!set.reps || (!isBodyweight && !isOptionalWeight && !set.weight)}
                  >
                    <div className="w-4 h-4 border-2 border-muted-foreground rounded" />
                  </Button>
                )}
              </div>
            </div>

            {/* Post-completion row: 1RM + RPE */}
            {set.completed && (
              <div className="ml-1 mb-2 space-y-0.5">
                <div className="flex items-center justify-between px-1 pt-1">
                  {set.estimated1RM ? (
                    <span className="text-xs text-muted-foreground">
                      ~1RM:{" "}
                      <span className="font-semibold text-primary">{set.estimated1RM} kg</span>
                    </span>
                  ) : isBodyweight && set.reps > 0 ? (
                    <span className="text-xs text-muted-foreground">
                      <span className="font-semibold text-blue-400">BW</span> × {set.reps}
                    </span>
                  ) : (
                    <span />
                  )}
                  <button
                    onClick={() => toggleRPE(setIndex)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {set.rpe !== undefined ? (
                      <span>
                        RPE <span className="font-semibold text-foreground">{set.rpe}</span>
                      </span>
                    ) : (
                      <span>Rate effort</span>
                    )}
                    {rpeOpenIndices.has(setIndex) ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                </div>

                {rpeOpenIndices.has(setIndex) && (
                  <RPEPicker
                    value={set.rpe}
                    onChange={(v) => updateSet(setIndex, "rpe", v)}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add/Remove Set Buttons */}
      <div className="flex justify-center space-x-2 mt-4">
        <Button
          size="sm"
          variant="outline"
          onClick={addSet}
          className="flex items-center space-x-1 bg-transparent"
        >
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
