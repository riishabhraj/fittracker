"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Plus, TrendingDown, TrendingUp, Scale } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"

interface WeightEntry {
  date: string
  weight: number
  bodyFat?: number
}

interface ChartPoint {
  month: string
  date: string
  weight?: number
  bodyFat?: number
}

const chartConfig = {
  weight:  { label: "Weight (kg)", color: "hsl(80 100% 50%)" },
  bodyFat: { label: "Body Fat (%)", color: "#60a5fa" },
}

export function BodyMeasurements() {
  const [entries, setEntries] = useState<WeightEntry[]>([])
  const [selectedMetric, setSelectedMetric] = useState<"weight" | "bodyFat">("weight")
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    weight: "",
    bodyFat: "",
    date: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((profile) => {
        if (profile?.weightHistory?.length) {
          const sorted = [...profile.weightHistory].sort(
            (a: WeightEntry, b: WeightEntry) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          setEntries(sorted)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toChartPoint = (e: WeightEntry): ChartPoint => ({
    month: new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    date: e.date,
    weight: e.weight,
    bodyFat: e.bodyFat,
  })

  const saveMeasurement = async () => {
    if (!form.weight) { toast.error("Please enter a weight value"); return }
    const weight = parseFloat(form.weight)
    const bodyFat = form.bodyFat ? parseFloat(form.bodyFat) : undefined
    if (weight < 20 || weight > 500) { toast.error("Weight must be between 20–500 kg"); return }
    if (bodyFat !== undefined && (bodyFat < 1 || bodyFat > 60)) { toast.error("Body fat must be between 1–60%"); return }

    setSaving(true)
    try {
      const res = await fetch("/api/profile/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: form.date, weight, bodyFat }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error ?? "Failed to save measurement")
        return
      }
      const profile = await res.json()
      if (profile?.weightHistory) {
        const sorted = [...profile.weightHistory].sort(
          (a: WeightEntry, b: WeightEntry) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
        setEntries(sorted)
      }
      setForm({ weight: "", bodyFat: "", date: new Date().toISOString().split("T")[0] })
      setIsDialogOpen(false)
      toast.success("Measurement saved!")
    } catch {
      toast.error("Failed to save measurement")
    } finally {
      setSaving(false)
    }
  }

  const AddEntryButton = () => (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}>
          <Plus className="h-4 w-4 mr-1" />
          Add Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Body Measurement</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="e.g. 75"
              value={form.weight}
              onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
              className="bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bodyFat">Body Fat % (optional)</Label>
            <Input
              id="bodyFat"
              type="number"
              placeholder="e.g. 15"
              value={form.bodyFat}
              onChange={(e) => setForm((f) => ({ ...f, bodyFat: e.target.value }))}
              className="bg-background"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button
              className="flex-1"
              style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
              onClick={saveMeasurement}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  if (loading) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="text-center py-8">
          <Scale className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
          <p className="text-muted-foreground text-sm">Loading…</p>
        </div>
      </Card>
    )
  }

  const hasData = entries.length > 0
  const latest = hasData ? entries[entries.length - 1] : null
  const previous = entries.length > 1 ? entries[entries.length - 2] : null

  const weightChange = latest?.weight && previous?.weight ? latest.weight - previous.weight : null
  const bodyFatChange = latest?.bodyFat && previous?.bodyFat ? latest.bodyFat - previous.bodyFat : null

  const chartData = entries.map(toChartPoint)

  return (
    <div className="space-y-4">
      {/* Current Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-2 mb-1">
            <Scale className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground font-medium">Weight</p>
          </div>
          <p className="text-xl font-bold text-foreground">{latest?.weight ? `${latest.weight} kg` : "—"}</p>
          {weightChange !== null && (
            <div className="flex items-center mt-1 gap-1">
              {weightChange > 0 ? <TrendingUp className="h-3 w-3 text-red-400" /> : <TrendingDown className="h-3 w-3 text-green-400" />}
              <span className={`text-xs font-medium ${weightChange > 0 ? "text-red-400" : "text-green-400"}`}>
                {weightChange > 0 ? "+" : ""}{weightChange.toFixed(1)} kg
              </span>
            </div>
          )}
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-4 w-4 text-blue-400" />
            <p className="text-xs text-muted-foreground font-medium">Body Fat</p>
          </div>
          <p className="text-xl font-bold text-foreground">{latest?.bodyFat ? `${latest.bodyFat}%` : "—"}</p>
          {bodyFatChange !== null && (
            <div className="flex items-center mt-1 gap-1">
              {bodyFatChange > 0 ? <TrendingUp className="h-3 w-3 text-red-400" /> : <TrendingDown className="h-3 w-3 text-green-400" />}
              <span className={`text-xs font-medium ${bodyFatChange > 0 ? "text-red-400" : "text-green-400"}`}>
                {bodyFatChange > 0 ? "+" : ""}{bodyFatChange.toFixed(1)}%
              </span>
            </div>
          )}
        </Card>

        <Card className="p-4 bg-card border-border flex flex-col items-center justify-center">
          <AddEntryButton />
        </Card>
      </div>

      {/* Chart */}
      {hasData ? (
        <Card className="p-5 bg-card border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Progress Chart</h3>
            <div className="flex bg-muted/20 rounded-lg p-0.5">
              {(["weight", "bodyFat"] as const).map((m) => (
                <Button
                  key={m}
                  variant={selectedMetric === m ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedMetric(m)}
                  className="h-7 text-xs px-3"
                  style={selectedMetric === m ? { backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" } : {}}
                >
                  {m === "weight" ? "Weight" : "Body Fat"}
                </Button>
              ))}
            </div>
          </div>

          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(0 0% 40%)" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(0 0% 40%)" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke={chartConfig[selectedMetric].color}
                  strokeWidth={2}
                  dot={{ fill: chartConfig[selectedMetric].color, r: 3 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>
      ) : (
        <Card className="p-8 bg-card border-border">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-muted/10 mx-auto mb-4 flex items-center justify-center">
              <Scale className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-1">No measurements yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Track your weight over time to see trends</p>
            <AddEntryButton />
          </div>
        </Card>
      )}
    </div>
  )
}
