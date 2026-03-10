"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Pencil } from "lucide-react"
import { toast } from "sonner"
import { computeBMI, getBMICategory } from "@/lib/fitness-utils"

interface BodyMetricsCardProps {
  height?: number
  weight?: number
  age?: number
  onUpdate: (data: { height?: number; weight?: number; age?: number }) => void
}

export function BodyMetricsCard({ height: h, weight: w, age: a, onUpdate }: BodyMetricsCardProps) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ height: String(h ?? ""), weight: String(w ?? ""), age: String(a ?? "") })

  const bmi = h && w ? computeBMI(w, h) : null
  const bmiInfo = bmi ? getBMICategory(bmi) : null

  const save = async () => {
    const height = form.height ? Number(form.height) : undefined
    const weight = form.weight ? Number(form.weight) : undefined
    const age    = form.age    ? Number(form.age)    : undefined

    if (height && (height < 50 || height > 300)) { toast.error("Height must be between 50–300 cm"); return }
    if (weight && (weight < 20 || weight > 500))  { toast.error("Weight must be between 20–500 kg"); return }
    if (age    && (age    < 10 || age    > 120))   { toast.error("Age must be between 10–120");       return }

    setSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ height, weight, age }),
      })
      if (!res.ok) throw new Error()
      onUpdate({ height, weight, age })
      setOpen(false)
      toast.success("Body metrics updated!")
    } catch {
      toast.error("Failed to save metrics")
    } finally {
      setSaving(false)
    }
  }

  const metrics = [
    { label: "Height", value: h ? `${h} cm` : "—", sub: h ? `${Math.floor(h / 30.48)}′${Math.round((h / 2.54) % 12)}″` : null },
    { label: "Weight", value: w ? `${w} kg` : "—", sub: w ? `${Math.round(w * 2.205)} lbs` : null },
    { label: "Age",    value: a ? `${a} yrs` : "—", sub: null },
    { label: "BMI",    value: bmi ? String(bmi) : "—", sub: bmiInfo?.label ?? null, subColor: bmiInfo?.color },
  ]

  return (
    <>
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">Body Metrics</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Height, weight & BMI</p>
          </div>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setOpen(true)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {metrics.map(({ label, value, sub, subColor }) => (
            <div key={label} className="flex flex-col items-center p-3 rounded-xl bg-background text-center">
              <p className="text-sm font-bold text-foreground leading-none">{value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
              {sub && (
                <p className="text-[10px] mt-0.5 font-medium" style={{ color: subColor ?? "hsl(0 0% 55%)" }}>
                  {sub}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Body Metrics</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            {[
              { key: "height", label: "Height (cm)", placeholder: "e.g. 175" },
              { key: "weight", label: "Weight (kg)", placeholder: "e.g. 75" },
              { key: "age",    label: "Age",          placeholder: "e.g. 25" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <p className="text-sm font-medium text-foreground mb-1.5">{label}</p>
                <Input
                  type="number"
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="bg-background"
                />
              </div>
            ))}
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
