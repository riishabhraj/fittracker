"use client"

import { Button } from "@/components/ui/button"
import { TrendingUp, Plus, Sparkles, Flame, Dumbbell, Wand2 } from "lucide-react"
import Image from "next/image"
import { WorkoutStats } from "@/components/workout-stats"
import { WorkoutTemplates } from "@/components/workout-templates"
import { WeeklyCalendar } from "@/components/weekly-calendar"
import { RecentWorkouts } from "@/components/recent-workouts"
import { WorkoutSessionNotification } from "@/components/workout-session-notification"
import { ClientInstallPrompts } from "@/components/client-install-prompts"
import { OfflineIndicator } from "@/components/offline-indicator"
import { getWorkoutStats } from "@/lib/workout-storage"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { PlateauAlertCard } from "@/components/plateau-alert-card"
import { ReadinessScoreCard } from "@/components/readiness-score-card"
import { NewBadgeNotifier } from "@/components/new-badge-notifier"
import { TrialBanner } from "@/components/trial-banner"
import { TrialExpiredModal } from "@/components/trial-expired-modal"
import { StreakProtectionBanner } from "@/components/streak-protection-banner"
import { useSubscription } from "@/hooks/use-subscription"
import { UpgradeModal } from "@/components/upgrade-modal"
import {
  getInsight,
  getAICoachTip,
  getPersonalizedTemplates,
  GOAL_LABELS,
  EXPERIENCE_LABELS,
  type FitnessProfile,
} from "@/lib/fitness-utils"

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return { text: "Good morning", emoji: "☀️" }
  if (h < 17) return { text: "Good afternoon", emoji: "💪" }
  return { text: "Good evening", emoji: "🌙" }
}

const MOTIVATIONAL = [
  "Push harder than yesterday.",
  "Every rep counts.",
  "Consistency beats intensity.",
  "You're one workout away from a good mood.",
  "Strong body, strong mind.",
]

