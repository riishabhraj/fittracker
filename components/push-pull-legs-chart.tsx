"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { getWorkouts } from "@/lib/workout-storage"
import { computePPLVolumes, type PPLVolumes } from "@/lib/fitness-utils"
import { AlertTriangle } from "lucide-react"

const COLORS: Record<string, string> = {
  Push: "hsl(80 100% 50%)",    // lime
  Pull: "hsl(200 90% 55%)",   // cyan-blue
  Legs: "hsl(280 70% 60%)",   // purple
  Other: "hsl(0 0% 35%)",     // grey
}

const TIME_OPTIONS = [
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
]

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(Math.round(n))
}

function detectImbalance(data: { name: string; value: number }[]): string | null {
  const mainLifts = data.filter((d) => d.name !== "Other")
  const total = mainLifts.reduce((s, d) => s + d.value, 0)
  if (total === 0) return null

  for (const d of mainLifts) {
    const pct = d.value / total
    if (pct > 0.55) {
      return `Heavy ${d.name} bias — consider adding more ${mainLifts.filter((x) => x.name !== d.name).map((x) => x.name).join(" & ")} work.`
    }
    if (pct < 0.1) {
      return `Low ${d.name} volume — try adding at least one ${d.name} session per week.`
    }
  }
  return null
}

export function PushPullLegsChart() {
  const [days, setDays] = useState(30)
  const [volumes, setVolumes] = useState<PPLVolumes | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getWorkouts().then((workouts) => {
      setVolumes(computePPLVolumes(workouts, days))
      setLoading(false)
    })
  }, [days])

  if (loading) {
    return (
      <Card className="p-4 bg-card border-border">
        <div className="flex justify-center py-8">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Card>
    )
  }

  const total = volumes ? Object.values(volumes).reduce((s, v) => s + v, 0) : 0

  const chartData = volumes
    ? (["Push", "Pull", "Legs", "Other"] as const)
        .map((k) => ({ name: k, value: volumes[k] }))
        .filter((d) => d.value > 0)
    : []

  const imbalance = detectImbalance(chartData)

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Volume Split</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Push / Pull / Legs balance</p>
        </div>
        <div className="flex rounded-lg overflow-hidden border border-border">
          {TIME_OPTIONS.map(({ label, days: d }) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className="px-2.5 py-1 text-xs font-medium transition-colors"
              style={
                days === d
                  ? { backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }
                  : { color: "hsl(0 0% 55%)" }
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {total === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No completed sets in the last {days} days.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-4">
            {/* Donut chart */}
            <div className="w-36 h-36 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={62}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${fmt(value)} kg`,
                      name,
                    ]}
                    contentStyle={{
                      backgroundColor: "hsl(0 0% 11%)",
                      border: "1px solid hsl(0 0% 18%)",
                      borderRadius: "8px",
                      color: "hsl(0 0% 95%)",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-2">
              {chartData.map((d) => {
                const pct = total > 0 ? Math.round((d.value / total) * 100) : 0
                return (
                  <div key={d.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: COLORS[d.name] }}
                      />
                      <span className="text-sm text-foreground font-medium">{d.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-semibold text-foreground">{pct}%</span>
                      <span className="text-xs text-muted-foreground ml-1">{fmt(d.value)}kg</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Imbalance alert */}
          {imbalance && (
            <div
              className="flex items-start gap-2 mt-3 p-3 rounded-xl text-xs"
              style={{ backgroundColor: "rgba(249,115,22,0.08)", color: "#f97316" }}
            >
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>{imbalance}</span>
            </div>
          )}
        </>
      )}
    </Card>
  )
}
