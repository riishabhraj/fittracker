"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Dumbbell, Heart, Zap, Target, Clock, Users, TrendingUp, Eye, Play, Trash2, BookmarkCheck } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { BackButton } from "@/components/back-button"
import Link from "next/link"
import { toast } from "sonner"

interface WorkoutTemplate {
  id: string
  name: string
  duration: string
  exercises: number
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  icon: React.ElementType
  color: string
  description: string
  category: string
  exerciseList: Array<{
    name: string
    category: string
    sets: number
    reps: string
    weight?: number
  }>
}

interface UserTemplate {
  _id: string
  name: string
  exercises: Array<{
    id: string
    name: string
    category: string
    sets: Array<{ reps: number; weight: number }>
  }>
  createdAt: string
}

const allTemplates: WorkoutTemplate[] = [
  {
    id: "1",
    name: "Upper Body Strength",
    duration: "45 min",
    exercises: 8,
    difficulty: "Intermediate",
    icon: Dumbbell,
    color: "bg-blue-500/10 text-blue-500",
    description: "Build upper body muscle with compound movements",
    category: "Strength",
    exerciseList: [
      { name: "Bench Press", category: "Chest", sets: 4, reps: "8-10" },
      { name: "Incline Dumbbell Press", category: "Chest", sets: 3, reps: "10-12" },
      { name: "Pull-ups", category: "Back", sets: 4, reps: "6-8" },
      { name: "Barbell Rows", category: "Back", sets: 3, reps: "8-10" },
      { name: "Overhead Press", category: "Shoulders", sets: 3, reps: "8-10" },
      { name: "Lateral Raises", category: "Shoulders", sets: 3, reps: "12-15" },
      { name: "Bicep Curls", category: "Arms", sets: 3, reps: "10-12" },
      { name: "Tricep Dips", category: "Arms", sets: 3, reps: "8-12" }
    ]
  },
  {
    id: "2",
    name: "HIIT Cardio",
    duration: "30 min",
    exercises: 6,
    difficulty: "Advanced",
    icon: Zap,
    color: "bg-red-500/10 text-red-500",
    description: "High intensity interval training for fat loss",
    category: "Cardio",
    exerciseList: [
      { name: "Burpees", category: "Cardio", sets: 4, reps: "30 sec" },
      { name: "Jump Squats", category: "Cardio", sets: 4, reps: "20 reps" },
      { name: "Mountain Climbers", category: "Core", sets: 4, reps: "30 sec" },
      { name: "High Knees", category: "Cardio", sets: 4, reps: "30 sec" },
      { name: "Jumping Jacks", category: "Cardio", sets: 4, reps: "30 sec" },
      { name: "Box Jumps", category: "Cardio", sets: 3, reps: "10-12" }
    ]
  },
  {
    id: "3",
    name: "Lower Body Power",
    duration: "50 min",
    exercises: 10,
    difficulty: "Intermediate",
    icon: Target,
    color: "bg-green-500/10 text-green-500",
    description: "Explosive movements for leg strength and power",
    category: "Strength",
    exerciseList: [
      { name: "Squats", category: "Legs", sets: 4, reps: "8-10" },
      { name: "Deadlifts", category: "Back", sets: 4, reps: "6-8" },
      { name: "Bulgarian Split Squats", category: "Legs", sets: 3, reps: "10-12" },
      { name: "Romanian Deadlifts", category: "Back", sets: 3, reps: "10-12" },
      { name: "Walking Lunges", category: "Legs", sets: 3, reps: "12-15" },
      { name: "Leg Press", category: "Legs", sets: 3, reps: "12-15" },
      { name: "Leg Curls", category: "Legs", sets: 3, reps: "12-15" },
      { name: "Calf Raises", category: "Legs", sets: 4, reps: "15-20" },
      { name: "Hip Thrusts", category: "Legs", sets: 3, reps: "12-15" },
      { name: "Jump Squats", category: "Cardio", sets: 3, reps: "10-12" }
    ]
  },
  {
    id: "4",
    name: "Core & Flexibility",
    duration: "25 min",
    exercises: 5,
    difficulty: "Beginner",
    icon: Heart,
    color: "bg-purple-500/10 text-purple-500",
    description: "Strengthen your core and improve mobility",
    category: "Flexibility",
    exerciseList: [
      { name: "Planks", category: "Core", sets: 3, reps: "30-60 sec" },
      { name: "Side Planks", category: "Core", sets: 3, reps: "20-30 sec" },
      { name: "Bicycle Crunches", category: "Core", sets: 3, reps: "15-20" },
      { name: "Russian Twists", category: "Core", sets: 3, reps: "20-30" },
      { name: "Dead Bug", category: "Core", sets: 3, reps: "10-12" }
    ]
  },
  {
    id: "5",
    name: "Full Body Circuit",
    duration: "40 min",
    exercises: 12,
    difficulty: "Intermediate",
    icon: Users,
    color: "bg-orange-500/10 text-orange-500",
    description: "Complete workout targeting all muscle groups",
    category: "Circuit",
    exerciseList: [
      { name: "Push-ups", category: "Chest", sets: 3, reps: "10-15" },
      { name: "Squats", category: "Legs", sets: 3, reps: "15-20" },
      { name: "Pull-ups", category: "Back", sets: 3, reps: "5-10" },
      { name: "Lunges", category: "Legs", sets: 3, reps: "12-15" },
      { name: "Dips", category: "Arms", sets: 3, reps: "8-12" },
      { name: "Planks", category: "Core", sets: 3, reps: "30-45 sec" },
      { name: "Burpees", category: "Cardio", sets: 3, reps: "8-10" },
      { name: "Mountain Climbers", category: "Core", sets: 3, reps: "20-30" },
      { name: "Jump Squats", category: "Cardio", sets: 3, reps: "10-15" },
      { name: "Pike Push-ups", category: "Shoulders", sets: 3, reps: "8-12" },
      { name: "Russian Twists", category: "Core", sets: 3, reps: "20-30" },
      { name: "Jumping Jacks", category: "Cardio", sets: 3, reps: "30 sec" }
    ]
  },
  {
    id: "6",
    name: "Beginner Basics",
    duration: "35 min",
    exercises: 6,
    difficulty: "Beginner",
    icon: TrendingUp,
    color: "bg-teal-500/10 text-teal-500",
    description: "Perfect starting point for fitness beginners",
    category: "Beginner",
    exerciseList: [
      { name: "Bodyweight Squats", category: "Legs", sets: 3, reps: "10-15" },
      { name: "Modified Push-ups", category: "Chest", sets: 3, reps: "5-10" },
      { name: "Assisted Lunges", category: "Legs", sets: 3, reps: "8-12" },
      { name: "Wall Sits", category: "Legs", sets: 3, reps: "20-30 sec" },
      { name: "Knee Planks", category: "Core", sets: 3, reps: "15-30 sec" },
      { name: "Marching in Place", category: "Cardio", sets: 3, reps: "30 sec" }
    ]
  },
  {
    id: "7",
    name: "Push Day",
    duration: "55 min",
    exercises: 9,
    difficulty: "Advanced",
    icon: Dumbbell,
    color: "bg-indigo-500/10 text-indigo-500",
    description: "Chest, shoulders and triceps — the classic push session",
    category: "PPL",
    exerciseList: [
      { name: "Barbell Bench Press", category: "Chest", sets: 4, reps: "6-8" },
      { name: "Incline Dumbbell Press", category: "Chest", sets: 4, reps: "8-10" },
      { name: "Overhead Press", category: "Shoulders", sets: 4, reps: "6-8" },
      { name: "Dumbbell Flyes", category: "Chest", sets: 3, reps: "10-12" },
      { name: "Lateral Raises", category: "Shoulders", sets: 3, reps: "12-15" },
      { name: "Close-Grip Bench Press", category: "Arms", sets: 3, reps: "8-10" },
      { name: "Overhead Tricep Extension", category: "Arms", sets: 3, reps: "10-12" },
      { name: "Front Raises", category: "Shoulders", sets: 3, reps: "10-12" },
      { name: "Diamond Push-ups", category: "Arms", sets: 3, reps: "8-12" }
    ]
  },
  {
    id: "8",
    name: "Quick Morning Boost",
    duration: "15 min",
    exercises: 4,
    difficulty: "Beginner",
    icon: Clock,
    color: "bg-yellow-500/10 text-yellow-500",
    description: "Energizing workout to start your day",
    category: "Quick",
    exerciseList: [
      { name: "Jumping Jacks", category: "Cardio", sets: 2, reps: "30 sec" },
      { name: "Bodyweight Squats", category: "Legs", sets: 2, reps: "10-15" },
      { name: "Push-ups", category: "Chest", sets: 2, reps: "5-10" },
      { name: "Mountain Climbers", category: "Core", sets: 2, reps: "20 sec" }
    ]
  },
  {
    id: "9",
    name: "Pull Day",
    duration: "50 min",
    exercises: 8,
    difficulty: "Intermediate",
    icon: Dumbbell,
    color: "bg-cyan-500/10 text-cyan-500",
    description: "Back and biceps — build a thick, wide back",
    category: "PPL",
    exerciseList: [
      { name: "Barbell Rows", category: "Back", sets: 4, reps: "6-8" },
      { name: "Pull-ups", category: "Back", sets: 4, reps: "6-8" },
      { name: "Seated Cable Rows", category: "Back", sets: 3, reps: "10-12" },
      { name: "Face Pulls", category: "Shoulders", sets: 3, reps: "12-15" },
      { name: "Single-Arm Dumbbell Rows", category: "Back", sets: 3, reps: "10-12" },
      { name: "Barbell Curls", category: "Arms", sets: 3, reps: "8-10" },
      { name: "Hammer Curls", category: "Arms", sets: 3, reps: "10-12" },
      { name: "Incline Dumbbell Curls", category: "Arms", sets: 3, reps: "12-15" }
    ]
  },
  {
    id: "10",
    name: "Legs Day",
    duration: "55 min",
    exercises: 9,
    difficulty: "Intermediate",
    icon: Target,
    color: "bg-lime-500/10 text-lime-500",
    description: "Quads, hamstrings and glutes — complete leg development",
    category: "PPL",
    exerciseList: [
      { name: "Barbell Squats", category: "Legs", sets: 4, reps: "6-8" },
      { name: "Romanian Deadlifts", category: "Legs", sets: 4, reps: "8-10" },
      { name: "Leg Press", category: "Legs", sets: 3, reps: "10-12" },
      { name: "Hack Squats", category: "Legs", sets: 3, reps: "10-12" },
      { name: "Walking Lunges", category: "Legs", sets: 3, reps: "12-15" },
      { name: "Leg Curls", category: "Legs", sets: 3, reps: "12-15" },
      { name: "Leg Extensions", category: "Legs", sets: 3, reps: "12-15" },
      { name: "Calf Raises", category: "Legs", sets: 4, reps: "15-20" },
      { name: "Hip Thrusts", category: "Legs", sets: 3, reps: "10-12" }
    ]
  }
]

