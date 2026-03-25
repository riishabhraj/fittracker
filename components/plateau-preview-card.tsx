"use client"

import { useEffect, useState } from "react"
import { useSubscription } from "@/hooks/use-subscription"
import { Card } from "@/components/ui/card"
import { AlertTriangle, Lock, TrendingUp } from "lucide-react"
import { getWorkouts } from "@/lib/workout-storage"
import { detectPlateaus, type PlateauResult } from "@/lib/plateau-detection"
import { UpgradeModal } from "@/components/upgrade-modal"

export function PlateauPreviewCard() {
  const { isPro } = useSubscription()
  const [plateaus, setPlateaus] = useState<PlateauResult[]>([])
  const [showUpgrade, setShowUpgrade] = useState(false)

  useEffect(() => {
    getWorkouts()
      .then((w) => setPlateaus(detectPlateaus(w)))
      .catch(() => {})
  }, [])

  if (plateaus.length === 0) return null

  const first = plateaus[0]

  // ── Pro: full card ────────────────────────────────────────────────────────
  if (isPro) {
    return (
      <Card className="p-5 bg-card border-orange-500/25">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(249,115,22,0.15)" }}>
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

        <div className="space-y-3">
          {plateaus.slice(0, 4).map((p) => (
            <div key={p.exerciseName} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{p.exerciseName}</p>
                <p className="text-xs text-muted-foreground">
                  {p.lastBestWeight} kg × {p.lastBestReps} · stalled ~{p.weeksStalled}w
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Try: deload 10%, change grip/angle, or swap variation.
                </p>
              </div>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 mt-0.5"
                style={{ backgroundColor: "rgba(249,115,22,0.12)", color: "#f97316" }}
              >
                {p.consecutiveStalls}× stalled
              </span>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  // ── Free: teaser with blur ────────────────────────────────────────────────
  return (
    <>
      <div className="relative cursor-pointer rounded-xl overflow-hidden" onClick={() => setShowUpgrade(true)}>
        <Card className="p-5 bg-card border-orange-500/25">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(249,115,22,0.15)" }}>
              <AlertTriangle className="h-3.5 w-3.5" style={{ color: "#f97316" }} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#f97316" }}>
                Plateau Alert
              </p>
              <p className="text-xs text-muted-foreground">
                {plateaus.length} exercise{plateaus.length !== 1 ? "s" : ""} may be stalling
              </p>
            </div>
          </div>

          {/* First exercise: visible name, blurred details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">{first.exerciseName}</p>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "rgba(249,115,22,0.12)", color: "#f97316" }}
              >
                Potential plateau
              </span>
            </div>

            {/* Blurred details */}
            <div className="space-y-1.5" style={{ filter: "blur(4px)", userSelect: "none", pointerEvents: "none" }}>
              <p className="text-xs text-muted-foreground">
                {first.lastBestWeight} kg × {first.lastBestReps} · stalled ~{first.weeksStalled}w
              </p>
              <p className="text-xs text-muted-foreground">
                Try: deload 10%, change grip/angle, or swap variation.
              </p>
              {plateaus.length > 1 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
                  <TrendingUp className="h-3 w-3" />
                  {plateaus.length - 1} more exercise{plateaus.length - 1 !== 1 ? "s" : ""} flagged
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Lock pill */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: "hsl(80 100% 50% / 0.15)", color: "hsl(80 100% 50%)" }}
          >
            <Lock className="h-3 w-3" />
            Unlock full plateau analysis
          </div>
        </div>
      </div>

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        reason="One of your exercises hasn't grown in weeks. See which one and exactly how to break through."
      />
    </>
  )
}
