"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { getWorkouts } from "@/lib/workout-storage"
import { computeMuscleVolumes, normalizeVolumes, type MuscleGroup } from "@/lib/muscle-mapping"

type Volumes = Partial<Record<MuscleGroup, number>>

// ─── Color helpers ────────────────────────────────────────────────────────────

function muscleFill(intensity: number | undefined): string {
  if (!intensity || intensity === 0) return "hsl(0 0% 17%)"
  const a = 0.2 + intensity * 0.78
  return `rgba(170,255,0,${a.toFixed(2)})`
}

function muscleStroke(intensity: number | undefined): string {
  if (!intensity || intensity === 0) return "hsl(0 0% 26%)"
  const a = 0.35 + intensity * 0.65
  return `rgba(170,255,0,${a.toFixed(2)})`
}

function glowFilter(intensity: number | undefined, id: string): string | undefined {
  return intensity && intensity > 0.2 ? `url(#${id})` : undefined
}

// ─── Body constants ───────────────────────────────────────────────────────────

const BASE_FILL   = "hsl(0 0% 20%)"
const BASE_STROKE = "hsl(0 0% 30%)"
const SW = "0.7"  // base stroke-width

// ─── Glow filter defs ─────────────────────────────────────────────────────────

function GlowDefs({ id }: { id: string }) {
  return (
    <defs>
      <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  )
}

// ─── Muscle layer wrapper ─────────────────────────────────────────────────────

function M({
  v, m, glowId, children,
}: {
  v: Volumes
  m: MuscleGroup
  glowId: string
  children: React.ReactNode
}) {
  const intensity = v[m]
  return (
    <g
      fill={muscleFill(intensity)}
      stroke={muscleStroke(intensity)}
      strokeWidth="0.6"
      filter={glowFilter(intensity, glowId)}
    >
      {children}
    </g>
  )
}

// ─── Shared silhouette paths ───────────────────────────────────────────────────

function BodySilhouette() {
  return (
    <>
      {/* Head */}
      <circle cx="60" cy="15" r="11.5" fill={BASE_FILL} stroke={BASE_STROKE} strokeWidth={SW} />
      {/* Neck */}
      <path d="M54,26 L66,26 L65,37 L55,37 Z" fill={BASE_FILL} />
      {/* Torso + hips */}
      <path
        d="M55,37 L65,37
           Q82,37 94,44 Q106,50 108,62
           L108,122 Q108,130 98,132
           L82,134 L82,150 L86,200 L90,252
           L74,252 L70,200 L66,172 L54,172
           L50,200 L46,252 L30,252 L34,200
           L38,150 L38,134 L22,132
           Q12,130 12,122 L12,62
           Q14,50 26,44 Q38,37 55,37 Z"
        fill={BASE_FILL} stroke={BASE_STROKE} strokeWidth={SW}
      />
      {/* Left upper arm */}
      <path
        d="M24,48 Q12,54 10,72 L8,106 Q8,114 16,116
           L24,116 Q30,114 30,106 L30,64 Q28,52 24,48 Z"
        fill={BASE_FILL} stroke={BASE_STROKE} strokeWidth={SW}
      />
      {/* Right upper arm */}
      <path
        d="M96,48 Q108,54 110,72 L112,106 Q112,114 104,116
           L96,116 Q90,114 90,106 L90,64 Q92,52 96,48 Z"
        fill={BASE_FILL} stroke={BASE_STROKE} strokeWidth={SW}
      />
      {/* Left forearm */}
      <path
        d="M10,116 Q6,126 6,142 L8,160 Q10,168 16,168
           L22,168 Q28,166 28,160 L30,116 Z"
        fill={BASE_FILL} stroke={BASE_STROKE} strokeWidth={SW}
      />
      {/* Right forearm */}
      <path
        d="M110,116 Q114,126 114,142 L112,160 Q110,168 104,168
           L98,168 Q92,166 92,160 L90,116 Z"
        fill={BASE_FILL} stroke={BASE_STROKE} strokeWidth={SW}
      />
    </>
  )
}

// ─── Front body ───────────────────────────────────────────────────────────────

