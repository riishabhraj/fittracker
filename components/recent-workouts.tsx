"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dumbbell, Plus, Clock, Target } from "lucide-react"
import Link from "next/link"
import { getRecentWorkouts } from "@/lib/workout-storage"
import { useState, useEffect } from "react"

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

function formatDate(date: Date): string {
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function RecentWorkouts() {
  const [workouts, setWorkouts] = useState<any[]>([])

  const updateWorkouts = () => {
    setWorkouts(getRecentWorkouts(3))
  }

  useEffect(() => {
    updateWorkouts()
    
    // Listen for storage changes
    const handleStorageChange = () => updateWorkouts()
    const handleWorkoutChange = () => updateWorkouts()
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('workoutDataChanged', handleWorkoutChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('workoutDataChanged', handleWorkoutChange)
    }
  }, [])

  const hasWorkouts = workouts.length > 0

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Recent Workouts</h2>
        <Link href="/workouts">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            View All
          </Button>
        </Link>
      </div>

      {!hasWorkouts ? (
        <div className="text-center py-8">
          <div className="p-4 bg-muted/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Dumbbell className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No workouts yet</h3>
          <p className="text-muted-foreground mb-4">Start your fitness journey by logging your first workout!</p>
          <Link href="/log-workout">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Log Your First Workout
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {workouts.map((workout) => {
            const totalSets = workout.exercises.reduce((sum: number, ex: any) => sum + ex.sets.length, 0)
            const totalWeight = workout.exercises.reduce((sum: number, ex: any) => 
              sum + ex.sets.reduce((setSum: number, set: any) => setSum + (set.weight * set.reps), 0), 0
            )
            const totalReps = workout.exercises.reduce((sum: number, ex: any) => 
              sum + ex.sets.reduce((setSum: number, set: any) => setSum + set.reps, 0), 0
            )
            
            return (
              <div key={workout.id} className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-foreground">{workout.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                      </Badge>
                      <span className="text-muted-foreground text-sm">•</span>
                      <span className="text-muted-foreground text-sm">{totalSets} sets</span>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{formatDate(new Date(workout.date))}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {formatDuration(workout.duration)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {totalWeight.toLocaleString()} lbs
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {totalReps} reps
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
