"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Target, TrendingUp, Calendar, Award, Dumbbell } from "lucide-react"
import { getWorkoutStats } from "@/lib/workout-storage"
import { useEffect, useState } from "react"
import Link from "next/link"

interface WorkoutStats {
  totalWorkouts: number
  weeklyWorkouts: number
  totalSets: number
  totalReps: number
  totalWeight: number
  totalHours: number
  currentStreak: number
  weeklyGoal: number
  avgDuration: number
}

export function ProgressOverview() {
  const [stats, setStats] = useState<WorkoutStats | null>(null)
  const [isNewUser, setIsNewUser] = useState(true)

  useEffect(() => {
    const workoutStats = getWorkoutStats()
    setStats(workoutStats)
    setIsNewUser(workoutStats.totalWorkouts === 0)
  }, [])

  if (!stats) {
    return <div>Loading...</div>
  }

  if (isNewUser) {
    return (
      <div className="space-y-6">
        {/* Welcome Message for New Users */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="text-center space-y-4">
            <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto">
              <Dumbbell className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to FitTracker!</h2>
              <p className="text-muted-foreground mb-4">
                Start your fitness journey today. Log your first workout to see your progress here.
              </p>
              <Link href="/log-workout">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Log Your First Workout
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Getting Started Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-card border-border">
            <div className="text-center space-y-2">
              <div className="p-2 bg-blue-500/10 rounded-lg w-fit mx-auto">
                <Plus className="h-5 w-5 text-blue-500" />
              </div>
              <h3 className="font-medium text-foreground">1. Log Workouts</h3>
              <p className="text-sm text-muted-foreground">
                Track exercises, sets, reps, and weights
              </p>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="text-center space-y-2">
              <div className="p-2 bg-green-500/10 rounded-lg w-fit mx-auto">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <h3 className="font-medium text-foreground">2. Track Progress</h3>
              <p className="text-sm text-muted-foreground">
                View charts and personal records
              </p>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="text-center space-y-2">
              <div className="p-2 bg-purple-500/10 rounded-lg w-fit mx-auto">
                <Target className="h-5 w-5 text-purple-500" />
              </div>
              <h3 className="font-medium text-foreground">3. Set Goals</h3>
              <p className="text-sm text-muted-foreground">
                Achieve fitness milestones
              </p>
            </div>
          </Card>
        </div>

        {/* Motivational Quote */}
        <Card className="p-4 bg-card border-border">
          <div className="text-center">
            <p className="text-lg font-medium text-foreground mb-2">
              "The journey of a thousand miles begins with one step."
            </p>
            <p className="text-sm text-muted-foreground">
              Your fitness journey starts with your first workout. Let's get started! 💪
            </p>
          </div>
        </Card>
      </div>
    )
  }

  // Show real stats for existing users
  const weeklyProgress = Math.round((stats.weeklyWorkouts / stats.weeklyGoal) * 100)
  
  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Workouts</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalWorkouts}</p>
              <p className="text-xs text-green-500">
                {stats.weeklyWorkouts} this week
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Weekly Goal</p>
              <p className="text-2xl font-bold text-foreground">{weeklyProgress}%</p>
              <p className="text-xs text-green-500">
                {stats.weeklyWorkouts}/{stats.weeklyGoal} workouts
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Volume</p>
              <p className="text-2xl font-bold text-foreground">
                {stats.totalWeight > 1000 
                  ? `${(stats.totalWeight / 1000).toFixed(1)}K` 
                  : stats.totalWeight
                }
              </p>
              <p className="text-xs text-green-500">lbs lifted</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Award className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="text-2xl font-bold text-foreground">{stats.currentStreak}</p>
              <p className="text-xs text-green-500">
                {stats.currentStreak === 1 ? 'day' : 'days'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Sets</p>
            <p className="text-3xl font-bold text-primary">{stats.totalSets}</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Avg Duration</p>
            <p className="text-3xl font-bold text-primary">{stats.avgDuration}m</p>
          </div>
        </Card>
      </div>

      {/* Weekly Progress Bar */}
      <Card className="p-4 bg-card border-border">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="font-medium text-foreground">Weekly Goal Progress</p>
            <p className="text-sm text-muted-foreground">{stats.weeklyWorkouts}/{stats.weeklyGoal}</p>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(weeklyProgress, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground">
            {weeklyProgress >= 100 
              ? "🎉 Weekly goal achieved!" 
              : `${stats.weeklyGoal - stats.weeklyWorkouts} more workouts to reach your goal`
            }
          </p>
        </div>
      </Card>
    </div>
  )
}
