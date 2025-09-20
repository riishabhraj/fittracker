"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Calendar, Target, Award, Download, Shield } from "lucide-react"
import { WorkoutFrequencyChart } from "@/components/workout-frequency-chart"
import { StrengthProgressChart } from "@/components/strength-progress-chart"
import { PersonalRecords } from "@/components/personal-records"
import { BodyMeasurements } from "@/components/body-measurements"
import { AchievementBadges } from "@/components/achievement-badges"
import { ProgressOverview } from "@/components/progress-overview"
import { WorkoutSessionNotification } from "@/components/workout-session-notification"
import { ThemeToggle } from "@/components/theme-toggle"
import { BackButton } from "@/components/back-button"
import { exportWorkoutData } from "@/lib/workout-storage"
import { exportGoalData } from "@/lib/goal-storage"
import { toast } from "sonner"
import Link from "next/link"

export default function ProgressPage() {
  const handleExportData = () => {
    try {
      const workoutData = JSON.parse(exportWorkoutData())
      const goalData = JSON.parse(exportGoalData())
      
      // Combine both datasets
      const combinedData = {
        workouts: workoutData.workouts,
        goals: goalData.goals,
        exportDate: new Date().toISOString(),
        version: '2.0.0',
        app: 'FitTracker'
      }
      
      const jsonString = JSON.stringify(combinedData, null, 2)
      
      // Create a blob and download the file
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `fittracker-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success("All data exported successfully!")
    } catch (error) {
      console.error('Export failed:', error)
      toast.error("Failed to export data. Please try again.")
    }
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 pt-12 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BackButton />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Progress</h1>
                <p className="text-sm text-muted-foreground">Track your fitness journey</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Active Workout Session Notification */}
        <WorkoutSessionNotification className="mb-6" />
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted/10 p-1 h-auto rounded-lg border border-border">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 py-3 px-4 rounded-md transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-muted/20 text-sm font-medium"
            >
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="strength"
              className="flex items-center gap-2 py-3 px-4 rounded-md transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-muted/20 text-sm font-medium"
            >
              <Target className="h-4 w-4" />
              Strength
            </TabsTrigger>
            <TabsTrigger
              value="body"
              className="flex items-center gap-2 py-3 px-4 rounded-md transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-muted/20 text-sm font-medium"
            >
              <Calendar className="h-4 w-4" />
              Body
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="flex items-center gap-2 py-3 px-4 rounded-md transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-muted/20 text-sm font-medium"
            >
              <Award className="h-4 w-4" />
              Awards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ProgressOverview />
            <WorkoutFrequencyChart />
            <PersonalRecords />
          </TabsContent>

          <TabsContent value="strength" className="space-y-6">
            <StrengthProgressChart />
            <PersonalRecords showAll />
          </TabsContent>

          <TabsContent value="body" className="space-y-6">
            <BodyMeasurements />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <AchievementBadges />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex justify-center">
            <Link href="/privacy-policy">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Shield className="h-4 w-4 mr-2" />
                Privacy Policy
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
