import { Schema, model, models } from "mongoose"

const ProfileSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    goal: {
      type: String,
      enum: ["muscle", "fat_loss", "strength", "fitness"],
    },
    experienceLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
    },
    height: { type: Number, min: 0 },
    weight: { type: Number, min: 0 },
    age: { type: Number, min: 0 },
    workoutDaysPerWeek: { type: Number, min: 1, max: 7 },
    equipment: {
      type: String,
      enum: ["gym", "home_gym", "dumbbells"],
    },
    onboardingCompleted: { type: Boolean, default: false },
    subjectiveEnergy: { type: Number, min: 1, max: 10 },
    weightHistory: [
      {
        date: { type: Date, required: true },
        weight: { type: Number, required: true },
        bodyFat: { type: Number },
        _id: false,
      },
    ],
  },
  { timestamps: true }
)

export const Profile = models.Profile || model("Profile", ProfileSchema, "profiles")
