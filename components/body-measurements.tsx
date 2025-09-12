"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Plus, TrendingDown, TrendingUp, Scale, Calendar } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"

interface MeasurementData {
  month: string
  weight?: number
  bodyFat?: number
  date: string
}

const chartConfig = {
  weight: {
    label: "Weight (lbs)",
    color: "hsl(var(--primary))",
  },
  bodyFat: {
    label: "Body Fat (%)",
    color: "hsl(var(--chart-2))",
  },
}

// Storage key for body measurements
const MEASUREMENTS_KEY = 'fittracker_body_measurements'

export function BodyMeasurements() {
  const [measurementData, setMeasurementData] = useState<MeasurementData[]>([])
  const [selectedMetric, setSelectedMetric] = useState<"weight" | "bodyFat">("weight")
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    weight: '',
    bodyFat: '',
    date: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
  })

  useEffect(() => {
    const loadMeasurements = () => {
      try {
        if (typeof window === 'undefined') {
          setLoading(false)
          return
        }
        
        const stored = localStorage.getItem(MEASUREMENTS_KEY)
        if (stored) {
          const measurements = JSON.parse(stored)
          setMeasurementData(measurements)
        }
      } catch (error) {
        console.error('Failed to load measurements:', error)
      }
      setLoading(false)
    }

    loadMeasurements()
  }, [])

  const saveMeasurement = () => {
    if (!formData.weight && !formData.bodyFat) {
      toast.error("Please enter at least one measurement")
      return
    }

    try {
      const newMeasurement: MeasurementData = {
        month: new Date(formData.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : undefined,
        date: formData.date
      }

      const updatedMeasurements = [...measurementData, newMeasurement]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      setMeasurementData(updatedMeasurements)
      localStorage.setItem(MEASUREMENTS_KEY, JSON.stringify(updatedMeasurements))
      
      // Reset form
      setFormData({
        weight: '',
        bodyFat: '',
        date: new Date().toISOString().split('T')[0]
      })
      
      setIsDialogOpen(false)
      toast.success("Measurement added successfully!")
    } catch (error) {
      console.error('Failed to save measurement:', error)
      toast.error("Failed to save measurement")
    }
  }

  const getBMI = (weight: number, height: number = 70): number => {
    // Using 70 inches (5'10") as default height
    return (weight / (height * height)) * 703
  }

  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return "Underweight"
    if (bmi < 25) return "Normal"
    if (bmi < 30) return "Overweight"
    return "Obese"
  }

  const AddEntryButton = () => (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Body Measurement</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (lbs)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="e.g., 175"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bodyFat">Body Fat (%)</Label>
            <Input
              id="bodyFat"
              type="number"
              placeholder="e.g., 15"
              value={formData.bodyFat}
              onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value })}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveMeasurement}>
              Save Measurement
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
          <p className="text-muted-foreground">Loading measurements...</p>
        </div>
      </Card>
    )
  }

  const hasData = measurementData.length > 0
  const latestMeasurement = hasData ? measurementData[measurementData.length - 1] : null
  const previousMeasurement = hasData && measurementData.length > 1 ? measurementData[measurementData.length - 2] : null

  const getWeightChange = () => {
    if (!latestMeasurement?.weight || !previousMeasurement?.weight) return null
    return latestMeasurement.weight - previousMeasurement.weight
  }

  const getBodyFatChange = () => {
    if (!latestMeasurement?.bodyFat || !previousMeasurement?.bodyFat) return null
    return latestMeasurement.bodyFat - previousMeasurement.bodyFat
  }

  const weightChange = getWeightChange()
  const bodyFatChange = getBodyFatChange()

  return (
    <div className="space-y-6">
      {/* Current Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Scale className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Current Weight</p>
                <p className="text-2xl font-bold text-primary">
                  {latestMeasurement?.weight ? `${latestMeasurement.weight} lbs` : '--'}
                </p>
                {weightChange !== null && (
                  <div className="flex items-center mt-1">
                    {weightChange > 0 ? (
                      <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                    )}
                    <span className={`text-sm ${weightChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} lbs
                    </span>
                  </div>
                )}
              </div>
            </div>
            <AddEntryButton />
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <TrendingDown className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="font-medium text-foreground">Body Fat</p>
              <p className="text-2xl font-bold text-blue-500">
                {latestMeasurement?.bodyFat ? `${latestMeasurement.bodyFat}%` : '--'}
              </p>
              {bodyFatChange !== null && (
                <div className="flex items-center mt-1">
                  {bodyFatChange > 0 ? (
                    <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                  )}
                  <span className={`text-sm ${bodyFatChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {bodyFatChange > 0 ? '+' : ''}{bodyFatChange.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Scale className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="font-medium text-foreground">BMI</p>
              <p className="text-2xl font-bold text-green-500">
                {latestMeasurement?.weight ? getBMI(latestMeasurement.weight).toFixed(1) : '--'}
              </p>
              {latestMeasurement?.weight && (
                <p className="text-sm text-muted-foreground mt-1">
                  {getBMICategory(getBMI(latestMeasurement.weight))}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      {hasData ? (
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Progress Chart</h3>
            <div className="flex items-center space-x-2">
              <AddEntryButton />
              <div className="flex bg-muted/20 rounded-lg p-1">
                <Button
                  variant={selectedMetric === "weight" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedMetric("weight")}
                  className="h-8"
                >
                  Weight
                </Button>
                <Button
                  variant={selectedMetric === "bodyFat" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedMetric("bodyFat")}
                  className="h-8"
                >
                  Body Fat
                </Button>
              </div>
            </div>
          </div>

          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={measurementData}>
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke={chartConfig[selectedMetric].color}
                  strokeWidth={2}
                  dot={{ fill: chartConfig[selectedMetric].color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>
      ) : (
        <Card className="p-8 bg-card border-border">
          <div className="text-center">
            <div className="p-4 bg-muted/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Scale className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No measurements yet</h3>
            <p className="text-muted-foreground mb-4">Start tracking your body measurements to see progress over time</p>
            <AddEntryButton />
          </div>
        </Card>
      )}
    </div>
  )
}
