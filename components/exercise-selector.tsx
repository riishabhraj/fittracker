"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search } from "lucide-react"

export type ExerciseType = "weighted" | "bodyweight" | "bodyweight_optional_weight"
export type EquipmentType = "barbell" | "dumbbell" | "machine" | "cable" | "bodyweight" | "other"

interface Exercise {
  name: string
  category: string
  muscle: string
  type?: ExerciseType // default: "weighted"
  equipment?: EquipmentType
}

const exercises: Exercise[] = [
  // ── Chest ──────────────────────────────────────────────────────────────────
  { name: "Bench Press",                category: "Chest",      muscle: "Pectorals",        equipment: "barbell" },
  { name: "Incline Bench Press",        category: "Chest",      muscle: "Upper Pectorals",  equipment: "barbell" },
  { name: "Decline Bench Press",        category: "Chest",      muscle: "Lower Pectorals",  equipment: "barbell" },
  { name: "Incline Dumbbell Press",     category: "Chest",      muscle: "Upper Pectorals",  equipment: "dumbbell" },
  { name: "Dumbbell Bench Press",       category: "Chest",      muscle: "Pectorals",        equipment: "dumbbell" },
  { name: "Dumbbell Flyes",             category: "Chest",      muscle: "Pectorals",        equipment: "dumbbell" },
  { name: "Incline Dumbbell Flyes",     category: "Chest",      muscle: "Upper Pectorals",  equipment: "dumbbell" },
  { name: "Cable Crossover",            category: "Chest",      muscle: "Pectorals",        equipment: "cable" },
  { name: "Cable Fly - High",           category: "Chest",      muscle: "Lower Pectorals",  equipment: "cable" },
  { name: "Cable Fly - Low",            category: "Chest",      muscle: "Upper Pectorals",  equipment: "cable" },
  { name: "Pec Deck Machine",           category: "Chest",      muscle: "Pectorals",        equipment: "machine" },
  { name: "Dumbbell Pullover",          category: "Chest",      muscle: "Pectorals",        equipment: "dumbbell" },
  { name: "Svend Press",                category: "Chest",      muscle: "Inner Pectorals",  equipment: "dumbbell" },
  { name: "Push-ups",                   category: "Chest",      muscle: "Pectorals",        type: "bodyweight",               equipment: "bodyweight" },
  { name: "Incline Push-ups",           category: "Chest",      muscle: "Upper Pectorals",  type: "bodyweight",               equipment: "bodyweight" },
  { name: "Decline Push-ups",           category: "Chest",      muscle: "Lower Pectorals",  type: "bodyweight",               equipment: "bodyweight" },
  { name: "Diamond Push-ups",           category: "Chest",      muscle: "Inner Pectorals",  type: "bodyweight",               equipment: "bodyweight" },
  { name: "Chest Dips",                 category: "Chest",      muscle: "Lower Pectorals",  type: "bodyweight_optional_weight", equipment: "bodyweight" },

  // ── Back ───────────────────────────────────────────────────────────────────
  { name: "Deadlifts",                  category: "Back",       muscle: "Erector Spinae",   equipment: "barbell" },
  { name: "Romanian Deadlifts",         category: "Back",       muscle: "Hamstrings",       equipment: "barbell" },
  { name: "Sumo Deadlifts",             category: "Back",       muscle: "Glutes",           equipment: "barbell" },
  { name: "Barbell Rows",               category: "Back",       muscle: "Rhomboids",        equipment: "barbell" },
  { name: "Bent Over Rows",             category: "Back",       muscle: "Rhomboids",        equipment: "barbell" },
  { name: "Pendlay Row",                category: "Back",       muscle: "Rhomboids",        equipment: "barbell" },
  { name: "T-Bar Rows",                 category: "Back",       muscle: "Middle Traps",     equipment: "barbell" },
  { name: "Seated Cable Rows",          category: "Back",       muscle: "Rhomboids",        equipment: "cable" },
  { name: "Single-Arm Cable Row",       category: "Back",       muscle: "Latissimus Dorsi", equipment: "cable" },
  { name: "Single-Arm Dumbbell Row",    category: "Back",       muscle: "Latissimus Dorsi", equipment: "dumbbell" },
  { name: "Chest-Supported Row",        category: "Back",       muscle: "Rhomboids",        equipment: "machine" },
  { name: "Lat Pulldown",               category: "Back",       muscle: "Latissimus Dorsi", equipment: "machine" },
  { name: "Close Grip Lat Pulldown",    category: "Back",       muscle: "Latissimus Dorsi", equipment: "machine" },
  { name: "Straight-Arm Pulldown",      category: "Back",       muscle: "Latissimus Dorsi", equipment: "cable" },
  { name: "Cable Pull-Through",         category: "Back",       muscle: "Glutes",           equipment: "cable" },
  { name: "Good Mornings",              category: "Back",       muscle: "Lower Back",       equipment: "barbell" },
  { name: "Hyperextensions",            category: "Back",       muscle: "Lower Back",       type: "bodyweight_optional_weight", equipment: "bodyweight" },
  { name: "Face Pulls",                 category: "Back",       muscle: "Rear Deltoids",    equipment: "cable" },
  { name: "Reverse Flyes",              category: "Back",       muscle: "Rear Deltoids",    equipment: "dumbbell" },
  { name: "Pull-ups",                   category: "Back",       muscle: "Latissimus Dorsi", type: "bodyweight_optional_weight", equipment: "bodyweight" },
  { name: "Chin-ups",                   category: "Back",       muscle: "Latissimus Dorsi", type: "bodyweight_optional_weight", equipment: "bodyweight" },
  { name: "Wide Grip Pull-ups",         category: "Back",       muscle: "Latissimus Dorsi", type: "bodyweight_optional_weight", equipment: "bodyweight" },
  { name: "Neutral Grip Pull-ups",      category: "Back",       muscle: "Latissimus Dorsi", type: "bodyweight_optional_weight", equipment: "bodyweight" },

  // ── Legs ───────────────────────────────────────────────────────────────────
  { name: "Barbell Squats",             category: "Legs",       muscle: "Quadriceps",       equipment: "barbell" },
  { name: "Front Squats",               category: "Legs",       muscle: "Quadriceps",       equipment: "barbell" },
  { name: "Goblet Squats",              category: "Legs",       muscle: "Quadriceps",       equipment: "dumbbell" },
  { name: "Sumo Squats",                category: "Legs",       muscle: "Quadriceps",       equipment: "barbell" },
  { name: "Smith Machine Squat",        category: "Legs",       muscle: "Quadriceps",       equipment: "machine" },
  { name: "Hack Squats",                category: "Legs",       muscle: "Quadriceps",       equipment: "machine" },
  { name: "Bulgarian Split Squats",     category: "Legs",       muscle: "Quadriceps",       equipment: "barbell" },
  { name: "Lunges",                     category: "Legs",       muscle: "Quadriceps",       equipment: "barbell" },
  { name: "Walking Lunges",             category: "Legs",       muscle: "Quadriceps",       equipment: "barbell" },
  { name: "Reverse Lunges",             category: "Legs",       muscle: "Quadriceps",       equipment: "barbell" },
  { name: "Lateral Lunges",             category: "Legs",       muscle: "Adductors",        equipment: "barbell" },
  { name: "Leg Press",                  category: "Legs",       muscle: "Quadriceps",       equipment: "machine" },
  { name: "Leg Extensions",             category: "Legs",       muscle: "Quadriceps",       equipment: "machine" },
  { name: "Leg Curls",                  category: "Legs",       muscle: "Hamstrings",       equipment: "machine" },
  { name: "Stiff Leg Deadlifts",        category: "Legs",       muscle: "Hamstrings",       equipment: "barbell" },
  { name: "Nordic Curls",               category: "Legs",       muscle: "Hamstrings",       type: "bodyweight",               equipment: "bodyweight" },
  { name: "Hip Thrusts",                category: "Legs",       muscle: "Glutes",           equipment: "barbell" },
  { name: "Single Leg Glute Bridge",    category: "Legs",       muscle: "Glutes",           type: "bodyweight",               equipment: "bodyweight" },
  { name: "Cable Glute Kickback",       category: "Legs",       muscle: "Glutes",           equipment: "cable" },
  { name: "Hip Abduction Machine",      category: "Legs",       muscle: "Abductors",        equipment: "machine" },
  { name: "Hip Adduction Machine",      category: "Legs",       muscle: "Adductors",        equipment: "machine" },
  { name: "Calf Raises",                category: "Legs",       muscle: "Calves",           equipment: "barbell" },
  { name: "Seated Calf Raises",         category: "Legs",       muscle: "Calves",           equipment: "machine" },
  { name: "Step-ups",                   category: "Legs",       muscle: "Quadriceps",       equipment: "barbell" },
  { name: "Pistol Squats",              category: "Legs",       muscle: "Quadriceps",       type: "bodyweight",               equipment: "bodyweight" },
  { name: "Wall Sits",                  category: "Legs",       muscle: "Quadriceps",       type: "bodyweight",               equipment: "bodyweight" },

  // ── Shoulders ──────────────────────────────────────────────────────────────
  { name: "Overhead Press",             category: "Shoulders",  muscle: "Deltoids",         equipment: "barbell" },
  { name: "Military Press",             category: "Shoulders",  muscle: "Deltoids",         equipment: "barbell" },
  { name: "Dumbbell Shoulder Press",    category: "Shoulders",  muscle: "Deltoids",         equipment: "dumbbell" },
  { name: "Arnold Press",               category: "Shoulders",  muscle: "Deltoids",         equipment: "dumbbell" },
  { name: "Lateral Raises",             category: "Shoulders",  muscle: "Side Deltoids",    equipment: "dumbbell" },
  { name: "Cable Lateral Raises",       category: "Shoulders",  muscle: "Side Deltoids",    equipment: "cable" },
  { name: "Single Arm Cable Lateral Raise", category: "Shoulders", muscle: "Side Deltoids", equipment: "cable" },
  { name: "Front Raises",               category: "Shoulders",  muscle: "Front Deltoids",   equipment: "dumbbell" },
  { name: "Plate Front Raise",          category: "Shoulders",  muscle: "Front Deltoids",   equipment: "dumbbell" },
  { name: "Rear Delt Flyes",            category: "Shoulders",  muscle: "Rear Deltoids",    equipment: "dumbbell" },
  { name: "Upright Rows",               category: "Shoulders",  muscle: "Deltoids",         equipment: "barbell" },
  { name: "Shrugs",                     category: "Shoulders",  muscle: "Trapezius",        equipment: "barbell" },
  { name: "Pike Push-ups",              category: "Shoulders",  muscle: "Deltoids",         type: "bodyweight",               equipment: "bodyweight" },
  { name: "Handstand Push-ups",         category: "Shoulders",  muscle: "Deltoids",         type: "bodyweight",               equipment: "bodyweight" },

  // ── Arms ───────────────────────────────────────────────────────────────────
  { name: "Bicep Curls",                category: "Arms",       muscle: "Biceps",           equipment: "dumbbell" },
  { name: "Hammer Curls",               category: "Arms",       muscle: "Biceps",           equipment: "dumbbell" },
  { name: "EZ Bar Curl",                category: "Arms",       muscle: "Biceps",           equipment: "barbell" },
  { name: "Preacher Curls",             category: "Arms",       muscle: "Biceps",           equipment: "barbell" },
  { name: "Concentration Curls",        category: "Arms",       muscle: "Biceps",           equipment: "dumbbell" },
  { name: "Incline Dumbbell Curls",     category: "Arms",       muscle: "Biceps",           equipment: "dumbbell" },
  { name: "Spider Curls",               category: "Arms",       muscle: "Biceps",           equipment: "dumbbell" },
  { name: "Cable Curls",                category: "Arms",       muscle: "Biceps",           equipment: "cable" },
  { name: "Reverse Curls",              category: "Arms",       muscle: "Forearms",         equipment: "dumbbell" },
  { name: "Wrist Curls",                category: "Arms",       muscle: "Forearms",         equipment: "dumbbell" },
  { name: "Tricep Dips",                category: "Arms",       muscle: "Triceps",          type: "bodyweight_optional_weight", equipment: "bodyweight" },
  { name: "Close Grip Bench Press",     category: "Arms",       muscle: "Triceps",          equipment: "barbell" },
  { name: "Skull Crushers",             category: "Arms",       muscle: "Triceps",          equipment: "barbell" },
  { name: "Tricep Pushdowns",           category: "Arms",       muscle: "Triceps",          equipment: "cable" },
  { name: "Rope Tricep Pushdown",       category: "Arms",       muscle: "Triceps",          equipment: "cable" },
  { name: "Reverse Grip Tricep Pushdown", category: "Arms",     muscle: "Triceps",          equipment: "cable" },
  { name: "Overhead Tricep Extension",  category: "Arms",       muscle: "Triceps",          equipment: "dumbbell" },
  { name: "Cable Overhead Tricep Extension", category: "Arms",  muscle: "Triceps",          equipment: "cable" },
  { name: "Tricep Kickbacks",           category: "Arms",       muscle: "Triceps",          equipment: "dumbbell" },

  // ── Core ───────────────────────────────────────────────────────────────────
  { name: "Planks",                     category: "Core",       muscle: "Abdominals",       type: "bodyweight",               equipment: "bodyweight" },
  { name: "Side Planks",                category: "Core",       muscle: "Obliques",         type: "bodyweight",               equipment: "bodyweight" },
  { name: "Crunches",                   category: "Core",       muscle: "Abdominals",       type: "bodyweight",               equipment: "bodyweight" },
  { name: "Decline Sit-ups",            category: "Core",       muscle: "Abdominals",       type: "bodyweight",               equipment: "bodyweight" },
  { name: "Bicycle Crunches",           category: "Core",       muscle: "Obliques",         type: "bodyweight",               equipment: "bodyweight" },
  { name: "Russian Twists",             category: "Core",       muscle: "Obliques",         type: "bodyweight_optional_weight", equipment: "dumbbell" },
  { name: "Cable Crunch",               category: "Core",       muscle: "Abdominals",       equipment: "cable" },
  { name: "Weighted Sit-ups",           category: "Core",       muscle: "Abdominals",       equipment: "dumbbell" },
  { name: "Mountain Climbers",          category: "Core",       muscle: "Abdominals",       type: "bodyweight",               equipment: "bodyweight" },
  { name: "Dead Bug",                   category: "Core",       muscle: "Deep Core",        type: "bodyweight",               equipment: "bodyweight" },
  { name: "Bird Dog",                   category: "Core",       muscle: "Deep Core",        type: "bodyweight",               equipment: "bodyweight" },
  { name: "Leg Raises",                 category: "Core",       muscle: "Lower Abs",        type: "bodyweight",               equipment: "bodyweight" },
  { name: "Hanging Knee Raises",        category: "Core",       muscle: "Lower Abs",        type: "bodyweight",               equipment: "bodyweight" },
  { name: "Hanging Leg Raises",         category: "Core",       muscle: "Lower Abs",        type: "bodyweight",               equipment: "bodyweight" },
  { name: "Ab Wheel Rollouts",          category: "Core",       muscle: "Abdominals",       type: "bodyweight",               equipment: "bodyweight" },
  { name: "Hollow Body Hold",           category: "Core",       muscle: "Abdominals",       type: "bodyweight",               equipment: "bodyweight" },
  { name: "V-Ups",                      category: "Core",       muscle: "Abdominals",       type: "bodyweight",               equipment: "bodyweight" },
  { name: "Dragon Flag",                category: "Core",       muscle: "Abdominals",       type: "bodyweight",               equipment: "bodyweight" },
  { name: "Wood Choppers",              category: "Core",       muscle: "Obliques",         equipment: "cable" },
  { name: "Pallof Press",               category: "Core",       muscle: "Core Stability",   equipment: "cable" },

  // ── Cardio ─────────────────────────────────────────────────────────────────
  { name: "Burpees",                    category: "Cardio",     muscle: "Full Body",        type: "bodyweight",               equipment: "bodyweight" },
  { name: "Jumping Jacks",              category: "Cardio",     muscle: "Full Body",        type: "bodyweight",               equipment: "bodyweight" },
  { name: "High Knees",                 category: "Cardio",     muscle: "Legs",             type: "bodyweight",               equipment: "bodyweight" },
  { name: "Butt Kickers",               category: "Cardio",     muscle: "Hamstrings",       type: "bodyweight",               equipment: "bodyweight" },
  { name: "Box Jumps",                  category: "Cardio",     muscle: "Legs",             type: "bodyweight",               equipment: "bodyweight" },
  { name: "Battle Ropes",               category: "Cardio",     muscle: "Full Body",        equipment: "other" },
  { name: "Rowing Machine",             category: "Cardio",     muscle: "Full Body",        equipment: "machine" },
  { name: "Treadmill Running",          category: "Cardio",     muscle: "Legs",             equipment: "machine" },
  { name: "Stationary Bike",            category: "Cardio",     muscle: "Legs",             equipment: "machine" },
  { name: "Elliptical",                 category: "Cardio",     muscle: "Full Body",        equipment: "machine" },

  // ── Full Body ──────────────────────────────────────────────────────────────
  { name: "Thrusters",                  category: "Full Body",  muscle: "Full Body",        equipment: "barbell" },
  { name: "Clean and Press",            category: "Full Body",  muscle: "Full Body",        equipment: "barbell" },
  { name: "Dumbbell Snatch",            category: "Full Body",  muscle: "Full Body",        equipment: "dumbbell" },
  { name: "Man Makers",                 category: "Full Body",  muscle: "Full Body",        equipment: "dumbbell" },
  { name: "Turkish Get-ups",            category: "Full Body",  muscle: "Full Body",        equipment: "dumbbell" },
  { name: "Farmers Walk",               category: "Full Body",  muscle: "Full Body",        equipment: "barbell" },
  { name: "Sled Push",                  category: "Full Body",  muscle: "Full Body",        equipment: "other" },
  { name: "Sled Pull",                  category: "Full Body",  muscle: "Full Body",        equipment: "other" },
  { name: "Kettlebell Swings",          category: "Full Body",  muscle: "Posterior Chain",  equipment: "dumbbell" },
  { name: "Medicine Ball Slams",        category: "Full Body",  muscle: "Full Body",        type: "bodyweight",               equipment: "other" },
]

// Export for type-lookup in other components
export const EXERCISE_TYPE_MAP: Record<string, ExerciseType> = Object.fromEntries(
  exercises.map((e) => [e.name, e.type ?? "weighted"])
)

export const EXERCISE_EQUIPMENT_MAP: Record<string, EquipmentType> = Object.fromEntries(
  exercises.map((e) => [e.name, e.equipment ?? "other"])
)

const categories = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio", "Full Body"]

interface ExerciseSelectorProps {
  onSelect: (exercise: { name: string; category: string; exerciseType: ExerciseType; equipment?: EquipmentType }) => void
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
              onClick={() => onSelect({ name: exercise.name, category: exercise.category, exerciseType: exercise.type ?? "weighted", equipment: exercise.equipment })}
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
