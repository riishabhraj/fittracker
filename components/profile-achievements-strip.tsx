"use client"

import { Card } from "@/components/ui/card"
import { Trophy, Target, Flame, Calendar, Dumbbell, TrendingUp, Star, ChevronRight } from "lucide-react"
import Link from "next/link"
import type { Workout } from "@/lib/workout-storage"

interface Props {
  workouts: Workout[]
  weeklyWorkouts: number
  currentStreak: number
  totalWeight: number
}

const ICONS = [Dumbbell, Calendar, Flame, Trophy, TrendingUp, Target, Star]

export function ProfileAchievementsStrip({ workouts, weeklyWorkouts, currentStreak, totalWeight }: Props) {
  const earned = [
    workouts.length > 0,
    weeklyWorkouts >= 5,
    currentStreak >= 30,
    workouts.some((w) => w.exercises.some((e) => e.name.toLowerCase().includes("bench") && e.sets.some((s) => s.completed && s.weight >= 150))),
    totalWeight >= 50000,
    (() => { const now = new Date(); return workouts.filter((w) => new Date(w.date) >= new Date(now.getFullYear(), now.getMonth(), 1)).length >= 16 })(),
    workouts.length >= 100,
  ]

  const earnedCount = earned.filter(Boolean).length
  const total = earned.length

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground">Achievements</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {earnedCount} of {total} unlocked
          </p>
        </div>
        <Link href="/progress" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          View all <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-border rounded-full mb-3">
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${Math.round((earnedCount / total) * 100)}%`, backgroundColor: "hsl(80 100% 50%)" }}
        />
      </div>

      {/* Icon strip */}
      <div className="flex gap-2">
        {ICONS.map((Icon, i) => (
          <div
            key={i}
            className="flex-1 flex items-center justify-center h-9 rounded-xl"
            style={
              earned[i]
                ? { backgroundColor: "hsl(80 100% 50% / 0.15)" }
                : { backgroundColor: "hsl(0 0% 12%)" }
            }
          >
            <Icon
              className="h-4 w-4"
              style={{ color: earned[i] ? "hsl(80 100% 50%)" : "hsl(0 0% 30%)" }}
            />
          </div>
        ))}
      </div>
    </Card>
  )
}
