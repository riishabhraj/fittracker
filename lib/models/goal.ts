import { Schema, model, models } from "mongoose"

const GoalSchema = new Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: ["strength", "habit", "consistency", "bodyweight"],
      required: true,
    },
    target: { type: Number, required: true, min: 0 },
    current: { type: Number, default: 0, min: 0 },
    unit: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    createdDate: { type: String },
    targetDate: { type: String },
    completed: { type: Boolean, default: false },
    completedDate: { type: String },
    // Strength goal fields
    exerciseName: { type: String, trim: true },
    metric: { type: String, enum: ["weight", "reps", "volume"] },
    // Habit goal fields
    frequency: { type: String, enum: ["daily", "weekly", "monthly"] },
    streak: { type: Number, default: 0, min: 0 },
    lastCompletedDate: { type: String },
    // Display fields
    icon: { type: String },
    color: { type: String },
  },
  { timestamps: true }
)

// Indexes for common query patterns
GoalSchema.index({ userId: 1, completed: 1 })

export const Goal = models.Goal || model("Goal", GoalSchema)
