'use client'

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, TrendingUp, MoreVertical, Play, Dumbbell } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { BackButton } from "@/components/back-button"
import Link from "next/link"

interface Workout {
  id: string
  name: string
  date: string
  duration: string
  exercises: number
  totalWeight: number
  personalRecords: number
  status: "completed" | "in-progress" | "planned"
}

type FilterType = "All" | "This Week" | "This Month" | "Completed" | "With PRs"

const filters: FilterType[] = ["All", "This Week", "This Month", "Completed", "With PRs"]

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  })
}

function isThisWeek(date: Date): boolean {
  const now = new Date()
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
  startOfWeek.setHours(0, 0, 0, 0)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  
  return date >= startOfWeek && date <= endOfWeek
}

function isThisMonth(date: Date): boolean {
  const now = new Date()
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
}

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [activeFilter, setActiveFilter] = useState<FilterType>("All")
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([])

  // Load workouts from localStorage
  useEffect(() => {
    const loadWorkouts = () => {
      try {
        const savedWorkouts = localStorage.getItem('fittracker_workouts')
        if (savedWorkouts) {
          const parsedWorkouts = JSON.parse(savedWorkouts)
          const formattedWorkouts: Workout[] = parsedWorkouts.map((workout: any, index: number) => ({
            id: workout.id || `workout-${index}`,
            name: workout.name || 'Custom Workout',
            date: workout.date || new Date().toISOString().split('T')[0],
            duration: `${workout.duration || 0} min`,
            exercises: workout.exercises?.length || 0,
            totalWeight: workout.totalWeight || 0,
            personalRecords: workout.personalRecords || 0,
            status: workout.status || 'completed'
          }))
          
          // Sort by date (newest first)
          formattedWorkouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          setWorkouts(formattedWorkouts)
        }
      } catch (error) {
        console.error('Error loading workouts:', error)
        setWorkouts([])
      }
    }

    loadWorkouts()
    
    // Listen for workout updates
    const handleStorageChange = () => {
      loadWorkouts()
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('workoutDataChanged', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('workoutDataChanged', handleStorageChange)
    }
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...workouts]
    
    switch (activeFilter) {
      case "This Week":
        filtered = workouts.filter(workout => isThisWeek(new Date(workout.date)))
        break
      case "This Month":
        filtered = workouts.filter(workout => isThisMonth(new Date(workout.date)))
        break
      case "Completed":
        filtered = workouts.filter(workout => workout.status === "completed")
        break
      case "With PRs":
        filtered = workouts.filter(workout => workout.personalRecords > 0)
        break
      case "All":
      default:
        filtered = workouts
        break
    }
    
    setFilteredWorkouts(filtered)
  }, [workouts, activeFilter])

  const totalWorkouts = workouts.length
  const avgDuration = workouts.length > 0 
    ? Math.round(workouts.reduce((sum, w) => sum + parseInt(w.duration), 0) / workouts.length) 
    : 0
  const totalPRs = workouts.reduce((sum, w) => sum + w.personalRecords, 0)
  const totalWeight = workouts.reduce((sum, w) => sum + w.totalWeight, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 pt-12 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BackButton />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Workout History</h1>
                <p className="text-sm text-muted-foreground">View all your completed workouts</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={filter === activeFilter ? "default" : "outline"}
              size="sm"
              className="h-8"
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </Button>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-card border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{totalWorkouts}</div>
              <div className="text-sm text-muted-foreground">Total Workouts</div>
            </div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{avgDuration}m</div>
              <div className="text-sm text-muted-foreground">Avg Duration</div>
            </div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{totalPRs}</div>
              <div className="text-sm text-muted-foreground">Personal Records</div>
            </div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {totalWeight > 0 ? (totalWeight / 1000).toFixed(1) + 'k' : '0'}
              </div>
              <div className="text-sm text-muted-foreground">Total Weight (lbs)</div>
            </div>
          </Card>
        </div>

        {/* Workouts List */}
        <div className="space-y-4">
          {filteredWorkouts.length === 0 ? (
            <Card className="p-8 bg-card border-border">
              <div className="text-center">
                <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {activeFilter === "All" ? "No workouts yet" : `No workouts found for "${activeFilter}"`}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {activeFilter === "All" 
                    ? "Start your fitness journey by logging your first workout!"
                    : "Try adjusting your filter or log more workouts."
                  }
                </p>
                <Link href="/log-workout">
                  <Button className="bg-primary hover:bg-primary/90">
                    <Play className="h-4 w-4 mr-2" />
                    Start Your First Workout
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            filteredWorkouts.map((workout) => (
              <Card key={workout.id} className="p-6 bg-card border-border hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{workout.name}</h3>
                      {workout.personalRecords > 0 && (
                        <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {workout.personalRecords} PR{workout.personalRecords > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(workout.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {workout.duration}
                      </span>
                      <span>{workout.exercises} exercises</span>
                      {workout.totalWeight > 0 && (
                        <span>{workout.totalWeight.toLocaleString()} lbs total</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href="/log-workout" className="block">
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          <Play className="h-4 w-4 mr-1" />
                          Repeat Workout
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Load More */}
        {filteredWorkouts.length > 0 && (
          <div className="text-center">
            <Button variant="outline" className="w-full md:w-auto">
              Load More Workouts
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
