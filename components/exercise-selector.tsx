"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search } from "lucide-react"

export type ExerciseType = "weighted" | "bodyweight" | "bodyweight_optional_weight"

interface Exercise {
  name: string
  category: string
  muscle: string
  type?: ExerciseType // default: "weighted"
}

const exercises: Exercise[] = [
  // ── Chest ──────────────────────────────────────────────────────────────────
  { name: "Bench Press",                category: "Chest",      muscle: "Pectorals" },
  { name: "Incline Bench Press",        category: "Chest",      muscle: "Upper Pectorals" },
  { name: "Decline Bench Press",        category: "Chest",      muscle: "Lower Pectorals" },
  { name: "Incline Dumbbell Press",     category: "Chest",      muscle: "Upper Pectorals" },
  { name: "Dumbbell Bench Press",       category: "Chest",      muscle: "Pectorals" },
  { name: "Dumbbell Flyes",             category: "Chest",      muscle: "Pectorals" },
  { name: "Incline Dumbbell Flyes",     category: "Chest",      muscle: "Upper Pectorals" },
  { name: "Cable Crossover",            category: "Chest",      muscle: "Pectorals" },
  { name: "Cable Fly - High",           category: "Chest",      muscle: "Lower Pectorals" },
  { name: "Cable Fly - Low",            category: "Chest",      muscle: "Upper Pectorals" },
  { name: "Pec Deck Machine",           category: "Chest",      muscle: "Pectorals" },
  { name: "Dumbbell Pullover",          category: "Chest",      muscle: "Pectorals" },
  { name: "Svend Press",                category: "Chest",      muscle: "Inner Pectorals" },
  { name: "Push-ups",                   category: "Chest",      muscle: "Pectorals",       type: "bodyweight" },
  { name: "Incline Push-ups",           category: "Chest",      muscle: "Upper Pectorals", type: "bodyweight" },
  { name: "Decline Push-ups",           category: "Chest",      muscle: "Lower Pectorals", type: "bodyweight" },
  { name: "Diamond Push-ups",           category: "Chest",      muscle: "Inner Pectorals", type: "bodyweight" },
  { name: "Chest Dips",                 category: "Chest",      muscle: "Lower Pectorals", type: "bodyweight_optional_weight" },

  // ── Back ───────────────────────────────────────────────────────────────────
  { name: "Deadlifts",                  category: "Back",       muscle: "Erector Spinae" },
  { name: "Romanian Deadlifts",         category: "Back",       muscle: "Hamstrings" },
  { name: "Sumo Deadlifts",             category: "Back",       muscle: "Glutes" },
  { name: "Barbell Rows",               category: "Back",       muscle: "Rhomboids" },
  { name: "Bent Over Rows",             category: "Back",       muscle: "Rhomboids" },
  { name: "Pendlay Row",                category: "Back",       muscle: "Rhomboids" },
  { name: "T-Bar Rows",                 category: "Back",       muscle: "Middle Traps" },
  { name: "Seated Cable Rows",          category: "Back",       muscle: "Rhomboids" },
  { name: "Single-Arm Cable Row",       category: "Back",       muscle: "Latissimus Dorsi" },
  { name: "Single-Arm Dumbbell Row",    category: "Back",       muscle: "Latissimus Dorsi" },
  { name: "Chest-Supported Row",        category: "Back",       muscle: "Rhomboids" },
  { name: "Lat Pulldown",               category: "Back",       muscle: "Latissimus Dorsi" },
  { name: "Close Grip Lat Pulldown",    category: "Back",       muscle: "Latissimus Dorsi" },
  { name: "Straight-Arm Pulldown",      category: "Back",       muscle: "Latissimus Dorsi" },
  { name: "Cable Pull-Through",         category: "Back",       muscle: "Glutes" },
  { name: "Good Mornings",              category: "Back",       muscle: "Lower Back" },
  { name: "Hyperextensions",            category: "Back",       muscle: "Lower Back",      type: "bodyweight_optional_weight" },
  { name: "Face Pulls",                 category: "Back",       muscle: "Rear Deltoids" },
  { name: "Reverse Flyes",              category: "Back",       muscle: "Rear Deltoids" },
  { name: "Pull-ups",                   category: "Back",       muscle: "Latissimus Dorsi", type: "bodyweight_optional_weight" },
  { name: "Chin-ups",                   category: "Back",       muscle: "Latissimus Dorsi", type: "bodyweight_optional_weight" },
  { name: "Wide Grip Pull-ups",         category: "Back",       muscle: "Latissimus Dorsi", type: "bodyweight_optional_weight" },
  { name: "Neutral Grip Pull-ups",      category: "Back",       muscle: "Latissimus Dorsi", type: "bodyweight_optional_weight" },

  // ── Legs ───────────────────────────────────────────────────────────────────
  { name: "Barbell Squats",             category: "Legs",       muscle: "Quadriceps" },
  { name: "Front Squats",               category: "Legs",       muscle: "Quadriceps" },
  { name: "Goblet Squats",              category: "Legs",       muscle: "Quadriceps" },
  { name: "Sumo Squats",                category: "Legs",       muscle: "Quadriceps" },
  { name: "Smith Machine Squat",        category: "Legs",       muscle: "Quadriceps" },
  { name: "Hack Squats",                category: "Legs",       muscle: "Quadriceps" },
  { name: "Bulgarian Split Squats",     category: "Legs",       muscle: "Quadriceps" },
  { name: "Lunges",                     category: "Legs",       muscle: "Quadriceps" },
  { name: "Walking Lunges",             category: "Legs",       muscle: "Quadriceps" },
  { name: "Reverse Lunges",             category: "Legs",       muscle: "Quadriceps" },
  { name: "Lateral Lunges",             category: "Legs",       muscle: "Adductors" },
  { name: "Leg Press",                  category: "Legs",       muscle: "Quadriceps" },
  { name: "Leg Extensions",             category: "Legs",       muscle: "Quadriceps" },
  { name: "Leg Curls",                  category: "Legs",       muscle: "Hamstrings" },
  { name: "Stiff Leg Deadlifts",        category: "Legs",       muscle: "Hamstrings" },
  { name: "Nordic Curls",               category: "Legs",       muscle: "Hamstrings",      type: "bodyweight" },
  { name: "Hip Thrusts",                category: "Legs",       muscle: "Glutes" },
  { name: "Single Leg Glute Bridge",    category: "Legs",       muscle: "Glutes",          type: "bodyweight" },
  { name: "Cable Glute Kickback",       category: "Legs",       muscle: "Glutes" },
  { name: "Hip Abduction Machine",      category: "Legs",       muscle: "Abductors" },
  { name: "Hip Adduction Machine",      category: "Legs",       muscle: "Adductors" },
  { name: "Calf Raises",                category: "Legs",       muscle: "Calves" },
  { name: "Seated Calf Raises",         category: "Legs",       muscle: "Calves" },
  { name: "Step-ups",                   category: "Legs",       muscle: "Quadriceps" },
  { name: "Pistol Squats",              category: "Legs",       muscle: "Quadriceps",      type: "bodyweight" },
  { name: "Wall Sits",                  category: "Legs",       muscle: "Quadriceps",      type: "bodyweight" },

  // ── Shoulders ──────────────────────────────────────────────────────────────
  { name: "Overhead Press",             category: "Shoulders",  muscle: "Deltoids" },
  { name: "Military Press",             category: "Shoulders",  muscle: "Deltoids" },
  { name: "Dumbbell Shoulder Press",    category: "Shoulders",  muscle: "Deltoids" },
  { name: "Arnold Press",               category: "Shoulders",  muscle: "Deltoids" },
  { name: "Lateral Raises",             category: "Shoulders",  muscle: "Side Deltoids" },
  { name: "Cable Lateral Raises",       category: "Shoulders",  muscle: "Side Deltoids" },
  { name: "Single Arm Cable Lateral Raise", category: "Shoulders", muscle: "Side Deltoids" },
  { name: "Front Raises",               category: "Shoulders",  muscle: "Front Deltoids" },
  { name: "Plate Front Raise",          category: "Shoulders",  muscle: "Front Deltoids" },
  { name: "Rear Delt Flyes",            category: "Shoulders",  muscle: "Rear Deltoids" },
  { name: "Upright Rows",               category: "Shoulders",  muscle: "Deltoids" },
  { name: "Shrugs",                     category: "Shoulders",  muscle: "Trapezius" },
  { name: "Pike Push-ups",              category: "Shoulders",  muscle: "Deltoids",        type: "bodyweight" },
  { name: "Handstand Push-ups",         category: "Shoulders",  muscle: "Deltoids",        type: "bodyweight" },

  // ── Arms ───────────────────────────────────────────────────────────────────
  { name: "Bicep Curls",                category: "Arms",       muscle: "Biceps" },
  { name: "Hammer Curls",               category: "Arms",       muscle: "Biceps" },
  { name: "EZ Bar Curl",                category: "Arms",       muscle: "Biceps" },
  { name: "Preacher Curls",             category: "Arms",       muscle: "Biceps" },
  { name: "Concentration Curls",        category: "Arms",       muscle: "Biceps" },
  { name: "Incline Dumbbell Curls",     category: "Arms",       muscle: "Biceps" },
  { name: "Spider Curls",               category: "Arms",       muscle: "Biceps" },
  { name: "Cable Curls",                category: "Arms",       muscle: "Biceps" },
  { name: "Reverse Curls",              category: "Arms",       muscle: "Forearms" },
  { name: "Wrist Curls",                category: "Arms",       muscle: "Forearms" },
  { name: "Tricep Dips",                category: "Arms",       muscle: "Triceps",         type: "bodyweight_optional_weight" },
  { name: "Close Grip Bench Press",     category: "Arms",       muscle: "Triceps" },
  { name: "Skull Crushers",             category: "Arms",       muscle: "Triceps" },
  { name: "Tricep Pushdowns",           category: "Arms",       muscle: "Triceps" },
  { name: "Rope Tricep Pushdown",       category: "Arms",       muscle: "Triceps" },
  { name: "Reverse Grip Tricep Pushdown", category: "Arms",     muscle: "Triceps" },
  { name: "Overhead Tricep Extension",  category: "Arms",       muscle: "Triceps" },
  { name: "Cable Overhead Tricep Extension", category: "Arms",  muscle: "Triceps" },
  { name: "Tricep Kickbacks",           category: "Arms",       muscle: "Triceps" },
  { name: "Diamond Push-ups",           category: "Arms",       muscle: "Triceps",         type: "bodyweight" },

  // ── Core ───────────────────────────────────────────────────────────────────
  { name: "Planks",                     category: "Core",       muscle: "Abdominals",      type: "bodyweight" },
  { name: "Side Planks",                category: "Core",       muscle: "Obliques",        type: "bodyweight" },
  { name: "Crunches",                   category: "Core",       muscle: "Abdominals",      type: "bodyweight" },
  { name: "Decline Sit-ups",            category: "Core",       muscle: "Abdominals",      type: "bodyweight" },
  { name: "Bicycle Crunches",           category: "Core",       muscle: "Obliques",        type: "bodyweight" },
  { name: "Russian Twists",             category: "Core",       muscle: "Obliques",        type: "bodyweight_optional_weight" },
  { name: "Cable Crunch",               category: "Core",       muscle: "Abdominals" },
  { name: "Weighted Sit-ups",           category: "Core",       muscle: "Abdominals" },
  { name: "Mountain Climbers",          category: "Core",       muscle: "Abdominals",      type: "bodyweight" },
  { name: "Dead Bug",                   category: "Core",       muscle: "Deep Core",       type: "bodyweight" },
  { name: "Bird Dog",                   category: "Core",       muscle: "Deep Core",       type: "bodyweight" },
  { name: "Leg Raises",                 category: "Core",       muscle: "Lower Abs",       type: "bodyweight" },
  { name: "Hanging Knee Raises",        category: "Core",       muscle: "Lower Abs",       type: "bodyweight" },
  { name: "Hanging Leg Raises",         category: "Core",       muscle: "Lower Abs",       type: "bodyweight" },
  { name: "Ab Wheel Rollouts",          category: "Core",       muscle: "Abdominals",      type: "bodyweight" },
  { name: "Hollow Body Hold",           category: "Core",       muscle: "Abdominals",      type: "bodyweight" },
  { name: "V-Ups",                      category: "Core",       muscle: "Abdominals",      type: "bodyweight" },
  { name: "Dragon Flag",                category: "Core",       muscle: "Abdominals",      type: "bodyweight" },
  { name: "Wood Choppers",              category: "Core",       muscle: "Obliques" },
  { name: "Pallof Press",               category: "Core",       muscle: "Core Stability" },

  // ── Cardio ─────────────────────────────────────────────────────────────────
  { name: "Burpees",                    category: "Cardio",     muscle: "Full Body",       type: "bodyweight" },
  { name: "Jumping Jacks",              category: "Cardio",     muscle: "Full Body",       type: "bodyweight" },
  { name: "High Knees",                 category: "Cardio",     muscle: "Legs",            type: "bodyweight" },
  { name: "Butt Kickers",               category: "Cardio",     muscle: "Hamstrings",      type: "bodyweight" },
  { name: "Jump Squats",                category: "Cardio",     muscle: "Legs",            type: "bodyweight" },
  { name: "Box Jumps",                  category: "Cardio",     muscle: "Legs",            type: "bodyweight" },
  { name: "Battle Ropes",               category: "Cardio",     muscle: "Full Body" },
  { name: "Rowing Machine",             category: "Cardio",     muscle: "Full Body" },
  { name: "Treadmill Running",          category: "Cardio",     muscle: "Legs" },
  { name: "Stationary Bike",            category: "Cardio",     muscle: "Legs" },
  { name: "Elliptical",                 category: "Cardio",     muscle: "Full Body" },

  // ── Full Body ──────────────────────────────────────────────────────────────
  { name: "Thrusters",                  category: "Full Body",  muscle: "Full Body" },
  { name: "Clean and Press",            category: "Full Body",  muscle: "Full Body" },
  { name: "Dumbbell Snatch",            category: "Full Body",  muscle: "Full Body" },
  { name: "Man Makers",                 category: "Full Body",  muscle: "Full Body" },
  { name: "Turkish Get-ups",            category: "Full Body",  muscle: "Full Body" },
  { name: "Farmers Walk",               category: "Full Body",  muscle: "Full Body" },
  { name: "Sled Push",                  category: "Full Body",  muscle: "Full Body" },
  { name: "Sled Pull",                  category: "Full Body",  muscle: "Full Body" },
  { name: "Kettlebell Swings",          category: "Full Body",  muscle: "Posterior Chain" },
  { name: "Medicine Ball Slams",        category: "Full Body",  muscle: "Full Body",       type: "bodyweight" },
]

