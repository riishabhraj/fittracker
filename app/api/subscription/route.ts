import { NextResponse } from "next/server"
import { auth } from "@/auth"
import connectDB from "@/lib/mongoose"
import { User } from "@/lib/models/user"
import { getRazorpay } from "@/lib/razorpay"
import { getStripe } from "@/lib/stripe"

// GET — current subscription status (server-fresh, not from JWT)
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()
  const user = await User.findById(session.user.id).select("subscription")
  const sub = user?.subscription

  return NextResponse.json({
    plan: sub?.plan ?? "free",
    status: sub?.status ?? "trialing",
    trialEndsAt: sub?.trialEndsAt ?? null,
    currentPeriodEnd: sub?.currentPeriodEnd ?? null,
    razorpaySubscriptionId: sub?.razorpaySubscriptionId ?? null,
  })
}

// DELETE — cancel subscription (stops renewal, Pro stays active until period end)
export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()
  const user = await User.findById(session.user.id).select("subscription")
  const sub = user?.subscription
  const provider = sub?.provider

  if (provider === "stripe") {
    const stripeSubscriptionId = sub?.stripeSubscriptionId
    if (!stripeSubscriptionId) {
      return NextResponse.json({ error: "No active Stripe subscription found" }, { status: 404 })
    }
    try {
      const stripe = getStripe()
      // cancel_at_period_end keeps Pro access until the billing period ends
      await stripe.subscriptions.update(stripeSubscriptionId, { cancel_at_period_end: true })
    } catch (err: any) {
      console.warn("Stripe cancel warning:", err?.message)
    }
  } else {
    // Razorpay (default)
    const razorpaySubscriptionId = sub?.razorpaySubscriptionId
    if (!razorpaySubscriptionId) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 })
    }
    try {
      const razorpay = getRazorpay()
      await razorpay.subscriptions.cancel(razorpaySubscriptionId, false)
    } catch (err: any) {
      console.warn("Razorpay cancel warning:", err?.error?.description)
    }
  }

  await User.findByIdAndUpdate(session.user.id, {
    "subscription.status": "cancelled",
  })

  return NextResponse.json({ success: true })
}
