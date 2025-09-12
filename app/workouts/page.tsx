import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, TrendingUp, MoreVertical, Play } from "lucide-react"
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

const allWorkouts: Workout[] = [
  {
    id: "1",
    name: "Upper Body Strength",
    date: "2024-01-15",
    duration: "48 min",
    exercises: 8,
    totalWeight: 2450,
    personalRecords: 2,
    status: "completed"
  },
  {
    id: "2",
    name: "HIIT Cardio",
    date: "2024-01-13",
    duration: "32 min",
    exercises: 6,
    totalWeight: 0,
    personalRecords: 0,
    status: "completed"
  },
  {
    id: "3",
    name: "Lower Body Power",
    date: "2024-01-11",
    duration: "52 min",
    exercises: 10,
    totalWeight: 3200,
    personalRecords: 1,
    status: "completed"
  },
  {
    id: "4",
    name: "Full Body Circuit",
    date: "2024-01-09",
    duration: "45 min",
    exercises: 12,
    totalWeight: 1800,
    personalRecords: 0,
    status: "completed"
  },
  {
    id: "5",
    name: "Push Day",
    date: "2024-01-07",
    duration: "58 min",
    exercises: 9,
    totalWeight: 2890,
    personalRecords: 3,
    status: "completed"
  },
  {
    id: "6",
    name: "Core & Flexibility",
    date: "2024-01-05",
    duration: "28 min",
    exercises: 5,
    totalWeight: 0,
    personalRecords: 0,
    status: "completed"
  }
]

const filters = ["All", "This Week", "This Month", "Completed", "With PRs"]

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  })
}

export default function WorkoutsPage() {
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
              variant={filter === "All" ? "default" : "outline"}
              size="sm"
              className="h-8"
            >
              {filter}
            </Button>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-card border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{allWorkouts.length}</div>
              <div className="text-sm text-muted-foreground">Total Workouts</div>
            </div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {Math.round(allWorkouts.reduce((sum, w) => sum + parseInt(w.duration), 0) / allWorkouts.length)}m
              </div>
              <div className="text-sm text-muted-foreground">Avg Duration</div>
            </div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {allWorkouts.reduce((sum, w) => sum + w.personalRecords, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Personal Records</div>
            </div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {(allWorkouts.reduce((sum, w) => sum + w.totalWeight, 0) / 1000).toFixed(1)}k
              </div>
              <div className="text-sm text-muted-foreground">Total Weight (lbs)</div>
            </div>
          </Card>
        </div>

        {/* Workouts List */}
        <div className="space-y-4">
          {allWorkouts.map((workout) => (
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
          ))}
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline" className="w-full md:w-auto">
            Load More Workouts
          </Button>
        </div>
      </main>
    </div>
  )
}
