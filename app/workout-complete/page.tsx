"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Sparkles, Flame, Home, Trophy, Share2 } from "lucide-react"
import Link from "next/link"
import { getWorkoutStats } from "@/lib/workout-storage"
import { ShareCard } from "@/components/share-card"
import { shareWorkoutCard } from "@/lib/share-utils"

// ─── AI suggestion (rule-based) ───────────────────────────────────────────────

function getSuggestion(topExercise: string, topWeight: number, totalSets: number): string {
  if (topExercise && topWeight > 0) {
    return `Consider adding +2.5 kg to ${topExercise} next session.`
  }
  if (totalSets > 15) {
    return "Strong volume today! Prioritise sleep and protein for recovery."
  }
  return "Every rep counts. Stay consistent and results will follow."
}

// ─── Stat tile ────────────────────────────────────────────────────────────────

function StatTile({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-card border border-border">
      <p className="text-xl font-bold text-foreground">
        {value}
        {unit && <span className="text-sm font-medium text-muted-foreground ml-1">{unit}</span>}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  )
}

function formatWeight(w: number): string {
  if (w >= 1000) return `${(w / 1000).toFixed(1)}k`
  return String(w)
}

// ─── Page content ─────────────────────────────────────────────────────────────

function WorkoutCompleteContent() {
  const params = useSearchParams()
  const router = useRouter()
  const [streak, setStreak] = useState(0)
  const [sharing, setSharing] = useState(false)
  const shareCardRef = useRef<HTMLDivElement>(null)

  const name         = params.get("name")     ?? "Workout"
  const sets         = Math.max(0, Number(params.get("sets"))     || 0)
  const reps         = Math.max(0, Number(params.get("reps"))     || 0)
  const weight       = Math.max(0, Number(params.get("weight"))   || 0)
  const duration     = Math.max(0, Number(params.get("duration")) || 0)
  const topExercise  = params.get("topExercise") ?? ""
  const topWeight    = Math.max(0, Number(params.get("topWeight")) || 0)
  const prCount      = Math.max(0, Number(params.get("prCount"))  || 0)
  const prNames      = params.get("prNames") ? params.get("prNames")!.split(",").filter(Boolean) : []

  const suggestion = getSuggestion(topExercise, topWeight, sets)

  const handleShare = async () => {
    if (!shareCardRef.current) return
    setSharing(true)
    try {
      await shareWorkoutCard(shareCardRef.current, `${name.replace(/\s+/g, "-")}-workout.png`)
    } finally {
      setSharing(false)
    }
  }

  useEffect(() => {
    getWorkoutStats().then((s) => setStreak(s.currentStreak)).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 px-5 pb-10 flex flex-col items-center" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 4rem)" }}>

        {/* Trophy + headline */}
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 text-4xl"
            style={{ backgroundColor: prCount > 0 ? "rgba(234,179,8,0.15)" : "hsl(80 100% 50% / 0.15)" }}
          >
            {prCount > 0 ? "🏆" : "🎉"}
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {prCount > 0 ? "New PR!" : "Workout Complete!"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{name}</p>
        </div>

        {/* Stats grid */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6">
          <StatTile label="Volume" value={formatWeight(weight)} unit="kg" />
          <StatTile label="Duration" value={duration} unit="min" />
          <StatTile label="Sets" value={sets} />
          <StatTile label="Reps" value={reps} />
        </div>

        {/* New PRs celebration */}
        {prCount > 0 && (
          <div
            className="w-full rounded-2xl border p-5 mb-2"
            style={{ borderColor: "rgba(234,179,8,0.4)", backgroundColor: "rgba(234,179,8,0.06)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <p className="text-sm font-bold text-yellow-500">
                {prCount} New Personal Record{prCount > 1 ? "s" : ""}!
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {prNames.map((name) => (
                <span
                  key={name}
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "rgba(234,179,8,0.15)", color: "#ca8a04" }}
                >
                  🏆 {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Streak badge */}
        {streak > 0 && (
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-full mb-6"
            style={{ backgroundColor: "rgba(249,115,22,0.12)" }}
          >
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-semibold text-orange-500">
              {streak} day{streak > 1 ? "s" : ""} streak
            </span>
          </div>
        )}

        {/* AI suggestion card */}
        <div className="w-full rounded-2xl border border-border bg-card p-5 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">AI Suggestion</p>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{suggestion}</p>
        </div>

        {/* Actions */}
        <div className="w-full space-y-3">
          <Button
            className="w-full h-12 font-semibold text-sm"
            style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
            onClick={() => router.push("/")}
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 font-semibold text-sm"
            onClick={handleShare}
            disabled={sharing}
          >
            <Share2 className="h-4 w-4 mr-2" />
            {sharing ? "Preparing…" : "Share Workout"}
          </Button>
          <Link href="/log-workout" className="block">
            <Button variant="outline" className="w-full h-12 font-semibold text-sm">
              <Plus className="h-4 w-4 mr-2" />
              Log Another Workout
            </Button>
          </Link>
        </div>
      </main>

      {/* Hidden share card — rendered off-screen for html2canvas */}
      <div style={{ position: "fixed", left: "-9999px", top: 0, pointerEvents: "none" }}>
        <ShareCard
          ref={shareCardRef}
          workoutName={name}
          duration={duration}
          sets={sets}
          reps={reps}
          weight={weight}
          prCount={prCount}
        />
      </div>
    </div>
  )
}

export default function WorkoutCompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    }>
      <WorkoutCompleteContent />
    </Suspense>
  )
}
