"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { useState, useEffect } from "react"
import { getWorkouts } from "@/lib/workout-storage"
import { TrendingUp } from "lucide-react"

interface ProgressData {
  date: string
  weight: number
  reps: number
  workoutDate: string
}

const chartConfig = {
  weight: {
    label: "Weight (lbs)",
    color: "hsl(var(--primary))",
  },
}

export function StrengthProgressChart() {
  const [exerciseData, setExerciseData] = useState<{ [key: string]: ProgressData[] }>({})
  const [availableExercises, setAvailableExercises] = useState<string[]>([])
  const [selectedExercise, setSelectedExercise] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const generateProgressData = () => {
      const workouts = getWorkouts()
      const exerciseProgress: { [key: string]: ProgressData[] } = {}
      
      workouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
          if (!exerciseProgress[exercise.name]) {
            exerciseProgress[exercise.name] = []
          }
          
          // Find the best set for this exercise in this workout
          const bestSet = exercise.sets
            .filter(set => set.completed)
            .reduce((best, current) => {
              if (!best) return current
              
              // Compare by weight first, then reps
              if (current.weight > best.weight || 
                  (current.weight === best.weight && current.reps > best.reps)) {
                return current
              }
              return best
            }, null as any)
          
          if (bestSet) {
            const workoutDate = new Date(workout.date)
            exerciseProgress[exercise.name].push({
              date: workoutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              weight: bestSet.weight,
              reps: bestSet.reps,
              workoutDate: workout.date
            })
          }
        })
      })
      
      // Sort each exercise's data by date and keep only unique dates (latest weight for each date)
      Object.keys(exerciseProgress).forEach(exerciseName => {
        exerciseProgress[exerciseName] = exerciseProgress[exerciseName]
          .sort((a, b) => new Date(a.workoutDate).getTime() - new Date(b.workoutDate).getTime())
          .filter((item, index, arr) => {
            // Keep only the last entry for each date
            const nextIndex = arr.findIndex((next, nextIdx) => 
              nextIdx > index && next.date === item.date
            )
            return nextIndex === -1
          })
      })
      
      setExerciseData(exerciseProgress)
      
      const exercises = Object.keys(exerciseProgress).filter(
        exercise => exerciseProgress[exercise].length > 0
      )
      setAvailableExercises(exercises)
      
      if (exercises.length > 0 && !selectedExercise) {
        setSelectedExercise(exercises[0])
      }
      
      setLoading(false)
    }

    generateProgressData()

    // Listen for workout data changes
    const handleDataChange = () => generateProgressData()
    window.addEventListener('workoutDataChanged', handleDataChange)

    return () => {
      window.removeEventListener('workoutDataChanged', handleDataChange)
    }
  }, [selectedExercise])

  if (loading) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Strength Progress</h3>
            <p className="text-sm text-muted-foreground">Track your personal records over time</p>
          </div>
        </div>
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading chart...</div>
        </div>
      </Card>
    )
  }

  if (availableExercises.length === 0) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Strength Progress</h3>
            <p className="text-sm text-muted-foreground">Track your personal records over time</p>
          </div>
        </div>
        <div className="h-[300px] flex flex-col items-center justify-center text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
          <h4 className="text-lg font-medium text-foreground mb-2">No strength data yet</h4>
          <p className="text-muted-foreground">
            Complete some workouts with weight training to see your strength progress
          </p>
        </div>
      </Card>
    )
  }

  const currentExerciseData = exerciseData[selectedExercise] || []

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Strength Progress</h3>
          <p className="text-sm text-muted-foreground">Track your personal records over time</p>
        </div>
      </div>

      <div className="flex space-x-2 mb-4 overflow-x-auto">
        {availableExercises.map((exercise) => (
          <Button
            key={exercise}
            variant={selectedExercise === exercise ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedExercise(exercise)}
            className="whitespace-nowrap"
          >
            {exercise}
          </Button>
        ))}
      </div>

      <ChartContainer config={chartConfig} className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={currentExerciseData}>
            <XAxis
              dataKey="date"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value: any, name: string) => [
                `${value} lbs`,
                'Weight'
              ]}
              labelFormatter={(label: string) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="var(--color-weight)"
              strokeWidth={3}
              dot={{ fill: "var(--color-weight)", strokeWidth: 2, r: 4 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Card>
  )
}
