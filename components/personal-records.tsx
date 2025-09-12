"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Calendar, Trophy } from "lucide-react"
import { getPersonalRecords, getWorkouts } from "@/lib/workout-storage"
import { useEffect, useState } from "react"

interface PersonalRecord {
  exercise: string
  weight: number
  reps: number
  date: string
  improvement?: number
}

interface PersonalRecordsProps {
  showAll?: boolean
}

export function PersonalRecords({ showAll = false }: PersonalRecordsProps) {
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const updatePersonalRecords = () => {
      const records = getPersonalRecords()
      const workouts = getWorkouts()
      
      // Convert records object to array and sort by date (most recent first)
      const recordsArray = Object.entries(records).map(([exercise, record]: [string, { weight: number; reps: number; date: string }]) => ({
        exercise,
        weight: record.weight,
        reps: record.reps,
        date: record.date
      })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      // Calculate improvements by comparing with previous PRs
      const recordsWithImprovement = recordsArray.map(record => {
        // Find previous best for this exercise
        let previousBest: { weight: number; reps: number } | null = null
        
        workouts.forEach((workout: any) => {
          // Skip the workout where this PR was set
          if (workout.date === record.date) return
          
          workout.exercises.forEach((exercise: any) => {
            if (exercise.name === record.exercise) {
              exercise.sets.forEach((set: any) => {
                if (set.completed) {
                  if (
                    !previousBest ||
                    set.weight < record.weight ||
                    (set.weight === record.weight && set.reps < record.reps)
                  ) {
                    if (
                      set.weight > (previousBest?.weight ?? 0) ||
                      (set.weight === (previousBest?.weight ?? 0) && set.reps > (previousBest?.reps ?? 0))
                    ) {
                      previousBest = { weight: set.weight, reps: set.reps }
                    }
                  }
                }
              })
            }
          })
        })

        const improvement = previousBest ? record.weight - previousBest.weight : 0

        return {
          ...record,
          improvement
        }
      })

      setPersonalRecords(recordsWithImprovement)
      setLoading(false)
    }

    updatePersonalRecords()

    // Listen for workout data changes
    const handleDataChange = () => updatePersonalRecords()
    window.addEventListener('workoutDataChanged', handleDataChange)

    return () => {
      window.removeEventListener('workoutDataChanged', handleDataChange)
    }
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 14) return "1 week ago"
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  if (loading) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Personal Records</h3>
            <p className="text-sm text-muted-foreground">Your recent achievements</p>
          </div>
        </div>
        <div className="animate-pulse">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted/20 rounded-lg"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  if (personalRecords.length === 0) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Personal Records</h3>
            <p className="text-sm text-muted-foreground">Your recent achievements</p>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            0 PRs
          </Badge>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
          <h4 className="text-lg font-medium text-foreground mb-2">No personal records yet</h4>
          <p className="text-muted-foreground">
            Complete some workouts to start tracking your personal records
          </p>
        </div>
      </Card>
    )
  }

  const displayRecords = showAll ? personalRecords : personalRecords.slice(0, 4)

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Personal Records</h3>
          <p className="text-sm text-muted-foreground">Your recent achievements</p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {personalRecords.length} PR{personalRecords.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="space-y-3">
        {displayRecords.map((record, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-muted/10 rounded-lg border border-border/50"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">{record.exercise}</h4>
                <p className="text-sm text-muted-foreground">
                  {record.weight} lbs × {record.reps} {record.reps === 1 ? "rep" : "reps"}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center space-x-2">
                {record.improvement && record.improvement > 0 && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                    +{record.improvement} lbs
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-1 mt-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{formatDate(record.date)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
