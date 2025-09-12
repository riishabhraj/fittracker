"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Calendar, TrendingUp, Target, Flame, Clock, Dumbbell } from "lucide-react"
import { getWorkoutStats } from "@/lib/workout-storage"
import { useEffect, useState } from "react"

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string
  progress?: number
  trend?: "up" | "down" | "neutral"
}

function StatCard({ icon: Icon, label, value, progress, trend }: StatCardProps) {
  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        {trend && (
          <div
            className={`text-xs ${trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"}`}
          >
            {trend === "up" ? "↗" : trend === "down" ? "↘" : "→"}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold text-foreground">{value}</p>
        {progress !== undefined && <Progress value={progress} className="mt-2 h-1" />}
      </div>
    </Card>
  )
}

export function WorkoutStats() {
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    weeklyWorkouts: 0,
    totalSets: 0,
    totalReps: 0,
    totalWeight: 0,
    totalHours: 0,
    currentStreak: 0,
    weeklyGoal: 4,
    avgDuration: 0
  })

  const updateStats = () => {
    setStats(getWorkoutStats())
  }

  useEffect(() => {
    updateStats()
    
    // Listen for storage changes
    const handleStorageChange = () => updateStats()
    const handleWorkoutChange = () => updateStats()
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('workoutDataChanged', handleWorkoutChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('workoutDataChanged', handleWorkoutChange)
    }
  }, [])

  const weeklyProgress = stats.weeklyGoal > 0 ? Math.min((stats.weeklyWorkouts / stats.weeklyGoal) * 100, 100) : 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <StatCard 
        icon={Calendar} 
        label="This Week" 
        value={`${stats.weeklyWorkouts} workout${stats.weeklyWorkouts !== 1 ? 's' : ''}`} 
        progress={weeklyProgress} 
      />
      <StatCard 
        icon={Flame} 
        label="Streak" 
        value={`${stats.currentStreak} day${stats.currentStreak !== 1 ? 's' : ''}`} 
      />
      <StatCard 
        icon={Target} 
        label="Weekly Goal" 
        value={`${Math.round(weeklyProgress)}%`} 
        progress={weeklyProgress} 
      />
      <StatCard 
        icon={Clock} 
        label="Avg Duration" 
        value={`${stats.avgDuration} min`} 
      />
      <StatCard 
        icon={Dumbbell} 
        label="Total Weight" 
        value={`${stats.totalWeight.toLocaleString()} lbs`} 
      />
      <StatCard 
        icon={TrendingUp} 
        label="Total Hours" 
        value={`${stats.totalHours} hrs`} 
      />
    </div>
  )
}
