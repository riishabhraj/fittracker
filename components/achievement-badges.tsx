"use client"

import type React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Flame, Calendar, Dumbbell, TrendingUp, Star } from "lucide-react"
import { useEffect, useState } from "react"
import { getWorkouts, getWorkoutStats } from "@/lib/workout-storage"

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ElementType
  earned: boolean
  earnedDate?: string
  progress?: number
  target?: number
}

export function AchievementBadges() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const calculateAchievements = () => {
      const workouts = getWorkouts()
      const stats = getWorkoutStats()
      
      // Calculate achievements based on real data
      const calculatedAchievements: Achievement[] = [
        {
          id: "1",
          title: "First Workout",
          description: "Complete your first workout",
          icon: Dumbbell,
          earned: workouts.length > 0,
          earnedDate: workouts.length > 0 ? getRelativeDate(workouts[0].date) : undefined,
        },
        {
          id: "2",
          title: "Week Warrior",
          description: "Complete 5 workouts in a week",
          icon: Calendar,
          earned: stats.weeklyWorkouts >= 5,
          earnedDate: stats.weeklyWorkouts >= 5 ? "This week" : undefined,
          progress: stats.weeklyWorkouts,
          target: 5,
        },
        {
          id: "3",
          title: "Consistency King",
          description: "Maintain a 30-day workout streak",
          icon: Flame,
          earned: stats.currentStreak >= 30,
          earnedDate: stats.currentStreak >= 30 ? getRelativeDate(new Date().toISOString()) : undefined,
          progress: stats.currentStreak,
          target: 30,
        },
        {
          id: "4",
          title: "Strength Milestone",
          description: "Bench press your body weight",
          icon: Trophy,
          earned: hasBodyWeightBenchPress(workouts),
          earnedDate: hasBodyWeightBenchPress(workouts) ? "Recently achieved" : undefined,
        },
        {
          id: "5",
          title: "Volume Victor",
          description: "Lift 50,000 lbs total volume",
          icon: TrendingUp,
          earned: stats.totalWeight >= 50000,
          earnedDate: stats.totalWeight >= 50000 ? "Recently achieved" : undefined,
          progress: stats.totalWeight,
          target: 50000,
        },
        {
          id: "6",
          title: "Goal Getter",
          description: "Achieve your monthly workout goal",
          icon: Target,
          earned: hasMonthlyGoal(workouts),
          earnedDate: hasMonthlyGoal(workouts) ? "This month" : undefined,
          progress: getMonthlyWorkouts(workouts),
          target: 16, // 4 workouts per week * 4 weeks
        },
        {
          id: "7",
          title: "Century Club",
          description: "Complete 100 total workouts",
          icon: Star,
          earned: workouts.length >= 100,
          earnedDate: workouts.length >= 100 ? "Milestone reached" : undefined,
          progress: workouts.length,
          target: 100,
        },
      ]

      setAchievements(calculatedAchievements)
      setLoading(false)
    }

    calculateAchievements()

    // Listen for workout data changes
    const handleDataChange = () => calculateAchievements()
    window.addEventListener('workoutDataChanged', handleDataChange)

    return () => {
      window.removeEventListener('workoutDataChanged', handleDataChange)
    }
  }, [])

  const getRelativeDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 14) return "1 week ago"
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 60) return "1 month ago"
    return `${Math.floor(diffDays / 30)} months ago`
  }

  const hasBodyWeightBenchPress = (workouts: any[]) => {
    // This is a simplified check - in a real app, you'd need user's body weight
    return workouts.some(workout =>
      workout.exercises.some((exercise: any) =>
        exercise.name.toLowerCase().includes('bench') &&
        exercise.sets.some((set: any) => set.completed && set.weight >= 150) // Assuming average body weight
      )
    )
  }

  const hasMonthlyGoal = (workouts: any[]) => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthlyWorkouts = workouts.filter(w => new Date(w.date) >= startOfMonth)
    return monthlyWorkouts.length >= 16 // 4 workouts per week * 4 weeks
  }

  const getMonthlyWorkouts = (workouts: any[]) => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    return workouts.filter(w => new Date(w.date) >= startOfMonth).length
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="p-6 bg-card border-border">
          <div className="animate-pulse">
            <div className="h-6 bg-muted/20 rounded mb-2"></div>
            <div className="h-4 bg-muted/20 rounded w-2/3"></div>
          </div>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4 border bg-card border-border">
              <div className="animate-pulse">
                <div className="h-5 bg-muted/20 rounded mb-2"></div>
                <div className="h-4 bg-muted/20 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted/20 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const earnedCount = achievements.filter((a) => a.earned).length
  const totalCount = achievements.length

  if (earnedCount === 0) {
    return (
      <div className="space-y-6">
        {/* Achievement Summary */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Achievement Progress</h3>
              <p className="text-sm text-muted-foreground">
                Start working out to unlock achievements
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-muted-foreground">0%</p>
              <p className="text-sm text-muted-foreground">Complete</p>
            </div>
          </div>
        </Card>

        {/* Achievement Grid - Show available achievements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.slice(0, 4).map((achievement) => (
            <Card
              key={achievement.id}
              className="p-4 border bg-card border-border hover:border-primary/30 transition-all"
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-muted/20 text-muted-foreground">
                  <achievement.icon className="h-5 w-5" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-muted-foreground">
                      {achievement.title}
                    </h4>
                    <Badge variant="outline" className="border-muted-foreground/20 text-muted-foreground">
                      Locked
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                  <p className="text-xs text-muted-foreground">Complete workouts to unlock</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Achievement Summary */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Achievement Progress</h3>
            <p className="text-sm text-muted-foreground">
              {earnedCount} of {totalCount} achievements unlocked
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary">{Math.round((earnedCount / totalCount) * 100)}%</p>
            <p className="text-sm text-muted-foreground">Complete</p>
          </div>
        </div>
      </Card>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <Card
            key={achievement.id}
            className={`p-4 border transition-all ${
              achievement.earned ? "bg-primary/5 border-primary/20" : "bg-card border-border hover:border-primary/30"
            }`}
          >
            <div className="flex items-start space-x-3">
              <div
                className={`p-2 rounded-lg ${
                  achievement.earned ? "bg-primary/20 text-primary" : "bg-muted/20 text-muted-foreground"
                }`}
              >
                <achievement.icon className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-medium ${achievement.earned ? "text-foreground" : "text-muted-foreground"}`}>
                    {achievement.title}
                  </h4>
                  {achievement.earned && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      Earned
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>

                {achievement.earned ? (
                  <p className="text-xs text-primary">{achievement.earnedDate}</p>
                ) : achievement.progress !== undefined && achievement.target !== undefined ? (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {achievement.progress.toLocaleString()} / {achievement.target.toLocaleString()}
                      </span>
                      <span className="text-primary">
                        {Math.round((achievement.progress / achievement.target) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted/20 rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Not started</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