const categories = ["All", "PPL", "Strength", "Cardio", "Flexibility", "Circuit", "Beginner", "Quick"]

function PreviewExercisesDialog({ template }: { template: WorkoutTemplate }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          Preview Exercises
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${template.color}`}>
              <template.icon className="h-5 w-5" />
            </div>
            {template.name}
          </DialogTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {template.duration}
            </span>
            <span>{template.exercises} exercises</span>
            <Badge variant="secondary" className="text-xs">
              {template.difficulty}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">{template.description}</p>

          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Exercise List:</h4>
            <div className="space-y-2">
              {template.exerciseList.map((exercise, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/10 rounded-lg border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{exercise.name}</p>
                      <p className="text-xs text-muted-foreground">{exercise.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {exercise.sets} × {exercise.reps}
                    </p>
                    {exercise.weight && (
                      <p className="text-xs text-muted-foreground">{exercise.weight} lbs</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Link href={`/log-workout?template=${template.id}`} className="flex-1">
              <Button className="w-full bg-primary hover:bg-primary/90">
                <Play className="h-4 w-4 mr-2" />
                Start This Workout
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SystemTemplates() {
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredTemplates = selectedCategory === "All"
    ? allTemplates
    : allTemplates.filter((t) => t.category === selectedCategory)

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={category === selectedCategory ? "default" : "outline"}
            size="sm"
            className="h-8"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""}
        {selectedCategory !== "All" && ` in ${selectedCategory}`}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="p-6 bg-card border-border hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${template.color}`}>
                <template.icon className="h-6 w-6" />
              </div>
              <Badge
                variant="secondary"
                className={`${
                  template.difficulty === "Beginner"
                    ? "bg-green-500/10 text-green-500"
                    : template.difficulty === "Intermediate"
                    ? "bg-yellow-500/10 text-yellow-500"
                    : "bg-red-500/10 text-red-500"
                }`}
              >
                {template.difficulty}
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{template.name}</h3>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {template.duration}
                </span>
                <span>{template.exercises} exercises</span>
              </div>

              <Badge variant="outline" className="w-fit">
                {template.category}
              </Badge>
            </div>

            <div className="mt-6 space-y-2">
              <Link href={`/log-workout?template=${template.id}`} className="block">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  <Play className="h-4 w-4 mr-2" />
                  Start Workout
                </Button>
              </Link>
              <PreviewExercisesDialog template={template} />
            </div>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No templates found in this category.</p>
          <Button variant="outline" onClick={() => setSelectedCategory("All")} className="mt-4">
            Show All Templates
          </Button>
        </div>
      )}
    </div>
  )
}

