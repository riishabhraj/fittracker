import connectDB from "@/lib/mongoose"
import { User } from "@/lib/models/user"

interface ActivateOptions {
  provider: "razorpay" | "stripe"
  subscriptionId: string
  customerId?: string
  currentPeriodEnd?: Date
}

/** Writes Pro status to MongoDB. Call after successful payment verification. */
export async function activateProSubscription(userId: string, opts: ActivateOptions) {
  await connectDB()
  await User.findByIdAndUpdate(userId, {
    "subscription.plan": "pro",
    "subscription.status": "active",
    "subscription.provider": opts.provider,
    ...(opts.provider === "razorpay"
      ? { "subscription.razorpaySubscriptionId": opts.subscriptionId }
      : {
          "subscription.stripeSubscriptionId": opts.subscriptionId,
          ...(opts.customerId ? { "subscription.stripeCustomerId": opts.customerId } : {}),
        }),
    ...(opts.currentPeriodEnd ? { "subscription.currentPeriodEnd": opts.currentPeriodEnd } : {}),
  })
}

/** Looks up a user by Stripe customer ID */
export async function findUserByStripeCustomer(customerId: string) {
  await connectDB()
  return User.findOne({ "subscription.stripeCustomerId": customerId })
}

/** Looks up a user by Stripe subscription ID */
export async function findUserByStripeSubscription(subscriptionId: string) {
  await connectDB()
  return User.findOne({ "subscription.stripeSubscriptionId": subscriptionId })
}
