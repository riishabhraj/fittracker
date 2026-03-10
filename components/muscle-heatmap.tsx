"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { getWorkouts } from "@/lib/workout-storage"
import { computeMuscleVolumes, normalizeVolumes, type MuscleGroup } from "@/lib/muscle-mapping"

// Lime green heatmap color at a given 0–1 intensity
function muscleColor(intensity: number | undefined): string {
  if (!intensity || intensity === 0) return "hsl(0 0% 22%)"
  const alpha = 0.2 + intensity * 0.75
  return `rgba(170, 255, 0, ${alpha.toFixed(2)})`
}

interface MuscleSVGProps {
  volumes: Partial<Record<MuscleGroup, number>>
}

function FrontBody({ volumes }: MuscleSVGProps) {
  const v = (m: MuscleGroup) => muscleColor(volumes[m])
  return (
    <svg viewBox="0 0 100 220" className="w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body outline */}
      <ellipse cx="50" cy="18" rx="11" ry="12" fill="hsl(0 0% 18%)" stroke="hsl(0 0% 28%)" strokeWidth="1" />
      {/* Neck */}
      <rect x="45" y="28" width="10" height="10" rx="3" fill="hsl(0 0% 18%)" />
      {/* Torso */}
      <path d="M28 40 Q20 45 20 60 L20 110 Q20 115 25 115 L75 115 Q80 115 80 110 L80 60 Q80 45 72 40 Z" fill="hsl(0 0% 18%)" stroke="hsl(0 0% 28%)" strokeWidth="0.5" />

      {/* Chest */}
      <ellipse cx="40" cy="60" rx="11" ry="9" fill={v("chest")} />
      <ellipse cx="60" cy="60" rx="11" ry="9" fill={v("chest")} />

      {/* Front delts (shoulder caps) */}
      <ellipse cx="22" cy="48" rx="7" ry="6" fill={v("front_delts")} />
      <ellipse cx="78" cy="48" rx="7" ry="6" fill={v("front_delts")} />

      {/* Side delts */}
      <ellipse cx="18" cy="56" rx="5" ry="5" fill={v("side_delts")} />
      <ellipse cx="82" cy="56" rx="5" ry="5" fill={v("side_delts")} />

      {/* Abs */}
      <rect x="42" y="72" width="7" height="7" rx="2" fill={v("abs")} />
      <rect x="51" y="72" width="7" height="7" rx="2" fill={v("abs")} />
      <rect x="42" y="81" width="7" height="7" rx="2" fill={v("abs")} />
      <rect x="51" y="81" width="7" height="7" rx="2" fill={v("abs")} />
      <rect x="42" y="90" width="7" height="7" rx="2" fill={v("abs")} />
      <rect x="51" y="90" width="7" height="7" rx="2" fill={v("abs")} />

      {/* Obliques */}
      <ellipse cx="34" cy="88" rx="6" ry="9" fill={v("obliques")} />
      <ellipse cx="66" cy="88" rx="6" ry="9" fill={v("obliques")} />

      {/* Upper arms (biceps) */}
      <ellipse cx="14" cy="68" rx="5" ry="11" fill={v("biceps")} />
      <ellipse cx="86" cy="68" rx="5" ry="11" fill={v("biceps")} />

      {/* Forearms */}
      <ellipse cx="10" cy="90" rx="4" ry="10" fill={v("forearms")} />
      <ellipse cx="90" cy="90" rx="4" ry="10" fill={v("forearms")} />

      {/* Hips area */}
      <path d="M25 115 L75 115 L78 140 L22 140 Z" fill="hsl(0 0% 18%)" />

      {/* Quads */}
      <ellipse cx="37" cy="160" rx="11" ry="22" fill={v("quads")} />
      <ellipse cx="63" cy="160" rx="11" ry="22" fill={v("quads")} />

      {/* Lower leg / calves front */}
      <ellipse cx="37" cy="196" rx="7" ry="16" fill="hsl(0 0% 18%)" stroke="hsl(0 0% 28%)" strokeWidth="0.5" />
      <ellipse cx="63" cy="196" rx="7" ry="16" fill="hsl(0 0% 18%)" stroke="hsl(0 0% 28%)" strokeWidth="0.5" />
    </svg>
  )
}

