"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Zap } from "lucide-react"
import { getWorkouts } from "@/lib/workout-storage"
import { computeReadinessScore, type ReadinessResult } from "@/lib/readiness-score"
import * as Slider from "@radix-ui/react-slider"

const ENERGY_LABELS: Record<number, string> = {
  1: "Exhausted", 2: "Very tired", 3: "Tired",
  4: "Low", 5: "Okay", 6: "Decent",
  7: "Good", 8: "Great", 9: "Energised", 10: "Peak",
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const pct = (score / 10) * 100
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="hsl(0 0% 18%)" strokeWidth="7" />
        <circle
          cx="40" cy="40" r={r} fill="none"
          stroke={color} strokeWidth="7"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-bold text-foreground leading-none">{score}</span>
        <span className="text-[9px] text-muted-foreground leading-none">/ 10</span>
      </div>
    </div>
  )
}

export function ReadinessScoreCard() {
  const [result, setResult] = useState<ReadinessResult | null>(null)
  const [energy, setEnergy] = useState(7)
  const [loading, setLoading] = useState(true)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load initial energy from profile + compute score
  useEffect(() => {
    const init = async () => {
      try {
        const [workouts, profileRes] = await Promise.all([
          getWorkouts(),
          fetch("/api/profile").then((r) => (r.ok ? r.json() : null)).catch(() => null),
        ])
        const initialEnergy = profileRes?.subjectiveEnergy ?? 7
        setEnergy(initialEnergy)
        setResult(computeReadinessScore({ workouts, subjectiveEnergy: initialEnergy }))
      } catch {
        // Silently fail — card simply won't render
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const handleEnergyChange = async (val: number) => {
    setEnergy(val)
    // Recompute score immediately (optimistic)
    try {
      const workouts = await getWorkouts()
      setResult(computeReadinessScore({ workouts, subjectiveEnergy: val }))
    } catch {
      // keep current result if fetch fails
    }

    // Debounce the profile save
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectiveEnergy: val }),
      }).catch(() => {})
    }, 800)
  }

  if (loading) {
    return (
      <Card className="p-4 bg-card border-border">
        <div className="flex justify-center py-6">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Card>
    )
  }

  if (!result) return null

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${result.color}20` }}
        >
          <Zap className="h-3.5 w-3.5" style={{ color: result.color }} />
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: result.color }}>
          Readiness Score
        </p>
      </div>

      <div className="flex items-center gap-5">
        <ScoreRing score={result.score} color={result.color} />

        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground text-base leading-tight">{result.label}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{result.recommendation}</p>
        </div>
      </div>

      {/* Sub-scores */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {([
          { label: "Recovery", val: result.breakdown.recovery },
          { label: "Freshness", val: result.breakdown.freshness },
          { label: "Energy", val: result.breakdown.energy },
        ] as const).map(({ label, val }) => (
          <div key={label} className="flex flex-col items-center p-2 rounded-xl bg-background">
            <span className="text-sm font-bold text-foreground">{val}</span>
            <span className="text-[10px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Subjective energy slider */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-muted-foreground">How do you feel today?</p>
          <span className="text-xs font-semibold text-foreground">
            {energy} — {ENERGY_LABELS[energy]}
          </span>
        </div>
        <Slider.Root
          min={1} max={10} step={1}
          value={[energy]}
          onValueChange={([v]) => handleEnergyChange(v)}
          className="relative flex items-center select-none touch-none w-full h-5"
        >
          <Slider.Track className="relative grow rounded-full h-1.5 bg-border">
            <Slider.Range
              className="absolute h-full rounded-full"
              style={{ backgroundColor: result.color }}
            />
          </Slider.Track>
          <Slider.Thumb
            className="block w-4 h-4 rounded-full shadow-md border-2 focus:outline-none"
            style={{ backgroundColor: result.color, borderColor: result.color }}
          />
        </Slider.Root>
      </div>
    </Card>
  )
}
