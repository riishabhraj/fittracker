"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from "recharts"
import { getWorkouts } from "@/lib/workout-storage"
import { build1RMHistory, type OneRMDataPoint } from "@/lib/one-rm"
import { TrendingUp } from "lucide-react"

const chartConfig = {
  estimated1RM: {
    label: "Est. 1RM (kg)",
    color: "hsl(80 100% 50%)",
  },
}

interface TooltipPayload {
  payload?: {
    date: string
    estimated1RM: number
    weight: number
    reps: number
    label: string
  }
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: TooltipPayload["payload"] }> }) {
  if (!active || !payload?.length || !payload[0].payload) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold text-foreground mb-1">{d.label}</p>
      <p className="text-primary font-bold">~1RM: {d.estimated1RM} kg</p>
      <p className="text-muted-foreground text-xs mt-0.5">
        From: {d.weight} kg × {d.reps} reps
      </p>
    </div>
  )
}

export function OneRMHistoryChart() {
  const [exerciseData, setExerciseData] = useState<Record<string, OneRMDataPoint[]>>({})
  const [exercises, setExercises] = useState<string[]>([])
  const [selected, setSelected] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const workouts = await getWorkouts()
      const byExercise: Record<string, OneRMDataPoint[]> = {}

      // Collect all exercises that have any completed sets with weight
      const exerciseNames = new Set<string>()
      workouts.forEach((w) =>
        w.exercises.forEach((e) => {
          if (e.sets.some((s) => s.completed && s.weight > 0 && s.reps > 0)) {
            exerciseNames.add(e.name)
          }
        })
      )

      exerciseNames.forEach((name) => {
        const history = build1RMHistory(workouts, name)
        if (history.length > 0) byExercise[name] = history
      })

      const names = Object.keys(byExercise)
      setExerciseData(byExercise)
      setExercises(names)
      if (names.length > 0) setSelected(names[0])
      setLoading(false)
    }

    load()

    const handleChange = () => load()
    window.addEventListener("workoutDataChanged", handleChange)
    return () => window.removeEventListener("workoutDataChanged", handleChange)
  }, [])

  if (loading) {
    return (
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Estimated 1RM Progress</h3>
        <div className="h-[260px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground text-sm">Loading…</div>
        </div>
      </Card>
    )
  }

  if (exercises.length === 0) {
    return (
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold text-foreground mb-1">Estimated 1RM Progress</h3>
        <p className="text-sm text-muted-foreground mb-6">Track your strength over time</p>
        <div className="h-[200px] flex flex-col items-center justify-center text-center">
          <TrendingUp className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            Complete sets with weight and reps to see your estimated 1RM trend.
          </p>
        </div>
      </Card>
    )
  }

  const data = exerciseData[selected] ?? []
  const allTime1RM = data.length > 0 ? Math.max(...data.map((d) => d.estimated1RM)) : 0
  const latest1RM = data.length > 0 ? data[data.length - 1].estimated1RM : 0
  const first1RM = data.length > 0 ? data[0].estimated1RM : 0
  const totalGain = latest1RM - first1RM

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Estimated 1RM Progress</h3>
          <p className="text-sm text-muted-foreground">Based on Epley formula</p>
        </div>
        {latest1RM > 0 && (
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{latest1RM} kg</p>
            {totalGain !== 0 && (
              <p className={`text-xs font-medium ${totalGain > 0 ? "text-green-500" : "text-red-500"}`}>
                {totalGain > 0 ? "+" : ""}{totalGain} kg all-time
              </p>
            )}
          </div>
        )}
      </div>

      {/* Exercise selector */}
      <div className="flex gap-2 flex-wrap mb-5">
        {exercises.map((name) => (
          <Button
            key={name}
            size="sm"
            variant={selected === name ? "default" : "outline"}
            onClick={() => setSelected(name)}
            className="text-xs h-7 whitespace-nowrap"
            style={selected === name ? { backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" } : {}}
          >
            {name}
          </Button>
        ))}
      </div>

      <ChartContainer config={chartConfig} className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }}
              axisLine={{ stroke: "hsl(0 0% 18%)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={["dataMin - 5", "dataMax + 5"]}
            />
            <ChartTooltip content={<CustomTooltip />} />
            {allTime1RM > 0 && (
              <ReferenceLine
                y={allTime1RM}
                stroke="hsl(80 100% 50% / 0.3)"
                strokeDasharray="4 4"
              />
            )}
            <Line
              type="monotone"
              dataKey="estimated1RM"
              stroke="hsl(80 100% 50%)"
              strokeWidth={2.5}
              dot={{ fill: "hsl(80 100% 50%)", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      {allTime1RM > 0 && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          All-time best: <span className="font-semibold text-foreground">{allTime1RM} kg</span>
        </p>
      )}
    </Card>
  )
}
