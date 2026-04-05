"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { getWorkouts } from "@/lib/workout-storage"
import { computeMuscleVolumes, normalizeVolumes, type MuscleGroup } from "@/lib/muscle-mapping"
import { FrontBody, BackBody, MUSCLE_LABELS, type Volumes } from "@/components/muscle-heatmap-body"

const TIME_OPTIONS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
]

// ─── Main export ─────────────────────────────────────────────────────────────

export function MuscleHeatmap({ gender = "male" }: { gender?: string }) {
  const [selectedDays, setSelectedDays] = useState(30)
  const [volumes, setVolumes] = useState<Volumes>({})
  const [loading, setLoading] = useState(true)

  void gender

  useEffect(() => {
    setLoading(true)
    getWorkouts()
      .then((w) => setVolumes(normalizeVolumes(computeMuscleVolumes(w, selectedDays))))
      .catch((e) => console.error("MuscleHeatmap:", e))
      .finally(() => setLoading(false))
  }, [selectedDays])

  const workedMuscles = (Object.entries(volumes) as [MuscleGroup, number][])
    .filter(([, i]) => i > 0)
    .sort(([, a], [, b]) => b - a)

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Muscle Heatmap</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Volume by muscle group</p>
        </div>
        <div className="flex rounded-lg overflow-hidden border border-border">
          {TIME_OPTIONS.map(({ label, days }) => (
            <button
              key={days}
              onClick={() => setSelectedDays(days)}
              className="px-2.5 py-1 text-xs font-medium transition-colors"
              style={
                selectedDays === days
                  ? { backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }
                  : { color: "hsl(0 0% 55%)" }
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground text-center mb-1 uppercase tracking-widest">Front</p>
              <div className="flex justify-center" style={{ height: 340 }}>
                <FrontBody v={volumes} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground text-center mb-1 uppercase tracking-widest">Back</p>
              <div className="flex justify-center" style={{ height: 340 }}>
                <BackBody v={volumes} />
              </div>
            </div>
          </div>

          {workedMuscles.length > 0 ? (
            <div className="mt-4 pt-3 border-t border-border/50">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Muscles Worked</p>
              <div className="flex flex-wrap gap-1.5">
                {workedMuscles.map(([m, intensity]) => (
                  <span
                    key={m}
                    className="text-[10px] font-semibold px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: `rgba(170,255,0,${(0.1 + intensity * 0.15).toFixed(2)})`,
                      color: `rgba(170,255,0,${(0.6 + intensity * 0.4).toFixed(2)})`,
                    }}
                  >
                    {MUSCLE_LABELS[m]}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center pt-4">
              No workout data in the last {selectedDays} days.
            </p>
          )}

          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-[10px] text-muted-foreground">Low</span>
            <div
              className="h-1.5 w-20 rounded-full"
              style={{ background: "linear-gradient(to right, hsl(0 0% 22%), rgba(170,255,0,0.95))" }}
            />
            <span className="text-[10px] text-muted-foreground">High</span>
          </div>
        </>
      )}
    </Card>
  )
}
