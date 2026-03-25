"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { TrendingUp, Calendar, Target, FileText, Shield, Lock, Flag, CheckCircle2, Circle } from "lucide-react"
import { WorkoutFrequencyChart } from "@/components/workout-frequency-chart"
import { StrengthProgressChart } from "@/components/strength-progress-chart"
import { PersonalRecords } from "@/components/personal-records"
import { OneRMHistoryChart } from "@/components/one-rm-history-chart"
import { MuscleHeatmap } from "@/components/muscle-heatmap"
import { PushPullLegsChart } from "@/components/push-pull-legs-chart"
import { BodyMeasurements } from "@/components/body-measurements"
import { ProgressOverview } from "@/components/progress-overview"
import { WorkoutSessionNotification } from "@/components/workout-session-notification"
import { BackButton } from "@/components/back-button"
import { AIInsightPreviewCard } from "@/components/ai-insight-preview-card"
import { PlateauPreviewCard } from "@/components/plateau-preview-card"
import { UpgradeModal } from "@/components/upgrade-modal"
import { useSubscription } from "@/hooks/use-subscription"
import { downloadPDFReport } from "@/lib/pdf-export"
import { getGoals, type Goal } from "@/lib/goal-storage"
import { toast } from "sonner"
import Link from "next/link"

const TABS = [
  { value: "overview",  label: "Overview",  icon: TrendingUp },
  { value: "strength",  label: "Strength",  icon: Target },
  { value: "body",      label: "Body",      icon: Calendar },
  { value: "goals",     label: "Goals",     icon: Flag },
]

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [gender, setGender] = useState<"male" | "female">("male")
  const [showPdfUpgrade, setShowPdfUpgrade] = useState(false)
  const { isPro } = useSubscription()

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.ok ? r.json() : null)
      .then((p) => { if (p?.gender) setGender(p.gender) })
      .catch(() => {})
  }, [])

  const [exporting, setExporting] = useState(false)
  const [goals, setGoals] = useState<Goal[]>([])

  useEffect(() => {
    getGoals().then(setGoals).catch(() => {})
    window.addEventListener("goalDataChanged", () => getGoals().then(setGoals).catch(() => {}))
    return () => window.removeEventListener("goalDataChanged", () => {})
  }, [])

  const handleExportPDF = async () => {
    if (!isPro) {
      setShowPdfUpgrade(true)
      return
    }
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
                {isPro ? (
                  <FileText className="h-4 w-4 mr-2" />
                ) : (
                  <Lock className="h-4 w-4 mr-2" />
                )}
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
              <AIInsightPreviewCard />
              <WorkoutFrequencyChart />
              <MuscleHeatmap gender={gender} />
              <PushPullLegsChart />
              <PlateauPreviewCard />
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
          {activeTab === "goals" && (
            <div className="space-y-4">
              {goals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="text-5xl mb-4">🎯</span>
                  <p className="font-semibold text-foreground text-lg">No goals yet</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xs">Set your first goal to start tracking progress.</p>
                  <Link href="/goals">
                    <button
                      className="mt-5 px-6 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
                      style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
                    >
                      Add a Goal
                    </button>
                  </Link>
                </div>
              ) : (
                <>
                  {/* Summary row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-card border border-border p-4 text-center">
                      <p className="text-2xl font-bold text-foreground">{goals.filter(g => !g.completed).length}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Active</p>
                    </div>
                    <div className="rounded-2xl bg-card border border-border p-4 text-center">
                      <p className="text-2xl font-bold" style={{ color: "hsl(80 100% 50%)" }}>{goals.filter(g => g.completed).length}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Completed</p>
                    </div>
                  </div>

                  {/* Active goals */}
                  {goals.filter(g => !g.completed).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">In Progress</p>
                      <div className="space-y-3">
                        {goals.filter(g => !g.completed).map(goal => {
                          const pct = Math.min(100, Math.round((goal.current / goal.target) * 100))
                          return (
                            <div key={goal.id} className="rounded-2xl bg-card border border-border p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <span className="text-xl shrink-0">{goal.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-foreground truncate">{goal.title}</p>
                                  {goal.description && <p className="text-xs text-muted-foreground leading-snug">{goal.description}</p>}
                                </div>
                                <span className="text-xs font-bold shrink-0" style={{ color: "hsl(80 100% 50%)" }}>{pct}%</span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
                                <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: "hsl(80 100% 50%)" }} />
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-1.5">
                                {goal.current} / {goal.target} {goal.unit}
                                {goal.targetDate && ` · Due ${new Date(goal.targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Completed goals */}
                  {goals.filter(g => g.completed).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Completed</p>
                      <div className="space-y-2">
                        {goals.filter(g => g.completed).map(goal => (
                          <div key={goal.id} className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3 opacity-70">
                            <span className="text-xl shrink-0">{goal.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{goal.title}</p>
                              <p className="text-xs text-muted-foreground">{goal.target} {goal.unit} · Completed</p>
                            </div>
                            <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: "hsl(80 100% 50%)" }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link href="/goals">
                    <button className="w-full py-3 rounded-2xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
                      Manage Goals →
                    </button>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        <UpgradeModal
          open={showPdfUpgrade}
          onClose={() => setShowPdfUpgrade(false)}
          reason="You've been training consistently. Export your full progress history as a shareable PDF report."
        />

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
