import { Schema, model, models } from "mongoose"

const OtpTokenSchema = new Schema({
  userId:    { type: String, required: true },
  email:     { type: String, required: true, lowercase: true },
  hashedOtp: { type: String, required: true },
  expiresAt: { type: Date,   required: true },
  attempts:  { type: Number, default: 0 },
  createdAt: { type: Date,   default: Date.now },
})

// Auto-delete expired tokens
OtpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
OtpTokenSchema.index({ email: 1 })

export const OtpToken = models.OtpToken || model("OtpToken", OtpTokenSchema)