function MyTemplates() {
  const [templates, setTemplates] = useState<UserTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setTemplates(data))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false))
  }, [])

  async function deleteTemplate(id: string) {
    setDeleting(id)
    try {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setTemplates((prev) => prev.filter((t) => t._id !== id))
      toast.success("Template deleted")
    } catch {
      toast.error("Failed to delete template")
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-2xl bg-card border border-border animate-pulse" />
        ))}
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <BookmarkCheck className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No saved templates yet</h3>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          Save any workout as a template from your workout history to reuse it quickly.
        </p>
        <Link href="/workouts" className="mt-4 inline-block">
          <Button variant="outline" className="mt-4">View Workout History</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <Card key={template._id} className="p-6 bg-card border-border hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Dumbbell className="h-6 w-6 text-primary" />
            </div>
            <button
              type="button"
              disabled={deleting === template._id}
              onClick={() => deleteTemplate(template._id)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2 mb-6">
            <h3 className="text-lg font-semibold text-foreground">{template.name}</h3>
            <p className="text-sm text-muted-foreground">{template.exercises.length} exercises</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {[...new Set(template.exercises.map((e) => e.category))].slice(0, 3).map((cat) => (
                <Badge key={cat} variant="outline" className="text-xs">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          <Link href={`/log-workout?template=${template._id}`} className="block">
            <Button className="w-full bg-primary hover:bg-primary/90">
              <Play className="h-4 w-4 mr-2" />
              Start Workout
            </Button>
          </Link>
        </Card>
      ))}
    </div>
  )
}

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState<"system" | "mine">("system")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 pt-12 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BackButton />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Workout Templates</h1>
                <p className="text-sm text-muted-foreground">Start a workout in seconds</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-5 bg-card border border-border rounded-xl p-1">
            <button
              type="button"
              onClick={() => setActiveTab("system")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "system"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              System Templates
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("mine")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "mine"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              My Templates
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {activeTab === "system" ? <SystemTemplates /> : <MyTemplates />}
      </main>
    </div>
  )
}
