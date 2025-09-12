import type React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dumbbell, Heart, Zap, Target } from "lucide-react"
import Link from "next/link"

interface WorkoutTemplate {
  id: string
  name: string
  duration: string
  exercises: number
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  icon: React.ElementType
  color: string
  exerciseList: Array<{
    name: string
    category: string
    sets: number
    reps: string
    weight?: number
  }>
}

const templates: WorkoutTemplate[] = [
  {
    id: "1",
    name: "Upper Body Strength",
    duration: "45 min",
    exercises: 8,
    difficulty: "Intermediate",
    icon: Dumbbell,
    color: "bg-blue-500/10 text-blue-500",
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
    icon: Target,
    color: "bg-orange-500/10 text-orange-500",
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
    icon: Heart,
    color: "bg-teal-500/10 text-teal-500",
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
    icon: Zap,
    color: "bg-yellow-500/10 text-yellow-500",
    exerciseList: [
      { name: "Jumping Jacks", category: "Cardio", sets: 2, reps: "30 sec" },
      { name: "Bodyweight Squats", category: "Legs", sets: 2, reps: "10-15" },
      { name: "Push-ups", category: "Chest", sets: 2, reps: "5-10" },
      { name: "Mountain Climbers", category: "Core", sets: 2, reps: "20 sec" }
    ]
  }
]

// Export templates for use in other components
export { templates }
export type { WorkoutTemplate }

interface WorkoutTemplatesProps {
  showAll?: boolean
}

export function WorkoutTemplates({ showAll = false }: WorkoutTemplatesProps) {
  // Show only first 4 templates on home page, all on templates page
  const displayTemplates = showAll ? templates : templates.slice(0, 4)

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Quick Start</h2>
        {!showAll && (
          <Link href="/templates">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
              View All
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayTemplates.map((template) => (
          <div
            key={template.id}
            className="p-4 bg-muted/10 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${template.color}`}>
                <template.icon className="h-4 w-4" />
              </div>
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">{template.difficulty}</span>
            </div>

            <h3 className="font-medium text-foreground mb-1">{template.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {template.duration} • {template.exercises} exercises
            </p>

            <Link href={`/log-workout?template=${template.id}`} className="block">
              <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                Start Workout
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </Card>
  )
}
