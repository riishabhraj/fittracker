import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getStripe } from "@/lib/stripe"
import connectDB from "@/lib/mongoose"
import { User } from "@/lib/models/user"
import { activateProSubscription, findUserByStripeCustomer, findUserByStripeSubscription } from "@/lib/subscription-utils"

function periodEnd(sub: any): Date {
  // current_period_end exists in the API response but typing varies across SDK versions
  const ts: number | undefined = sub?.current_period_end
  return ts ? new Date(ts * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get("stripe-signature")

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not set")
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature ?? "", webhookSecret)
  } catch (err: any) {
    console.error("Stripe webhook signature verification failed:", err.message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as any
        const userId = checkoutSession.metadata?.userId
        if (!userId || checkoutSession.mode !== "subscription") break

        const stripe = getStripe()
        const sub = await stripe.subscriptions.retrieve(checkoutSession.subscription as string) as any

        await activateProSubscription(userId, {
          provider: "stripe",
          subscriptionId: sub.id,
          customerId: typeof checkoutSession.customer === "string" ? checkoutSession.customer : undefined,
          currentPeriodEnd: periodEnd(sub),
        })
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any
        if (invoice.billing_reason !== "subscription_cycle") break

        const subscriptionId = invoice.subscription as string
        if (!subscriptionId) break

        const user = await findUserByStripeSubscription(subscriptionId)
        if (!user) break

        const stripe = getStripe()
        const sub = await stripe.subscriptions.retrieve(subscriptionId) as any

        await connectDB()
        await User.findByIdAndUpdate(user._id, {
          "subscription.plan": "pro",
          "subscription.status": "active",
          "subscription.currentPeriodEnd": periodEnd(sub),
        })
        break
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as any
        const user = await findUserByStripeSubscription(sub.id)
        if (!user) break

        await connectDB()
        await User.findByIdAndUpdate(user._id, {
          "subscription.plan": "free",
          "subscription.status": "expired",
        })
        break
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as any
        const user = await findUserByStripeSubscription(sub.id)
        if (!user) break

        if (sub.cancel_at_period_end) {
          await connectDB()
          await User.findByIdAndUpdate(user._id, { "subscription.status": "cancelled" })
        } else if (sub.status === "active") {
          await connectDB()
          await User.findByIdAndUpdate(user._id, {
            "subscription.status": "active",
            "subscription.currentPeriodEnd": periodEnd(sub),
          })
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any
        const customerId = typeof invoice.customer === "string" ? invoice.customer : null
        if (!customerId) break

        const user = await findUserByStripeCustomer(customerId)
        if (!user) break

        await connectDB()
        await User.findByIdAndUpdate(user._id, { "subscription.status": "past_due" })
        break
      }
    }
  } catch (err) {
    console.error("Stripe webhook handler error:", err)
  }

  return NextResponse.json({ ok: true })
}