function FrontBody({ v }: { v: Volumes }) {
  const gid = "glow-f"
  return (
    <svg viewBox="0 0 120 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
      <GlowDefs id={gid} />
      <BodySilhouette />

      {/* Front Delts */}
      <M v={v} m="front_delts" glowId={gid}>
        <path d="M18,44 Q10,50 10,62 Q12,70 20,72 Q28,70 30,62 Q30,50 22,44 Z" />
        <path d="M102,44 Q110,50 110,62 Q108,70 100,72 Q92,70 90,62 Q90,50 98,44 Z" />
      </M>

      {/* Side Delts */}
      <M v={v} m="side_delts" glowId={gid}>
        <ellipse cx="10" cy="67" rx="5" ry="7" />
        <ellipse cx="110" cy="67" rx="5" ry="7" />
      </M>

      {/* Chest */}
      <M v={v} m="chest" glowId={gid}>
        <path d="M34,46 Q26,52 24,62 Q24,72 34,76 Q44,78 52,72 L52,50 Q44,44 34,46 Z" />
        <path d="M86,46 Q94,52 96,62 Q96,72 86,76 Q76,78 68,72 L68,50 Q76,44 86,46 Z" />
      </M>

      {/* Biceps */}
      <M v={v} m="biceps" glowId={gid}>
        <path d="M10,76 Q8,88 10,102 Q12,110 18,112 Q24,110 26,102 Q26,88 22,76 Q18,70 14,72 Z" />
        <path d="M110,76 Q112,88 110,102 Q108,110 102,112 Q96,110 94,102 Q94,88 98,76 Q102,70 106,72 Z" />
      </M>

      {/* Forearms */}
      <M v={v} m="forearms" glowId={gid}>
        <path d="M8,118 Q6,134 8,152 Q10,164 16,164 Q22,162 24,152 Q24,134 20,118 Z" />
        <path d="M112,118 Q114,134 112,152 Q110,164 104,164 Q98,162 96,152 Q96,134 100,118 Z" />
      </M>

      {/* Abs */}
      <M v={v} m="abs" glowId={gid}>
        {[0, 1, 2].map((row) => (
          <>
            <rect key={`al${row}`} x="43" y={82 + row * 14} width="10" height="11" rx="3" />
            <rect key={`ar${row}`} x="67" y={82 + row * 14} width="10" height="11" rx="3" />
          </>
        ))}
      </M>

      {/* Obliques */}
      <M v={v} m="obliques" glowId={gid}>
        <path d="M30,86 Q24,98 26,112 Q28,120 34,122 L38,114 Q36,100 34,86 Z" />
        <path d="M90,86 Q96,98 94,112 Q92,120 86,122 L82,114 Q84,100 86,86 Z" />
      </M>

      {/* Quads */}
      <M v={v} m="quads" glowId={gid}>
        <path d="M30,138 Q24,154 26,174 Q28,186 38,188 Q48,186 50,174 Q52,154 46,138 Q40,132 36,134 Z" />
        <path d="M90,138 Q96,154 94,174 Q92,186 82,188 Q72,186 70,174 Q68,154 74,138 Q80,132 84,134 Z" />
      </M>

      {/* Calves (tibialis — front) */}
      <M v={v} m="calves" glowId={gid}>
        <path d="M32,196 Q28,210 30,230 Q32,242 38,242 Q44,240 46,230 Q48,210 44,194 Z" />
        <path d="M88,196 Q92,210 90,230 Q88,242 82,242 Q76,240 74,230 Q72,210 76,194 Z" />
      </M>
    </svg>
  )
}

// ─── Back body ────────────────────────────────────────────────────────────────

