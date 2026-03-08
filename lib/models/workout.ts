import mongoose, { Schema, model, models } from "mongoose"

const SetSchema = new Schema(
  {
    reps: { type: Number, default: 0, min: 0 },
    weight: { type: Number, default: 0, min: 0 },
    completed: { type: Boolean, default: false },
    restTime: { type: Number, min: 0 },
  },
  { _id: false }
)

const ExerciseSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    sets: [SetSchema],
  },
  { _id: false }
)

const WorkoutSchema = new Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    duration: { type: Number, default: 0, min: 0 },
    exercises: [ExerciseSchema],
    totalSets: { type: Number, default: 0, min: 0 },
    totalReps: { type: Number, default: 0, min: 0 },
    totalWeight: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
)

// Indexes for common query patterns
WorkoutSchema.index({ userId: 1, date: -1 })

export const Workout = models.Workout || model("Workout", WorkoutSchema)