function BackBody({ volumes }: MuscleSVGProps) {
  const v = (m: MuscleGroup) => muscleColor(volumes[m])
  return (
    <svg viewBox="0 0 100 220" className="w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <ellipse cx="50" cy="18" rx="11" ry="12" fill="hsl(0 0% 18%)" stroke="hsl(0 0% 28%)" strokeWidth="1" />
      {/* Neck */}
      <rect x="45" y="28" width="10" height="10" rx="3" fill="hsl(0 0% 18%)" />
      {/* Torso */}
      <path d="M28 40 Q20 45 20 60 L20 110 Q20 115 25 115 L75 115 Q80 115 80 110 L80 60 Q80 45 72 40 Z" fill="hsl(0 0% 18%)" stroke="hsl(0 0% 28%)" strokeWidth="0.5" />

      {/* Traps */}
      <path d="M38 38 Q50 32 62 38 Q62 52 50 55 Q38 52 38 38 Z" fill={v("traps")} />

      {/* Rear delts */}
      <ellipse cx="22" cy="48" rx="7" ry="6" fill={v("rear_delts")} />
      <ellipse cx="78" cy="48" rx="7" ry="6" fill={v("rear_delts")} />

      {/* Lats */}
      <path d="M24 55 Q20 65 22 90 L38 90 Q36 70 38 55 Z" fill={v("lats")} />
      <path d="M76 55 Q80 65 78 90 L62 90 Q64 70 62 55 Z" fill={v("lats")} />

      {/* Lower back */}
      <ellipse cx="50" cy="100" rx="13" ry="9" fill={v("lower_back")} />

      {/* Triceps (back of upper arm) */}
      <ellipse cx="14" cy="68" rx="5" ry="11" fill={v("triceps")} />
      <ellipse cx="86" cy="68" rx="5" ry="11" fill={v("triceps")} />

      {/* Forearms */}
      <ellipse cx="10" cy="90" rx="4" ry="10" fill={v("forearms")} />
      <ellipse cx="90" cy="90" rx="4" ry="10" fill={v("forearms")} />

      {/* Glutes */}
      <ellipse cx="38" cy="126" rx="14" ry="12" fill={v("glutes")} />
      <ellipse cx="62" cy="126" rx="14" ry="12" fill={v("glutes")} />

      {/* Hamstrings */}
      <ellipse cx="37" cy="158" rx="11" ry="20" fill={v("hamstrings")} />
      <ellipse cx="63" cy="158" rx="11" ry="20" fill={v("hamstrings")} />

      {/* Calves */}
      <ellipse cx="37" cy="196" rx="7" ry="16" fill={v("calves")} />
      <ellipse cx="63" cy="196" rx="7" ry="16" fill={v("calves")} />
    </svg>
  )
}

const TIME_OPTIONS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
]

export function MuscleHeatmap() {
  const [selectedDays, setSelectedDays] = useState(7)
  const [volumes, setVolumes] = useState<Partial<Record<MuscleGroup, number>>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getWorkouts()
      .then((workouts) => {
        const raw = computeMuscleVolumes(workouts, selectedDays)
        setVolumes(normalizeVolumes(raw))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedDays])

  const hasData = Object.keys(volumes).length > 0

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Muscle Heatmap</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Volume by muscle group</p>
        </div>
        {/* Time range selector */}
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
        <div className="flex justify-center py-8">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !hasData ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No workout data in the last {selectedDays} days.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground text-center mb-2 uppercase tracking-widest">Front</p>
            <FrontBody volumes={volumes} />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground text-center mb-2 uppercase tracking-widest">Back</p>
            <BackBody volumes={volumes} />
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-3">
        <span className="text-[10px] text-muted-foreground">Low</span>
        <div
          className="h-2 w-24 rounded-full"
          style={{ background: "linear-gradient(to right, hsl(0 0% 22%), rgba(170,255,0,0.95))" }}
        />
        <span className="text-[10px] text-muted-foreground">High</span>
      </div>
    </Card>
  )
}