export default function HomePage() {
  const [isNewUser, setIsNewUser] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [quote] = useState(() => MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)])
  const [profile, setProfile] = useState<FitnessProfile | null>(null)
  const [streak, setStreak] = useState(0)
  const [totalWorkouts, setTotalWorkouts] = useState(0)
  const [weeklyUpgradeOpen, setWeeklyUpgradeOpen] = useState(false)
  const { data: session } = useSession()
  const { isPro } = useSubscription()
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const [stats, profileRes] = await Promise.all([
        getWorkoutStats(),
        fetch("/api/profile").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      ])

      if (!profileRes?.onboardingCompleted) {
        router.push("/onboarding")
        return
      }

      setProfile(profileRes)
      setStreak(stats.currentStreak)
      setTotalWorkouts(stats.totalWorkouts)
      setIsNewUser(stats.totalWorkouts === 0)
      setIsLoading(false)
    }
    load()
  }, [router])

  const greeting = getGreeting()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Image src="/fittracker-app-icon.png" alt="FitTracker" width={48} height={48} className="mx-auto mb-3 rounded-2xl animate-pulse" />
          <p className="text-muted-foreground text-sm">Loading…</p>
        </div>
      </div>
    )
  }

  const userName = session?.user?.name?.split(" ")[0] ?? "there"
  const insight = profile ? getInsight(profile) : null
  const personalizedTemplates = profile ? getPersonalizedTemplates(profile).slice(0, 3) : []
  const aiCoachTip = profile?.goal ? getAICoachTip(profile.goal, totalWorkouts) : null

  return (
    <div className="min-h-screen bg-background">
      <ClientInstallPrompts />
      <OfflineIndicator />
      <TrialExpiredModal />
      <UpgradeModal
        open={weeklyUpgradeOpen}
        onClose={() => setWeeklyUpgradeOpen(false)}
        reason="You showed up this week 💪 — see exactly how your volume, sets, and intensity compare to your targets."
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <TrialBanner />
        <div className="px-5 pt-4 pb-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground font-medium">
                  {greeting.text} {greeting.emoji}
                </p>
                {streak > 0 && (
                  <span
                    className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "rgba(249,115,22,0.15)", color: "#f97316" }}
                  >
                    <Flame className="h-3 w-3" />
                    {streak}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-foreground mt-0.5 leading-tight">
                {isNewUser ? `Welcome, ${userName}!` : quote}
              </h1>
            </div>
            {session?.user?.image ? (
              <img src={session.user.image} alt={session.user.name ?? "User"} width={40} height={40} className="rounded-xl mt-1 object-cover" />
            ) : (
              <Image src="/fittracker-app-icon.png" alt="FitTracker" width={40} height={40} className="rounded-xl mt-1" />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-5 py-5 pb-24 space-y-6">
        <WorkoutSessionNotification />

        {isNewUser ? (
          /* ── New user: personalised welcome ── */
          <div className="space-y-5">

            {/* Profile chips */}
            {profile && (
              <div className="flex flex-wrap gap-2">
                {profile.goal && (
                  <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                    {GOAL_LABELS[profile.goal]}
                  </span>
                )}
                {profile.experienceLevel && (
                  <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-card border border-border text-muted-foreground">
                    {EXPERIENCE_LABELS[profile.experienceLevel]}
                  </span>
                )}
                {profile.workoutDaysPerWeek && (
                  <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-card border border-border text-muted-foreground">
                    {profile.workoutDaysPerWeek}× / week
                  </span>
                )}
              </div>
            )}

            {/* AI Insight card */}
            {insight && (
              <div className="rounded-2xl bg-card border border-border p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="text-xs font-semibold text-primary uppercase tracking-widest">AI Insight</p>
                </div>
                <p className="font-bold text-foreground text-base mb-1">{insight.program}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
              </div>
            )}

            {/* Primary CTAs */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/log-workout">
                <Button className="w-full h-13 text-base font-semibold" style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}>
                  <Plus className="h-5 w-5 mr-2" />
                  Start Workout
                </Button>
              </Link>
              <Link href="/generate-workout">
                <Button variant="outline" className="w-full h-13 text-base font-semibold">
                  <Wand2 className="h-5 w-5 mr-2" />
                  AI Generate
                </Button>
              </Link>
            </div>

            {/* Personalized quick-start templates */}
            {personalizedTemplates.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Your Program</p>
                <div className="space-y-2">
                  {personalizedTemplates.map((t) => (
                    <Link key={t.name} href="/templates">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Dumbbell className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{t.name}</p>
                            <p className="text-xs text-muted-foreground">{t.exercises.length} exercises</p>
                          </div>
                        </div>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Empty placeholder progress cards */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Progress</p>
              <div className="space-y-3">
                {[
                  { title: "Strength Progress", desc: "Log your first workout to start tracking PRs." },
                  { title: "Weekly Activity", desc: "Complete a session to see your weekly streak." },
                  { title: "Body Weight Trend", desc: "Coming soon — log weight in your profile." },
                ].map(({ title, desc }) => (
                  <div key={title} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border border-dashed opacity-60">
                    <div className="w-9 h-9 rounded-xl bg-muted/20 flex items-center justify-center shrink-0">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ── Returning user dashboard ── */
          <div className="space-y-6">
            <NewBadgeNotifier />
            {/* Streak protection */}
            <StreakProtectionBanner />
            {/* Readiness score */}
            <ReadinessScoreCard />

            {/* Stats */}
            <WorkoutStats />

            {/* Weekly breakdown lock — free users only */}
            {!isPro && (
              <button
                type="button"
                onClick={() => setWeeklyUpgradeOpen(true)}
                className="w-full rounded-2xl border p-4 flex items-center gap-4 active:scale-[0.98] transition-transform text-left"
                style={{ backgroundColor: "hsl(0 0% 11%)", borderColor: "hsl(0 0% 18%)" }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4" style={{ color: "hsl(80 100% 50%)" }} />
                    <p className="text-sm font-semibold text-foreground">Full Weekly Breakdown</p>
                  </div>
                  <div className="space-y-1.5 select-none">
                    {["Volume by muscle group", "Sets vs. target", "Intensity trends"].map((label) => (
                      <div key={label} className="flex items-center gap-2">
                        <div className="h-1.5 rounded-full flex-1 overflow-hidden bg-border">
                          <div className="h-1.5 rounded-full bg-border w-3/5 blur-[3px]" />
                        </div>
                        <span className="text-[10px] text-muted-foreground blur-[3px] select-none">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-center gap-1">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "hsl(80 100% 50% / 0.15)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: "hsl(80 100% 50%)" }}>
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                    </svg>
                  </div>
                  <span className="text-[10px] font-semibold" style={{ color: "hsl(80 100% 50%)" }}>Pro</span>
                </div>
              </button>
            )}

            {/* Weekly calendar */}
            <WeeklyCalendar />

            {/* CTA row */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/log-workout">
                <button
                  className="w-full h-14 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-transform active:scale-95"
                  style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
                >
                  <Plus className="h-5 w-5" />
                  Start Workout
                </button>
              </Link>
              <Link href="/generate-workout">
                <button className="w-full h-14 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 bg-card border border-border text-foreground transition-transform active:scale-95">
                  <Wand2 className="h-5 w-5" />
                  AI Generate
                </button>
              </Link>
            </div>

            {/* Recent workouts */}
            <RecentWorkouts />

            {/* Templates */}
            <WorkoutTemplates />

            {/* Plateau alert */}
            <PlateauAlertCard />

            {/* AI Coach tip */}
            {aiCoachTip && (
              <div className="rounded-2xl bg-card border border-border p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="text-xs font-semibold text-primary uppercase tracking-widest">AI Coach</p>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{aiCoachTip}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
