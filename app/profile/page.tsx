"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Target, Settings, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { ProfileHeader } from "@/components/profile-header"
import { ProfileStatsGrid } from "@/components/profile-stats-grid"
import { BodyMetricsCard } from "@/components/body-metrics-card"
import { FitnessProfileCard } from "@/components/fitness-profile-card"
import { getWorkouts, getWorkoutStats, computePersonalRecords } from "@/lib/workout-storage"
import type { Workout } from "@/lib/workout-storage"
import type { FitnessProfile } from "@/lib/fitness-utils"
import { computeAchievements } from "@/lib/achievements"

interface UserInfo {
  name: string
  email: string
  image?: string | null
  createdAt?: string | null
  isOAuthUser?: boolean
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [profile, setProfile] = useState<FitnessProfile | null>(null)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [stats, setStats] = useState({ totalWorkouts: 0, currentStreak: 0, totalWeight: 0, weeklyWorkouts: 0 })
  const [prCount, setPrCount] = useState(0)
  const [badgeCount, setBadgeCount] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        const [userRes, profileRes, workoutsData, statsData] = await Promise.all([
          fetch("/api/user").then((r) => (r.ok ? r.json() : null)).catch(() => null),
          fetch("/api/profile").then((r) => (r.ok ? r.json() : null)).catch(() => null),
          getWorkouts().catch(() => [] as Workout[]),
          getWorkoutStats().catch(() => ({ totalWorkouts: 0, currentStreak: 0, totalWeight: 0, weeklyWorkouts: 0 })),
        ])
        setUser(userRes)
        setProfile(profileRes)
        setWorkouts(workoutsData)
        setStats(statsData)
        const prs = computePersonalRecords(workoutsData)
        setPrCount(Object.keys(prs).length)
        const achievementResults = computeAchievements({ workouts: workoutsData, stats: statsData, prs, profile: profileRes })
        setBadgeCount(achievementResults.filter(a => a.unlocked).length)
      } catch {
        // non-blocking
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleProfileUpdate = (data: Partial<FitnessProfile>) => {
    setProfile((prev) => prev ? { ...prev, ...data } : (data as FitnessProfile))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Image src="/fittracker-app-icon.png" alt="FitTracker" width={48} height={48} className="mx-auto mb-3 rounded-2xl animate-pulse" />
          <p className="text-muted-foreground text-sm">Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header
        className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="px-5 pt-4 pb-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">Profile</h1>
          <Link href="/settings" className="text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <main className="px-5 py-5 pb-24 space-y-4">
        {user && (
          <ProfileHeader
            name={user.name}
            email={user.email}
            image={user.image}
            createdAt={user.createdAt}
          />
        )}

        <ProfileStatsGrid
          totalWorkouts={stats.totalWorkouts}
          currentStreak={stats.currentStreak}
          totalWeight={stats.totalWeight}
          prCount={prCount}
        />

        {/* Goals shortcut */}
        <Link href="/goals" className="block">
          <Card className="p-4 bg-card border-border hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(170,255,0,0.12)" }}>
                <Target className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">My Goals</p>
                <p className="text-xs text-muted-foreground mt-0.5">Track your fitness targets</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          </Card>
        </Link>

        <Link href="/achievements">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="text-xl">🏅</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Achievements</p>
                <p className="text-xs text-muted-foreground">{badgeCount} badge{badgeCount !== 1 ? "s" : ""} earned</p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        </Link>

        <div className="mt-2" />
        <BodyMetricsCard
          height={profile?.height}
          weight={profile?.weight}
          age={profile?.age}
          onUpdate={handleProfileUpdate}
        />

        <FitnessProfileCard
          goal={profile?.goal}
          experienceLevel={profile?.experienceLevel}
          workoutDaysPerWeek={profile?.workoutDaysPerWeek}
          equipment={profile?.equipment}
          gender={profile?.gender}
          onUpdate={handleProfileUpdate}
        />

      </main>
    </div>
  )
}
