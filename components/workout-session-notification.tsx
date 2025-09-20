"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dumbbell, Play, Clock, CheckCircle } from "lucide-react"
import { getWorkoutSessionSummary, hasActiveWorkoutSession } from "@/lib/workout-session-storage"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface WorkoutSessionNotificationProps {
  className?: string
}

export function WorkoutSessionNotification({ className = "" }: WorkoutSessionNotificationProps) {
  const [sessionSummary, setSessionSummary] = useState<ReturnType<typeof getWorkoutSessionSummary>>(null)
  const router = useRouter()

  useEffect(() => {
    // Check for active session on mount
    updateSessionSummary()

    // Listen for session changes
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
    toast.success("🔄 Resuming your workout...")
  }

  if (!sessionSummary) {
    return null
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const lastModified = new Date(timestamp)
    const minutesAgo = Math.floor((now.getTime() - lastModified.getTime()) / (1000 * 60))
    
    if (minutesAgo < 1) return 'Just now'
    if (minutesAgo < 60) return `${minutesAgo}m ago`
    
    const hoursAgo = Math.floor(minutesAgo / 60)
    if (hoursAgo < 24) return `${hoursAgo}h ago`
    
    const daysAgo = Math.floor(hoursAgo / 24)
    return `${daysAgo}d ago`
  }

  return (
    <Card className={`bg-gradient-to-r from-orange-500/10 to-orange-600/5 border-orange-200 dark:border-orange-800 ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Dumbbell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              {sessionSummary.isActive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-foreground">
                  {sessionSummary.workoutName}
                </h3>
                <Badge variant={sessionSummary.isActive ? "default" : "secondary"} className="text-xs">
                  {sessionSummary.isActive ? (
                    <>
                      <Play className="h-3 w-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3 mr-1" />
                      Paused
                    </>
                  )}
                </Badge>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                <span>{sessionSummary.exerciseCount} exercises</span>
                <span className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {sessionSummary.completedSets}/{sessionSummary.totalSets} sets
                </span>
                {sessionSummary.duration > 0 && (
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDuration(sessionSummary.duration)}
                  </span>
                )}
                <span className="text-xs">
                  {formatTimeAgo(sessionSummary.lastModified)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {sessionSummary.progressPercentage}%
              </div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
            <Button 
              onClick={resumeWorkout}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Resume
            </Button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3">
          <div className="w-full bg-orange-100 dark:bg-orange-900/30 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${sessionSummary.progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
