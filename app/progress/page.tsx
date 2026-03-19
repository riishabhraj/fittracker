"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { TrendingUp, Calendar, Target, Award, FileText, Shield } from "lucide-react"
import { WorkoutFrequencyChart } from "@/components/workout-frequency-chart"
import { StrengthProgressChart } from "@/components/strength-progress-chart"
import { PersonalRecords } from "@/components/personal-records"
import { OneRMHistoryChart } from "@/components/one-rm-history-chart"
import { MuscleHeatmap } from "@/components/muscle-heatmap"
import { PushPullLegsChart } from "@/components/push-pull-legs-chart"
import { BodyMeasurements } from "@/components/body-measurements"
import { AchievementBadges } from "@/components/achievement-badges"
import { ProgressOverview } from "@/components/progress-overview"
import { WorkoutSessionNotification } from "@/components/workout-session-notification"
import { BackButton } from "@/components/back-button"
import { downloadPDFReport } from "@/lib/pdf-export"
import { toast } from "sonner"
import Link from "next/link"

const TABS = [
  { value: "overview",      label: "Overview",  icon: TrendingUp },
  { value: "strength",      label: "Strength",  icon: Target },
  { value: "body",          label: "Body",      icon: Calendar },
  { value: "achievements",  label: "Awards",    icon: Award },
]

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [gender, setGender] = useState<"male" | "female">("male")

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.ok ? r.json() : null)
      .then((p) => { if (p?.gender) setGender(p.gender) })
      .catch(() => {})
  }, [])

  const [exporting, setExporting] = useState(false)

  const handleExportPDF = async () => {
    try {
      setExporting(true)
      toast.info("Generating PDF report...")
      await downloadPDFReport()
      toast.success("PDF report downloaded!")
    } catch (error) {
      console.error("PDF export failed:", error)
      toast.error("Failed to generate PDF. Please try again.")
    } finally {
      setExporting(false)
    }
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <div className="container mx-auto px-4 pt-4 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BackButton />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Progress</h1>
                <p className="text-sm text-muted-foreground">Track your fitness journey</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={exporting}>
                <FileText className="h-4 w-4 mr-2" />
                {exporting ? "Generating..." : "PDF Report"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24">
        {/* Active Workout Session Notification */}
        <WorkoutSessionNotification className="mb-6" />
        
        <div className="space-y-6">
          {/* Tab Bar */}
          <div className="grid grid-cols-4 gap-1 bg-card p-1 rounded-xl border border-border">
            {TABS.map(({ value, label, icon: Icon }) => {
              const isActive = activeTab === value
              return (
                <button
                  key={value}
                  onClick={() => setActiveTab(value)}
                  style={isActive ? { backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" } : {}}
                  className={[
                    "flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive ? "shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted/20",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden text-xs">{label}</span>
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <ProgressOverview />
              <WorkoutFrequencyChart />
              <MuscleHeatmap gender={gender} />
              <PushPullLegsChart />
              <PersonalRecords />
            </div>
          )}
          {activeTab === "strength" && (
            <div className="space-y-6">
              <OneRMHistoryChart />
              <StrengthProgressChart />
              <PersonalRecords showAll />
            </div>
          )}
          {activeTab === "body" && (
            <div className="space-y-6">
              <BodyMeasurements />
            </div>
          )}
          {activeTab === "achievements" && (
            <div className="space-y-6">
              <AchievementBadges />
            </div>
          )}
        </div>

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
