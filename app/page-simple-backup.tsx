import { Button } from "@/components/ui/button"
import { Plus, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">FitTracker</h1>
              <p className="text-sm text-muted-foreground">Your workout companion</p>
            </div>
            <div className="flex items-center space-x-2">
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
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Ready to track your fitness journey?</h2>
          <p className="text-muted-foreground">
            Your workout data stays private and secure on your device. Start logging workouts to see your progress!
          </p>
        </div>

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

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="text-center space-y-2 p-4">
            <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium text-foreground">Easy Logging</h3>
            <p className="text-sm text-muted-foreground">
              Quick and intuitive workout tracking with built-in timer
            </p>
          </div>

          <div className="text-center space-y-2 p-4">
            <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium text-foreground">Progress Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Visual charts and statistics to monitor your improvement
            </p>
          </div>

          <div className="text-center space-y-2 p-4">
            <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium text-foreground">Offline First</h3>
            <p className="text-sm text-muted-foreground">
              Works perfectly without internet connection
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
