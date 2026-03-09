"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { ChevronLeft, Dumbbell, Flame, TrendingUp, Zap, Sparkles } from "lucide-react"
import Image from "next/image"
import { getInsight, getPersonalizedTemplates, type FitnessProfile } from "@/lib/fitness-utils"

// ─── Types ───────────────────────────────────────────────────────────────────

type Goal = "muscle" | "fat_loss" | "strength" | "fitness"
type Experience = "beginner" | "intermediate" | "advanced"
type Equipment = "gym" | "home_gym" | "dumbbells"

interface Profile {
  goal?: Goal
  experienceLevel?: Experience
  height?: number
  weight?: number
  age?: number
  workoutDaysPerWeek?: number
  equipment?: Equipment
}

// ─── Auto-generate personalized templates (non-blocking) ─────────────────────

async function createPersonalizedTemplates(profile: Profile) {
  const templates = getPersonalizedTemplates(profile as FitnessProfile)
  await Promise.allSettled(
    templates.map((t) =>
      fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: t.name,
          exercises: t.exercises.map((e) => ({
            id: `${e.name.toLowerCase().replace(/\s+/g, "-")}-0`,
            name: e.name,
            category: e.category,
            sets: Array(e.sets).fill({ reps: 0, weight: 0 }),
          })),
        }),
      })
    )
  )
}

// ─── Step components ──────────────────────────────────────────────────────────

