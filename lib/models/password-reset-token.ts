import mongoose, { Schema, model, models } from "mongoose"

const PasswordResetTokenSchema = new Schema({
  userId:    { type: String, required: true },
  token:     { type: String, required: true, unique: true },
  expiresAt: { type: Date,   required: true },
  used:      { type: Boolean, default: false },
})

// Auto-delete expired tokens
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const PasswordResetToken =
  models.PasswordResetToken || model("PasswordResetToken", PasswordResetTokenSchema)
