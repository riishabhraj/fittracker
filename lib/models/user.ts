import { Schema, model, models } from "mongoose"

const SubscriptionSchema = new Schema(
  {
    plan: { type: String, enum: ["free", "pro"], default: "free" },
    status: { type: String, enum: ["trialing", "active", "cancelled", "expired"], default: "trialing" },
    trialEndsAt: { type: Date },
    currentPeriodEnd: { type: Date },
    razorpaySubscriptionId: { type: String },
    stripeSubscriptionId: { type: String },
    stripeCustomerId: { type: String },
    provider: { type: String, enum: ["razorpay", "stripe"] },
  },
  { _id: false }
)

const UserSchema = new Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, unique: true, lowercase: true, trim: true },
    emailVerified: { type: Date },
    image: { type: String },
    // null for OAuth-only users; present for email/password users
    password: { type: String, select: false },
    subscription: { type: SubscriptionSchema, default: () => ({}) },
    aiGeneratorUsed: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// Target the same 'users' collection that the MongoDB adapter manages
export const User = models.User || model("User", UserSchema, "users")
