import { Schema, model, models } from "mongoose"

const SetSchema = new Schema(
  {
    reps: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
  },
  { _id: false }
)

const ExerciseSchema = new Schema(
  {
    id: { type: String },
    name: { type: String, required: true },
    category: { type: String, default: "" },
    sets: { type: [SetSchema], default: [] },
  },
  { _id: false }
)

const TemplateSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    exercises: { type: [ExerciseSchema], default: [] },
  },
  { timestamps: true }
)

TemplateSchema.index({ userId: 1, createdAt: -1 })

export const Template = models.Template || model("Template", TemplateSchema, "templates")
