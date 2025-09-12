import { Button } from "@/components/ui/button"
import { Plus, TrendingUp } from "lucide-react"
import { WorkoutStats } from "@/components/workout-stats"
import { WorkoutTemplates } from "@/components/workout-templates"
import { WeeklyCalendar } from "@/components/weekly-calendar"
import { RecentWorkouts } from "@/components/recent-workouts"
import { ClientInstallPrompts } from "@/components/client-install-prompts"
import { OfflineIndicator } from "@/components/offline-indicator"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <ClientInstallPrompts />
      <OfflineIndicator />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">FitTracker</h1>
              <p className="text-sm text-muted-foreground">Your workout companion</p>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Link href="/log-workout">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Log Workout
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        <WorkoutStats />

        <WeeklyCalendar />

        <WorkoutTemplates />

        <RecentWorkouts />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/log-workout">
            <Button className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="h-5 w-5 mr-2" />
              Start Workout
            </Button>
          </Link>
          <Link href="/progress">
            <Button variant="outline" className="w-full h-16 border-border hover:bg-muted/10 bg-transparent">
              <TrendingUp className="h-5 w-5 mr-2" />
              View Progress
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
