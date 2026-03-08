import { Schema, model, models } from "mongoose"

const UserSchema = new Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, unique: true, lowercase: true, trim: true },
    emailVerified: { type: Date },
    image: { type: String },
    // null for OAuth-only users; present for email/password users
    password: { type: String, select: false },
  },
  { timestamps: true }
)

// Target the same 'users' collection that the MongoDB adapter manages
export const User = models.User || model("User", UserSchema, "users")
