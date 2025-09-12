"use client"

import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, Dumbbell } from "lucide-react"
import { WorkoutStats } from "@/components/workout-stats"
import { WorkoutTemplates } from "@/components/workout-templates"
import { WeeklyCalendar } from "@/components/weekly-calendar"
import { RecentWorkouts } from "@/components/recent-workouts"
import { ClientInstallPrompts } from "@/components/client-install-prompts"
import { OfflineIndicator } from "@/components/offline-indicator"
import { ThemeToggle } from "@/components/theme-toggle"
import { getWorkoutStats } from "@/lib/workout-storage"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function HomePage() {
  const [isNewUser, setIsNewUser] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stats = getWorkoutStats()
    setIsNewUser(stats.totalWorkouts === 0)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Dumbbell className="h-8 w-8 text-primary mx-auto mb-2 animate-pulse" />
          <p className="text-muted-foreground">Loading FitTracker...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <ClientInstallPrompts />
      <OfflineIndicator />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 pt-12 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">FitTracker</h1>
              <p className="text-sm text-muted-foreground">
                {isNewUser ? "Welcome! Ready to start your fitness journey?" : "Your workout companion"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Link href="/log-workout">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  {isNewUser ? "Start First Workout" : "Log Workout"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {isNewUser && (
          // Welcome message for new users
          <div className="text-center space-y-4 py-8">
            <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto">
              <Dumbbell className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Welcome to FitTracker!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your personal fitness companion that works completely offline. 
              Track workouts, monitor progress, and achieve your goals.
            </p>
          </div>
        )}

        {/* Always show WorkoutStats and WeeklyCalendar for existing users */}
        {!isNewUser && (
          <>
            <WorkoutStats />
            <WeeklyCalendar />
          </>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/log-workout">
            <Button className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="h-5 w-5 mr-2" />
              {isNewUser ? "Log First Workout" : "Start Workout"}
            </Button>
          </Link>
          <Link href="/progress">
            <Button variant="outline" className="w-full h-16 border-border hover:bg-muted/10 bg-transparent">
              <TrendingUp className="h-5 w-5 mr-2" />
              {isNewUser ? "Explore Features" : "View Progress"}
            </Button>
          </Link>
        </div>

        {/* Features Preview for new users */}
        {isNewUser && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="text-center space-y-3 p-6 rounded-lg bg-card border border-border">
              <div className="p-3 bg-blue-500/10 rounded-full w-fit mx-auto">
                <Plus className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-foreground">Easy Workout Logging</h3>
              <p className="text-sm text-muted-foreground">
                Track exercises, sets, reps, and weights with our intuitive interface and built-in timer.
              </p>
            </div>

            <div className="text-center space-y-3 p-6 rounded-lg bg-card border border-border">
              <div className="p-3 bg-green-500/10 rounded-full w-fit mx-auto">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-semibold text-foreground">Progress Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Visualize your improvement with charts, personal records, and detailed statistics.
              </p>
            </div>

            <div className="text-center space-y-3 p-6 rounded-lg bg-card border border-border">
              <div className="p-3 bg-purple-500/10 rounded-full w-fit mx-auto">
                <Dumbbell className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-semibold text-foreground">Offline First</h3>
              <p className="text-sm text-muted-foreground">
                Works perfectly without internet. Your data stays private and secure on your device.
              </p>
            </div>
          </div>
        )}

        {/* Quick Start (WorkoutTemplates) - MOVED TO END */}
        <WorkoutTemplates />

        {/* Recent Workouts - MOVED TO END */}
        <RecentWorkouts />
      </main>
    </div>
  )
}
