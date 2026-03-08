"use client"

import { useEffect, useState } from "react"
import { getWorkouts } from "@/lib/workout-storage"

export function WeeklyCalendar() {
  const [workedDays, setWorkedDays] = useState<Set<string>>(new Set())

  useEffect(() => {
    const load = async () => {
      try {
        const workouts = await getWorkouts()
        const days = new Set(workouts.map((w) => new Date(w.date).toDateString()))
        setWorkedDays(days)
      } catch { /* keep previous state */ }
    }
    load()
    window.addEventListener("workoutDataChanged", load)
    return () => window.removeEventListener("workoutDataChanged", load)
  }, [])

  const today = new Date()
  const currentDay = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1))

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return {
      date: d,
      label: d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1),
      num: d.getDate(),
      isToday: d.toDateString() === today.toDateString(),
      hasWorkout: workedDays.has(d.toDateString()),
      isPast: d < today && d.toDateString() !== today.toDateString(),
    }
  })

  const completedDays = week.filter((d) => d.hasWorkout).length

  return (
    <div className="rounded-2xl bg-card border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="font-semibold text-foreground">This Week</p>
        <p className="text-xs text-muted-foreground">
          <span className="text-primary font-bold">{completedDays}</span>
          {" / 7 days trained"}
        </p>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {week.map(({ date, label, num, isToday, hasWorkout, isPast }) => (
          <div key={date.toISOString()} className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground font-medium">{label}</span>

            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all"
              style={
                hasWorkout
                  ? { backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }
                  : isToday
                  ? { backgroundColor: "hsl(0 0% 20%)", color: "hsl(0 0% 100%)", outline: "2px solid hsl(80 100% 50%)", outlineOffset: "1px" }
                  : { backgroundColor: "transparent", color: isPast ? "hsl(0 0% 35%)" : "hsl(0 0% 70%)" }
              }
            >
              {num}
            </div>

            <div
              className="h-1 w-1 rounded-full"
              style={{ backgroundColor: hasWorkout ? "hsl(80 100% 50%)" : "transparent" }}
            />
          </div>
        ))}
      </div>

      {completedDays === 0 && (
        <p className="text-center text-xs text-muted-foreground mt-3">No workouts this week yet — let&apos;s change that 💪</p>
      )}
    </div>
  )
}
