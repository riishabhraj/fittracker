"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Plus, Target, TrendingUp, Calendar, Dumbbell } from "lucide-react"
import { saveGoal, generateId, strengthGoalTemplates, habitGoalTemplates, Goal } from "@/lib/goal-storage"
import { toast } from "sonner"

interface CreateGoalDialogProps {
  children: React.ReactNode
  goalType?: 'strength' | 'habit'
  onGoalCreated?: () => void
}

export function CreateGoalDialog({ children, goalType, onGoalCreated }: CreateGoalDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<'strength' | 'habit'>(goalType || 'strength')
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [customGoal, setCustomGoal] = useState({
    title: '',
    description: '',
    target: '',
    unit: '',
    exerciseName: '',
    frequency: 'weekly'
  })
  const [showCustomForm, setShowCustomForm] = useState(false)

  const templates = selectedType === 'strength' ? strengthGoalTemplates : habitGoalTemplates

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template)
    setShowCustomForm(false)
  }

  const handleCreateFromTemplate = () => {
    if (!selectedTemplate) return

    const goal: Goal = {
      id: generateId(),
      title: selectedTemplate.title,
      description: selectedTemplate.description,
      type: selectedType,
      target: selectedTemplate.target,
      current: 0,
      unit: selectedTemplate.unit,
      category: selectedType,
      createdDate: new Date().toISOString(),
      completed: false,
      icon: selectedTemplate.icon,
      color: selectedTemplate.color
    }

    // Add type-specific properties
    if (selectedType === 'strength') {
      (goal as any).exerciseName = selectedTemplate.exerciseName
      ;(goal as any).metric = selectedTemplate.metric
    } else if (selectedType === 'habit') {
      (goal as any).frequency = selectedTemplate.frequency
      ;(goal as any).streak = 0
    }

    saveGoal(goal)
    toast.success(`Goal "${goal.title}" created successfully!`)
    setOpen(false)
    setSelectedTemplate(null)
    onGoalCreated?.()
  }

  const handleCreateCustom = () => {
    if (!customGoal.title || !customGoal.target || !customGoal.unit) {
      toast.error("Please fill in all required fields")
      return
    }

    const goal: Goal = {
      id: generateId(),
      title: customGoal.title,
      description: customGoal.description,
      type: selectedType,
      target: parseInt(customGoal.target),
      current: 0,
      unit: customGoal.unit,
      category: selectedType,
      createdDate: new Date().toISOString(),
      completed: false,
      icon: selectedType === 'strength' ? '💪' : '🎯'
    }

    // Add type-specific properties
    if (selectedType === 'strength') {
      (goal as any).exerciseName = customGoal.exerciseName || customGoal.title
      ;(goal as any).metric = customGoal.unit === 'lbs' || customGoal.unit === 'kg' ? 'weight' : 'reps'
    } else if (selectedType === 'habit') {
      (goal as any).frequency = customGoal.frequency
      ;(goal as any).streak = 0
    }

    saveGoal(goal)
    toast.success(`Goal "${goal.title}" created successfully!`)
    setOpen(false)
    setShowCustomForm(false)
    setCustomGoal({
      title: '',
      description: '',
      target: '',
      unit: '',
      exerciseName: '',
      frequency: 'weekly'
    })
    onGoalCreated?.()
  }

  const resetDialog = () => {
    setSelectedTemplate(null)
    setShowCustomForm(false)
    setCustomGoal({
      title: '',
      description: '',
      target: '',
      unit: '',
      exerciseName: '',
      frequency: 'weekly'
    })
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen)
      if (!newOpen) resetDialog()
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Create New Goal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Goal Type Selection */}
          {!goalType && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Goal Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={selectedType === 'strength' ? 'default' : 'outline'}
                  onClick={() => setSelectedType('strength')}
                  className="h-16 flex-col space-y-1"
                >
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm">Strength</span>
                </Button>
                <Button
                  variant={selectedType === 'habit' ? 'default' : 'outline'}
                  onClick={() => setSelectedType('habit')}
                  className="h-16 flex-col space-y-1"
                >
                  <Calendar className="h-5 w-5" />
                  <span className="text-sm">Habit</span>
                </Button>
              </div>
            </div>
          )}

          {/* Template Selection or Custom Form Toggle */}
          {!showCustomForm ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Choose a template</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomForm(true)}
                  className="text-primary"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Custom
                </Button>
              </div>

              <div className="grid gap-3 max-h-60 overflow-y-auto">
                {templates.map((template, index) => (
                  <Card
                    key={index}
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedTemplate === template
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-lg">{template.icon}</div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{template.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Target: {template.target} {template.unit}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {selectedTemplate && (
                <Button onClick={handleCreateFromTemplate} className="w-full">
                  Create Goal
                </Button>
              )}
            </div>
          ) : (
            /* Custom Goal Form */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Custom Goal</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomForm(false)}
                  className="text-muted-foreground"
                >
                  Back to templates
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-sm">Goal Title *</Label>
                  <Input
                    id="title"
                    value={customGoal.title}
                    onChange={(e) => setCustomGoal(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Bench press 150 lbs"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm">Description</Label>
                  <Textarea
                    id="description"
                    value={customGoal.description}
                    onChange={(e) => setCustomGoal(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="target" className="text-sm">Target *</Label>
                    <Input
                      id="target"
                      type="number"
                      value={customGoal.target}
                      onChange={(e) => setCustomGoal(prev => ({ ...prev, target: e.target.value }))}
                      placeholder="150"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit" className="text-sm">Unit *</Label>
                    <Input
                      id="unit"
                      value={customGoal.unit}
                      onChange={(e) => setCustomGoal(prev => ({ ...prev, unit: e.target.value }))}
                      placeholder="lbs"
                    />
                  </div>
                </div>

                {selectedType === 'strength' && (
                  <div>
                    <Label htmlFor="exercise" className="text-sm">Exercise Name</Label>
                    <Input
                      id="exercise"
                      value={customGoal.exerciseName}
                      onChange={(e) => setCustomGoal(prev => ({ ...prev, exerciseName: e.target.value }))}
                      placeholder="Bench Press"
                    />
                  </div>
                )}

                {selectedType === 'habit' && (
                  <div>
                    <Label htmlFor="frequency" className="text-sm">Frequency</Label>
                    <Select
                      value={customGoal.frequency}
                      onValueChange={(value) => setCustomGoal(prev => ({ ...prev, frequency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button onClick={handleCreateCustom} className="w-full">
                  Create Custom Goal
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
