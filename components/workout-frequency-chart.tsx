"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getWorkouts } from "@/lib/workout-storage"
import { useEffect, useState } from "react"
import { CalendarDays } from "lucide-react"

interface WeekData {
  week: string
  workouts: number
}

export function WorkoutFrequencyChart() {
  const [data, setData] = useState<WeekData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const generateWeeklyData = () => {
      const workouts = getWorkouts()
      const weeklyData: WeekData[] = []
      
      // Generate last 8 weeks of data
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + i * 7))
        
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        
        const workoutsInWeek = workouts.filter(workout => {
          const workoutDate = new Date(workout.date)
          return workoutDate >= weekStart && workoutDate <= weekEnd
        })
        
        const weekLabel = i === 0 ? "This Week" : `${i} Week${i > 1 ? 's' : ''} Ago`
        
        weeklyData.push({
          week: weekLabel,
          workouts: workoutsInWeek.length
        })
      }
      
      return weeklyData
    }

    const updateData = () => {
      setData(generateWeeklyData())
      setLoading(false)
    }

    updateData()

    // Listen for workout data changes
    const handleDataChange = () => updateData()
    window.addEventListener('workoutDataChanged', handleDataChange)

    return () => {
      window.removeEventListener('workoutDataChanged', handleDataChange)
    }
  }, [])

  if (loading) {
    return (
      <Card className="col-span-1 md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Workout Frequency</CardTitle>
          <CardDescription>Weekly workout count over the last 8 weeks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalWorkouts = data.reduce((sum, week) => sum + week.workouts, 0)
  const hasWorkouts = totalWorkouts > 0

  if (!hasWorkouts) {
    return (
      <Card className="col-span-1 md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Workout Frequency</CardTitle>
          <CardDescription>Weekly workout count over the last 8 weeks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex flex-col items-center justify-center text-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No workouts yet</h3>
            <p className="text-muted-foreground">
              Start logging your workouts to see your weekly frequency chart
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-1">
      <CardHeader>
        <CardTitle>Workout Frequency</CardTitle>
        <CardDescription>Weekly workout count over the last 8 weeks</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis 
              dataKey="week" 
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              domain={[0, 'dataMax + 1']}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Legend />
            <Bar 
              dataKey="workouts" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]}
              name="Workouts"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
