"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trophy, Calendar, TrendingUp, Target, Dumbbell, Shield, Info } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { BackButton } from "@/components/back-button"
import { CreateGoalDialog } from "@/components/create-goal-dialog"
import { WorkoutSessionNotification } from "@/components/workout-session-notification"
import { useEffect, useState } from "react"
import { getWorkouts, getWorkoutStats } from "@/lib/workout-storage"
import { getGoals, getActiveGoals, getCompletedGoals } from "@/lib/goal-storage"
import Link from "next/link"

interface Goal {
  id: string
  title: string
  type: 'strength' | 'habit' | 'consistency' | 'bodyweight'
  target: number
  current: number
  unit: string
  icon: any
  completed: boolean
  completedDate?: string
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  const loadGoals = () => {
    const savedGoals = getGoals()
    const workouts = getWorkouts()
    const stats = getWorkoutStats()
    
    // If no saved goals, generate some default goals
    if (savedGoals.length === 0) {
      const defaultGoals: Goal[] = []
      
      // Weekly workout goal
      defaultGoals.push({
        id: 'weekly-workouts',
        title: 'Workout 4 times per week',
        type: 'habit',
        target: 4,
        current: stats.weeklyWorkouts,
        unit: 'workouts',
        icon: Target,
        completed: stats.weeklyWorkouts >= 4
      })
      
      // Consistency streak goal
      defaultGoals.push({
        id: 'consistency-streak',
        title: '30-day consistency streak',
        type: 'consistency',
        target: 30,
        current: stats.currentStreak,
        unit: 'days',
        icon: Calendar,
        completed: stats.currentStreak >= 30
      })
      
      setGoals(defaultGoals)
    } else {
      // Update current values for auto-tracked goals
      const updatedGoals = savedGoals.map(goal => {
        if (goal.id === 'weekly-workouts') {
          return { ...goal, current: stats.weeklyWorkouts, completed: stats.weeklyWorkouts >= 4 }
        }
        if (goal.id === 'consistency-streak') {
          return { ...goal, current: stats.currentStreak, completed: stats.currentStreak >= 30 }
        }
        return goal
      })
      setGoals(updatedGoals)
    }
    
    setLoading(false)
  }

  useEffect(() => {
    loadGoals()

    // Listen for data changes
    const handleDataChange = () => loadGoals()
    window.addEventListener('workoutDataChanged', handleDataChange)
    window.addEventListener('goalDataChanged', handleDataChange)

    return () => {
      window.removeEventListener('workoutDataChanged', handleDataChange)
      window.removeEventListener('goalDataChanged', handleDataChange)
    }
  }, [])

  const getProgress = (goal: Goal) => {
    return Math.min((goal.current / goal.target) * 100, 100)
  }

  const getStatusText = (goal: Goal) => {
    const progress = getProgress(goal)
    if (goal.completed) return "Achieved!"
    if (progress >= 90) return "Almost there!"
    if (progress >= 50) return "On track"
    return "Keep going!"
  }

  const getStatusColor = (goal: Goal) => {
    const progress = getProgress(goal)
    if (goal.completed) return "text-green-500"
    if (progress >= 90) return "text-green-500"
    if (progress >= 50) return "text-primary"
    return "text-muted-foreground"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="container mx-auto px-4 pt-12 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BackButton />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Goals</h1>
                  <p className="text-sm text-muted-foreground">Set and track your fitness targets</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <CreateGoalDialog onGoalCreated={loadGoals}>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    New Goal
                  </Button>
                </CreateGoalDialog>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted/20 rounded-lg"></div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  const activeGoals = goals.filter(goal => !goal.completed)
  const completedGoals = goals.filter(goal => goal.completed)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 pt-12 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BackButton />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Goals</h1>
                <p className="text-sm text-muted-foreground">Set and track your fitness targets</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <CreateGoalDialog onGoalCreated={loadGoals}>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  New Goal
                </Button>
              </CreateGoalDialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Active Workout Session Notification */}
        <WorkoutSessionNotification />
        
        {/* Active Goals */}
        {activeGoals.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Active Goals</h2>
            {activeGoals.map((goal) => (
              <Card key={goal.id} className="p-4 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <goal.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{goal.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {goal.current} of {goal.target} {goal.unit}
                      </p>
                      <div className="w-48 bg-muted rounded-full h-2 mt-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all" 
                          style={{ width: `${getProgress(goal)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{Math.round(getProgress(goal))}%</p>
                    <p className={`text-xs ${getStatusColor(goal)}`}>{getStatusText(goal)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Active Goals</h2>
            <Card className="p-8 bg-card border-border">
              <div className="text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No active goals yet</h3>
                <p className="text-muted-foreground mb-4">
                  Set your first fitness goal to start tracking your progress
                </p>
                <CreateGoalDialog onGoalCreated={loadGoals}>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Goal
                  </Button>
                </CreateGoalDialog>
              </div>
            </Card>
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Completed Goals</h2>
            {completedGoals.map((goal) => (
              <Card key={goal.id} className="p-4 bg-card border-border opacity-75">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Trophy className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{goal.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {goal.completedDate ? `Completed ${goal.completedDate}` : 'Recently completed'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-500">✓</p>
                    <p className="text-xs text-green-500">Achieved!</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Goal Categories */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <CreateGoalDialog goalType="strength" onGoalCreated={loadGoals}>
            <Button variant="outline" className="h-16 flex-col space-y-1 w-full">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm">Strength Goals</span>
            </Button>
          </CreateGoalDialog>
          <CreateGoalDialog goalType="habit" onGoalCreated={loadGoals}>
            <Button variant="outline" className="h-16 flex-col space-y-1 w-full">
              <Calendar className="h-5 w-5" />
              <span className="text-sm">Habit Goals</span>
            </Button>
          </CreateGoalDialog>
        </div>

        {/* App Settings */}
        <Card className="p-6 bg-card border-border mt-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">⚙️ App Settings</h3>
          <div className="space-y-3">
            <Link href="/privacy-policy" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Privacy Policy
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start">
              <Info className="h-4 w-4 mr-2" />
              About FitTracker v2.0.0
            </Button>
          </div>
        </Card>
      </main>
    </div>
  )
}
