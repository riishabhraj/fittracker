import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import connectDB from "@/lib/mongoose"
import { User } from "@/lib/models/user"

// Must read raw body before any parsing — required for HMAC verification
export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get("x-razorpay-signature")

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error("RAZORPAY_WEBHOOK_SECRET not set")
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
  }

  // Verify webhook signature
  const expectedSig = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex")

  if (expectedSig !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const eventType: string = event.event
  const subscriptionEntity = event.payload?.subscription?.entity

  if (!subscriptionEntity) {
    return NextResponse.json({ ok: true }) // unrelated event, ignore
  }

  const subscriptionId: string = subscriptionEntity.id

  await connectDB()

  switch (eventType) {
    case "subscription.charged": {
      // Successful renewal — extend period
      const currentEnd = subscriptionEntity.current_end
        ? new Date((subscriptionEntity.current_end as number) * 1000)
        : null

      await User.findOneAndUpdate(
        { "subscription.razorpaySubscriptionId": subscriptionId },
        {
          "subscription.plan": "pro",
          "subscription.status": "active",
          ...(currentEnd ? { "subscription.currentPeriodEnd": currentEnd } : {}),
        }
      )
      break
    }

    case "subscription.cancelled":
    case "subscription.completed": {
      // Subscription ended — mark cancelled (access stays until currentPeriodEnd)
      await User.findOneAndUpdate(
        { "subscription.razorpaySubscriptionId": subscriptionId },
        { "subscription.status": "cancelled" }
      )
      break
    }

    case "subscription.pending":
    case "subscription.halted": {
      // Payment failed repeatedly — downgrade to free
      await User.findOneAndUpdate(
        { "subscription.razorpaySubscriptionId": subscriptionId },
        { "subscription.plan": "free", "subscription.status": "expired" }
      )
      break
    }
  }

  return NextResponse.json({ ok: true })
}
