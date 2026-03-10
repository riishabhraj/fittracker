"use client"

import { Card } from "@/components/ui/card"
import { Dumbbell, Flame, TrendingUp, Trophy } from "lucide-react"

interface ProfileStatsGridProps {
  totalWorkouts: number
  currentStreak: number
  totalWeight: number
  prCount: number
}

function StatTile({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ElementType
  value: string
  label: string
  color: string
}) {
  return (
    <Card className="p-4 bg-card border-border flex flex-col items-center justify-center gap-1.5 text-center">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center mb-0.5"
        style={{ backgroundColor: `${color}18` }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <p className="text-xl font-bold text-foreground leading-none">{value}</p>
      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
    </Card>
  )
}

function fmtVolume(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}k`
  return String(Math.round(kg))
}

export function ProfileStatsGrid({ totalWorkouts, currentStreak, totalWeight, prCount }: ProfileStatsGridProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      <StatTile icon={Dumbbell} value={String(totalWorkouts)} label="Workouts" color="#aaff00" />
      <StatTile icon={Flame}    value={String(currentStreak)} label="Streak"   color="#f97316" />
      <StatTile icon={TrendingUp} value={fmtVolume(totalWeight)} label="Volume kg" color="#60a5fa" />
      <StatTile icon={Trophy}   value={String(prCount)}       label="PRs"      color="#eab308" />
    </div>
  )
}
