"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { AlertTriangle, ChevronRight } from "lucide-react"
import { getWorkouts } from "@/lib/workout-storage"
import { detectPlateaus, type PlateauResult } from "@/lib/plateau-detection"
import Link from "next/link"

/**
 * Dashboard card that surfaces exercises hitting a plateau.
 * Self-contained: fetches workouts and runs plateau detection.
 * Only renders if at least one plateau is detected.
 */
export function PlateauAlertCard() {
  const [plateaus, setPlateaus] = useState<PlateauResult[]>([])

  useEffect(() => {
    getWorkouts()
      .then((workouts) => setPlateaus(detectPlateaus(workouts)))
      .catch((err) => console.error("PlateauAlertCard: failed to fetch workouts", err))
  }, [])

  if (plateaus.length === 0) return null

  return (
    <Card className="p-4 border-orange-500/30 bg-card">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: "rgba(249,115,22,0.15)" }}
        >
          <AlertTriangle className="h-3.5 w-3.5" style={{ color: "#f97316" }} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#f97316" }}>
            Plateau Alert
          </p>
          <p className="text-xs text-muted-foreground">
            {plateaus.length} exercise{plateaus.length !== 1 ? "s" : ""} need a change-up
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {plateaus.slice(0, 3).map((p) => (
          <div key={p.exerciseName} className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{p.exerciseName}</p>
              <p className="text-xs text-muted-foreground">
                {p.lastBestWeight} kg × {p.lastBestReps} · ~{p.weeksStalled}w no gain
              </p>
            </div>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2"
              style={{ backgroundColor: "rgba(249,115,22,0.12)", color: "#f97316" }}
            >
              {p.consecutiveStalls}× stalled
            </span>
          </div>
        ))}
      </div>

      <Link href="/progress?tab=strength">
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border text-xs text-muted-foreground hover:text-foreground transition-colors">
          <span>View strength details</span>
          <ChevronRight className="h-3 w-3" />
        </div>
      </Link>
    </Card>
  )
}
