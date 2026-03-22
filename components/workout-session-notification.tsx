"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dumbbell, Play, Clock, ChevronRight, Trash2, AlertCircle } from "lucide-react"
import { getWorkoutSessionSummary, hasActiveWorkoutSession, clearWorkoutSession, cleanupStaleWorkoutSession } from "@/lib/workout-session-storage"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface WorkoutSessionNotificationProps {
  className?: string
}

export function WorkoutSessionNotification({ className = "" }: WorkoutSessionNotificationProps) {
  const [sessionSummary, setSessionSummary] = useState<ReturnType<typeof getWorkoutSessionSummary>>(null)
  const [confirming, setConfirming] = useState(false)
  const router = useRouter()

  useEffect(() => {
    cleanupStaleWorkoutSession()
    updateSessionSummary()

    const handleSessionChange = () => {
      updateSessionSummary()
    }

    window.addEventListener('workoutSessionSaved', handleSessionChange)
    window.addEventListener('workoutSessionCleared', handleSessionChange)

    return () => {
      window.removeEventListener('workoutSessionSaved', handleSessionChange)
      window.removeEventListener('workoutSessionCleared', handleSessionChange)
    }
  }, [])

  const updateSessionSummary = () => {
    if (hasActiveWorkoutSession()) {
      setSessionSummary(getWorkoutSessionSummary())
    } else {
      setSessionSummary(null)
    }
  }

  const resumeWorkout = () => {
    router.push('/log-workout')
  }

  const discardWorkout = () => {
    if (!confirming) {
      setConfirming(true)
      return
    }
    clearWorkoutSession()
    setSessionSummary(null)
    setConfirming(false)
    toast.success("Workout discarded")
  }

  useEffect(() => {
    if (!confirming) return
    const t = setTimeout(() => setConfirming(false), 3000)
    return () => clearTimeout(t)
  }, [confirming])

  if (!sessionSummary) {
    return null
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 1) return "0m"
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const rem = minutes % 60
    return rem > 0 ? `${hours}h ${rem}m` : `${hours}h`
  }

  const formatTimeAgo = (timestamp: string) => {
    const minutesAgo = Math.floor((Date.now() - new Date(timestamp).getTime()) / (1000 * 60))
    if (minutesAgo < 1) return "Just now"
    if (minutesAgo < 60) return `${minutesAgo}m ago`
    const hoursAgo = Math.floor(minutesAgo / 60)
    if (hoursAgo < 24) return `${hoursAgo}h ago`
    return `${Math.floor(hoursAgo / 24)}d ago`
  }

  const pct = sessionSummary.progressPercentage

  return (
    <div className={`rounded-2xl overflow-hidden border border-border bg-card ${className}`}>
      {/* Top accent bar */}
      <div className="h-1" style={{ background: "linear-gradient(to right, hsl(80 100% 50%), hsl(80 100% 35%))" }} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(170,255,0,0.12)" }}>
                <Dumbbell className="h-4 w-4" style={{ color: "hsl(80 100% 50%)" }} />
              </div>
              {sessionSummary.isActive && (
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: "hsl(80 100% 50%)" }} />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm leading-tight">
                {sessionSummary.workoutName}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {formatTimeAgo(sessionSummary.lastModified)}
                {sessionSummary.duration > 0 && ` · ${formatDuration(sessionSummary.duration)}`}
              </p>
            </div>
          </div>

          <button
            onClick={discardWorkout}
            className="p-1.5 rounded-lg text-muted-foreground transition-colors"
            style={confirming ? { color: "hsl(0 70% 55%)", backgroundColor: "rgba(220,50,50,0.1)" } : {}}
            title={confirming ? "Tap again to confirm" : "Discard workout"}
          >
            {confirming ? <AlertCircle className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
          </button>
        </div>

        {/* Stats + progress */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{sessionSummary.exerciseCount} exercises</span>
            <span>{sessionSummary.completedSets}/{sessionSummary.totalSets} sets</span>
            <span className="font-medium" style={{ color: pct > 0 ? "hsl(80 100% 50%)" : undefined }}>
              {pct}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full rounded-full h-1.5 mb-3" style={{ backgroundColor: "hsl(0 0% 16%)" }}>
          <div
            className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: `${Math.max(pct, 2)}%`,
              background: "linear-gradient(to right, hsl(80 100% 50%), hsl(80 100% 40%))",
            }}
          />
        </div>

        {/* Resume button */}
        <Button
          onClick={resumeWorkout}
          className="w-full h-10 font-semibold text-sm"
          style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
        >
          <Play className="h-4 w-4 mr-1.5" />
          Resume Workout
          <ChevronRight className="h-4 w-4 ml-auto" />
        </Button>
      </div>
    </div>
  )
}