// Export for type-lookup in other components
export const EXERCISE_TYPE_MAP: Record<string, ExerciseType> = Object.fromEntries(
  exercises.map((e) => [e.name, e.type ?? "weighted"])
)

const categories = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio", "Full Body"]

interface ExerciseSelectorProps {
  onSelect: (exercise: { name: string; category: string; exerciseType: ExerciseType }) => void
  onClose: () => void
}

export function ExerciseSelector({ onSelect, onClose }: ExerciseSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch =
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.muscle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || exercise.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 pt-8 pb-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="p-2" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Add Exercise</h1>
              <p className="text-sm text-muted-foreground">Choose from {exercises.length} exercises</p>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="container mx-auto px-4 py-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Exercise List */}
      <div className="container mx-auto px-4 pb-6">
        <div className="space-y-2">
          {filteredExercises.map((exercise, index) => (
            <Card
              key={index}
              className="p-4 bg-card border-border hover:bg-muted/10 cursor-pointer transition-colors"
              onClick={() => onSelect({ name: exercise.name, category: exercise.category, exerciseType: exercise.type ?? "weighted" })}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">{exercise.name}</h3>
                  <p className="text-sm text-muted-foreground">{exercise.muscle}</p>
                </div>
                <div className="flex items-center gap-2">
                  {exercise.type === "bodyweight" && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">BW</span>
                  )}
                  {exercise.type === "bodyweight_optional_weight" && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">BW+</span>
                  )}
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {exercise.category}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No exercises found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>
    </div>
  )
}