function BackBody({ v }: { v: Volumes }) {
  const gid = "glow-b"
  return (
    <svg viewBox="0 0 120 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
      <GlowDefs id={gid} />
      <BodySilhouette />

      {/* Traps */}
      <M v={v} m="traps" glowId={gid}>
        <path d="M38,40 Q50,34 82,40 Q90,48 84,60 Q72,66 60,68 Q48,66 36,60 Q30,48 38,40 Z" />
      </M>

      {/* Rear Delts */}
      <M v={v} m="rear_delts" glowId={gid}>
        <path d="M18,44 Q10,50 10,62 Q12,70 20,72 Q28,70 30,62 Q30,50 22,44 Z" />
        <path d="M102,44 Q110,50 110,62 Q108,70 100,72 Q92,70 90,62 Q90,50 98,44 Z" />
      </M>

      {/* Lats */}
      <M v={v} m="lats" glowId={gid}>
        <path d="M24,62 Q18,76 18,96 L22,122 Q28,130 36,132 L40,124 Q36,108 34,88 Q32,74 28,62 Z" />
        <path d="M96,62 Q102,76 102,96 L98,122 Q92,130 84,132 L80,124 Q84,108 86,88 Q88,74 92,62 Z" />
      </M>

      {/* Lower Back */}
      <M v={v} m="lower_back" glowId={gid}>
        <path d="M44,110 Q40,120 42,132 L46,136 L50,134 Q52,126 50,112 Z" />
        <path d="M76,110 Q80,120 78,132 L74,136 L70,134 Q68,126 70,112 Z" />
      </M>

      {/* Triceps */}
      <M v={v} m="triceps" glowId={gid}>
        <path d="M10,68 Q8,84 10,102 Q12,112 18,114 Q24,112 26,102 Q26,84 22,68 Q18,62 14,64 Z" />
        <path d="M110,68 Q112,84 110,102 Q108,112 102,114 Q96,112 94,102 Q94,84 98,68 Q102,62 106,64 Z" />
      </M>

      {/* Forearms */}
      <M v={v} m="forearms" glowId={gid}>
        <path d="M8,118 Q6,134 8,152 Q10,164 16,164 Q22,162 24,152 Q24,134 20,118 Z" />
        <path d="M112,118 Q114,134 112,152 Q110,164 104,164 Q98,162 96,152 Q96,134 100,118 Z" />
      </M>

      {/* Glutes */}
      <M v={v} m="glutes" glowId={gid}>
        <path d="M30,134 Q22,146 24,160 Q26,170 36,172 Q46,170 50,160 Q52,148 46,136 Z" />
        <path d="M90,134 Q98,146 96,160 Q94,170 84,172 Q74,170 70,160 Q68,148 74,136 Z" />
      </M>

      {/* Hamstrings */}
      <M v={v} m="hamstrings" glowId={gid}>
        <path d="M30,174 Q24,190 26,208 Q28,220 38,222 Q48,220 50,208 Q52,190 46,174 Z" />
        <path d="M90,174 Q96,190 94,208 Q92,220 82,222 Q72,220 70,208 Q68,190 74,174 Z" />
      </M>

      {/* Calves */}
      <M v={v} m="calves" glowId={gid}>
        <path d="M32,226 Q28,238 30,248 Q32,254 38,254 Q44,252 46,246 Q48,236 44,224 Z" />
        <path d="M88,226 Q92,238 90,248 Q88,254 82,254 Q76,252 74,246 Q72,236 76,224 Z" />
      </M>
    </svg>
  )
}

// ─── Muscle name labels ───────────────────────────────────────────────────────

const MUSCLE_LABELS: Partial<Record<MuscleGroup, string>> = {
  chest: "Chest", front_delts: "Front Delts", side_delts: "Side Delts",
  rear_delts: "Rear Delts", biceps: "Biceps", triceps: "Triceps",
  forearms: "Forearms", abs: "Abs", obliques: "Obliques",
  quads: "Quads", hamstrings: "Hamstrings", glutes: "Glutes",
  calves: "Calves", lats: "Lats", traps: "Traps", lower_back: "Lower Back",
}

const TIME_OPTIONS = [
  { label: "7d",  days: 7  },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
]

// ─── Main component ───────────────────────────────────────────────────────────

export function MuscleHeatmap() {
  const [selectedDays, setSelectedDays] = useState(7)
  const [volumes, setVolumes] = useState<Volumes>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getWorkouts()
      .then((workouts) => setVolumes(normalizeVolumes(computeMuscleVolumes(workouts, selectedDays))))
      .catch((err) => console.error("MuscleHeatmap: failed to fetch workouts", err))
      .finally(() => setLoading(false))
  }, [selectedDays])

  const hasData = Object.keys(volumes).length > 0

  const workedMuscles = (Object.entries(volumes) as [MuscleGroup, number][])
    .filter(([, intensity]) => intensity > 0)
    .sort(([, a], [, b]) => b - a)

  return (
    <Card className="p-4 bg-card border-border">
      {/* Header */}
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
      ) : !hasData ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No workout data in the last {selectedDays} days.
        </p>
      ) : (
        <>
          {/* Body diagrams */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground text-center mb-2 uppercase tracking-widest">Front</p>
              <FrontBody v={volumes} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground text-center mb-2 uppercase tracking-widest">Back</p>
              <BackBody v={volumes} />
            </div>
          </div>

          {/* Worked muscles chips */}
          {workedMuscles.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border/50">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Muscles Worked</p>
              <div className="flex flex-wrap gap-1.5">
                {workedMuscles.map(([m, intensity]) => (
                  <span
                    key={m}
                    className="text-[10px] font-semibold px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: `rgba(170,255,0,${(0.1 + intensity * 0.15).toFixed(2)})`,
                      color: `rgba(170,255,0,${(0.5 + intensity * 0.5).toFixed(2)})`,
                    }}
                  >
                    {MUSCLE_LABELS[m]}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Intensity legend */}
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