function OptionCard({
  selected,
  onClick,
  icon,
  label,
  sublabel,
}: {
  selected: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  sublabel?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all active:scale-95 ${
        selected
          ? "border-primary bg-primary/10"
          : "border-border bg-card hover:border-border/80"
      }`}
    >
      <span className="text-2xl shrink-0">{icon}</span>
      <div>
        <p className={`font-semibold text-sm ${selected ? "text-primary" : "text-foreground"}`}>
          {label}
        </p>
        {sublabel && (
          <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
        )}
      </div>
    </button>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 5 // steps 0–4 (insight is step 5, not counted in bar)

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<Profile>({})

  const progress = Math.min((step / TOTAL_STEPS) * 100, 100)

  function next() {
    setStep((s) => s + 1)
  }
  function back() {
    setStep((s) => Math.max(0, s - 1))
  }
  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((p) => ({ ...p, [key]: value }))
  }

  async function finish() {
    setSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, onboardingCompleted: true }),
      })
      if (!res.ok) throw new Error("Failed to save profile")
      // Generate personalized templates in background (non-blocking)
      createPersonalizedTemplates(profile).catch(() => {})
      router.push("/")
    } catch {
      toast.error("Something went wrong. Please try again.")
      setSaving(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-5 pb-4" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}>
        <div className="flex items-center justify-between mb-6">
          {step > 0 && step < 5 ? (
            <button
              type="button"
              onClick={back}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-2">
            <Image src="/fittracker-app-icon.png" alt="FitTracker" width={28} height={28} className="rounded-lg" />
            <span className="text-sm font-semibold text-foreground">FitTracker</span>
          </div>
        </div>

        {/* Progress bar (shown only on steps 0–4) */}
        {step < 5 && (
          <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: "hsl(80 100% 50%)" }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pt-6 pb-8 flex flex-col">
        {/* Step 0 — Goal */}
        {step === 0 && (
          <div className="flex flex-col flex-1">
            <div className="mb-8">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Step 1 of 5</p>
              <h1 className="text-2xl font-bold text-foreground leading-tight">What's your primary goal?</h1>
              <p className="text-muted-foreground text-sm mt-1">We'll personalise your experience around this.</p>
            </div>
            <div className="space-y-3 flex-1">
              <OptionCard
                selected={profile.goal === "muscle"}
                onClick={() => set("goal", "muscle")}
                icon={<Dumbbell className="h-6 w-6 text-blue-400" />}
                label="Build Muscle"
                sublabel="Hypertrophy training for size and definition"
              />
              <OptionCard
                selected={profile.goal === "fat_loss"}
                onClick={() => set("goal", "fat_loss")}
                icon={<Flame className="h-6 w-6 text-orange-400" />}
                label="Lose Fat"
                sublabel="Burn calories and lean out while keeping muscle"
              />
              <OptionCard
                selected={profile.goal === "strength"}
                onClick={() => set("goal", "strength")}
                icon={<TrendingUp className="h-6 w-6 text-purple-400" />}
                label="Strength Training"
                sublabel="Get stronger with progressive overload"
              />
              <OptionCard
                selected={profile.goal === "fitness"}
                onClick={() => set("goal", "fitness")}
                icon={<Zap className="h-6 w-6 text-yellow-400" />}
                label="Stay Fit"
                sublabel="Maintain health, energy and overall fitness"
              />
            </div>
            <Button
              className="w-full h-12 mt-6 font-semibold text-sm"
              style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
              disabled={!profile.goal}
              onClick={next}
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 1 — Experience */}
        {step === 1 && (
          <div className="flex flex-col flex-1">
            <div className="mb-8">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Step 2 of 5</p>
              <h1 className="text-2xl font-bold text-foreground leading-tight">How experienced are you?</h1>
              <p className="text-muted-foreground text-sm mt-1">This helps us calibrate volume and intensity.</p>
            </div>
            <div className="space-y-3 flex-1">
              <OptionCard
                selected={profile.experienceLevel === "beginner"}
                onClick={() => set("experienceLevel", "beginner")}
                icon="🌱"
                label="Beginner"
                sublabel="0 – 6 months of consistent training"
              />
              <OptionCard
                selected={profile.experienceLevel === "intermediate"}
                onClick={() => set("experienceLevel", "intermediate")}
                icon="💪"
                label="Intermediate"
                sublabel="6 months – 2 years of consistent training"
              />
              <OptionCard
                selected={profile.experienceLevel === "advanced"}
                onClick={() => set("experienceLevel", "advanced")}
                icon="🏆"
                label="Advanced"
                sublabel="2+ years of serious training"
              />
            </div>
            <Button
              className="w-full h-12 mt-6 font-semibold text-sm"
              style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
              disabled={!profile.experienceLevel}
              onClick={next}
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2 — Body Details */}
        {step === 2 && (
          <div className="flex flex-col flex-1">
            <div className="mb-8">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Step 3 of 5</p>
              <h1 className="text-2xl font-bold text-foreground leading-tight">Your body stats</h1>
              <p className="text-muted-foreground text-sm mt-1">Used for calorie estimates and progress tracking. Age is optional.</p>
            </div>
            <div className="space-y-4 flex-1">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Height (cm)</label>
                <Input
                  type="number"
                  placeholder="e.g. 175"
                  className="h-12 bg-card border-border"
                  value={profile.height ?? ""}
                  onChange={(e) => set("height", e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Weight (kg)</label>
                <Input
                  type="number"
                  placeholder="e.g. 75"
                  className="h-12 bg-card border-border"
                  value={profile.weight ?? ""}
                  onChange={(e) => set("weight", e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Age <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 25"
                  className="h-12 bg-card border-border"
                  value={profile.age ?? ""}
                  onChange={(e) => set("age", e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>
            <Button
              className="w-full h-12 mt-6 font-semibold text-sm"
              style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
              disabled={!profile.height || !profile.weight}
              onClick={next}
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 3 — Frequency */}
        {step === 3 && (
          <div className="flex flex-col flex-1">
            <div className="mb-8">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Step 4 of 5</p>
              <h1 className="text-2xl font-bold text-foreground leading-tight">How often do you train?</h1>
              <p className="text-muted-foreground text-sm mt-1">Days per week you can commit to the gym.</p>
            </div>
            <div className="space-y-3 flex-1">
              {[
                { days: 3, desc: "Great for beginners — enough time to recover" },
                { days: 4, desc: "Sweet spot for most goals" },
                { days: 5, desc: "High commitment, solid results" },
                { days: 6, desc: "Advanced athletes only" },
              ].map(({ days, desc }) => (
                <OptionCard
                  key={days}
                  selected={profile.workoutDaysPerWeek === days}
                  onClick={() => set("workoutDaysPerWeek", days)}
                  icon={`${days}×`}
                  label={`${days} days per week`}
                  sublabel={desc}
                />
              ))}
            </div>
            <Button
              className="w-full h-12 mt-6 font-semibold text-sm"
              style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
              disabled={!profile.workoutDaysPerWeek}
              onClick={next}
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 4 — Equipment */}
        {step === 4 && (
          <div className="flex flex-col flex-1">
            <div className="mb-8">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Step 5 of 5</p>
              <h1 className="text-2xl font-bold text-foreground leading-tight">Where do you train?</h1>
              <p className="text-muted-foreground text-sm mt-1">We'll suggest workouts based on your equipment.</p>
            </div>
            <div className="space-y-3 flex-1">
              <OptionCard
                selected={profile.equipment === "gym"}
                onClick={() => set("equipment", "gym")}
                icon="🏋️"
                label="Full Gym"
                sublabel="Barbells, machines, cables — the full setup"
              />
              <OptionCard
                selected={profile.equipment === "home_gym"}
                onClick={() => set("equipment", "home_gym")}
                icon="🏠"
                label="Home Gym"
                sublabel="Power rack or squat stand at home"
              />
              <OptionCard
                selected={profile.equipment === "dumbbells"}
                onClick={() => set("equipment", "dumbbells")}
                icon="🪑"
                label="Dumbbells Only"
                sublabel="Limited equipment — bodyweight + dumbbells"
              />
            </div>
            <Button
              className="w-full h-12 mt-6 font-semibold text-sm"
              style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
              disabled={!profile.equipment}
              onClick={next}
            >
              See My Plan
            </Button>
          </div>
        )}

        {/* Step 5 — AI Insight */}
        {step === 5 && (() => {
          const insight = getInsight(profile)
          return (
            <div className="flex flex-col flex-1 items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">AI Recommendation</p>
              <h1 className="text-2xl font-bold text-foreground leading-tight mb-3">
                {insight.program}
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mb-8">
                {insight.description}
              </p>

              {/* Profile summary */}
              <div className="w-full rounded-2xl bg-card border border-border p-4 text-left space-y-2 mb-8">
                {[
                  { label: "Goal", value: profile.goal?.replace("_", " ") },
                  { label: "Experience", value: profile.experienceLevel },
                  { label: "Height / Weight", value: `${profile.height} cm / ${profile.weight} kg` },
                  { label: "Training days", value: `${profile.workoutDaysPerWeek}× per week` },
                  { label: "Equipment", value: profile.equipment?.replace("_", " ") },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground capitalize">{value}</span>
                  </div>
                ))}
              </div>

              <Button
                className="w-full h-12 font-semibold text-sm"
                style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
                disabled={saving}
                onClick={finish}
              >
                {saving ? "Saving…" : "Let's go! 🚀"}
              </Button>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
