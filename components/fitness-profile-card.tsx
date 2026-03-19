"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Pencil } from "lucide-react"
import { toast } from "sonner"
import { GOAL_LABELS, EXPERIENCE_LABELS } from "@/lib/fitness-utils"

type Goal = "muscle" | "fat_loss" | "strength" | "fitness"
type Experience = "beginner" | "intermediate" | "advanced"
type Equipment = "gym" | "home_gym" | "dumbbells"
type Gender = "male" | "female"

interface FitnessProfileCardProps {
  goal?: Goal
  experienceLevel?: Experience
  workoutDaysPerWeek?: number
  equipment?: Equipment
  gender?: Gender
  onUpdate: (data: Partial<{ goal: Goal; experienceLevel: Experience; workoutDaysPerWeek: number; equipment: Equipment; gender: Gender }>) => void
}

const EQUIPMENT_LABELS: Record<Equipment, string> = {
  gym:        "🏋️ Full Gym",
  home_gym:   "🏠 Home Gym",
  dumbbells:  "🥊 Dumbbells Only",
}

function OptionRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T | undefined
  onChange: (v: T) => void
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className="px-3 py-2 rounded-xl text-sm font-medium border transition-all"
            style={
              value === o.value
                ? { backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)", borderColor: "hsl(80 100% 50%)" }
                : { backgroundColor: "transparent", color: "hsl(0 0% 55%)", borderColor: "hsl(0 0% 18%)" }
            }
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function FitnessProfileCard({
  goal: g,
  experienceLevel: exp,
  workoutDaysPerWeek: days,
  equipment: eq,
  gender: gen,
  onUpdate,
}: FitnessProfileCardProps) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ goal: g, experienceLevel: exp, workoutDaysPerWeek: days, equipment: eq, gender: gen })

  const chips = [
    g   && GOAL_LABELS[g],
    exp && EXPERIENCE_LABELS[exp],
    days && `${days}× / week`,
    eq  && EQUIPMENT_LABELS[eq],
    gen && (gen === "male" ? "♂ Male" : "♀ Female"),
  ].filter(Boolean) as string[]

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      onUpdate(form as Parameters<typeof onUpdate>[0])
      setOpen(false)
      toast.success("Fitness profile updated!")
    } catch {
      toast.error("Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground">Fitness Profile</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Goal, experience & preferences</p>
          </div>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { setForm({ goal: g, experienceLevel: exp, workoutDaysPerWeek: days, equipment: eq, gender: gen }); setOpen(true) }}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>

        {chips.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <span key={c} className="text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                {c}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Tap edit to set your fitness profile.</p>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Fitness Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-1">
            <OptionRow
              label="Goal"
              value={form.goal}
              onChange={(v) => setForm((f) => ({ ...f, goal: v }))}
              options={[
                { value: "muscle",   label: "💪 Build Muscle" },
                { value: "fat_loss", label: "🔥 Lose Fat" },
                { value: "strength", label: "🏋️ Strength" },
                { value: "fitness",  label: "⚡ Stay Fit" },
              ]}
            />
            <OptionRow
              label="Experience"
              value={form.experienceLevel}
              onChange={(v) => setForm((f) => ({ ...f, experienceLevel: v }))}
              options={[
                { value: "beginner",     label: "🌱 Beginner" },
                { value: "intermediate", label: "💪 Intermediate" },
                { value: "advanced",     label: "🏆 Advanced" },
              ]}
            />
            <OptionRow
              label="Days / Week"
              value={form.workoutDaysPerWeek ? String(form.workoutDaysPerWeek) as never : undefined}
              onChange={(v) => setForm((f) => ({ ...f, workoutDaysPerWeek: Number(v) }))}
              options={[3, 4, 5, 6].map((d) => ({ value: String(d) as never, label: `${d}×` }))}
            />
            <OptionRow
              label="Equipment"
              value={form.equipment}
              onChange={(v) => setForm((f) => ({ ...f, equipment: v }))}
              options={[
                { value: "gym",       label: "🏋️ Full Gym" },
                { value: "home_gym",  label: "🏠 Home Gym" },
                { value: "dumbbells", label: "🥊 Dumbbells" },
              ]}
            />
            <OptionRow
              label="Anatomy (for heatmap)"
              value={form.gender}
              onChange={(v) => setForm((f) => ({ ...f, gender: v }))}
              options={[
                { value: "male",   label: "♂ Male" },
                { value: "female", label: "♀ Female" },
              ]}
            />
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
              <Button
                className="flex-1"
                style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
                onClick={save}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
