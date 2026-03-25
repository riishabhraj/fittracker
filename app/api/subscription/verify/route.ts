import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { auth } from "@/auth"
import { getRazorpay } from "@/lib/razorpay"
import { getStripe } from "@/lib/stripe"
import { activateProSubscription } from "@/lib/subscription-utils"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const provider = body.provider ?? "razorpay"

  // ── Stripe ────────────────────────────────────────────────────────────────
  if (provider === "stripe") {
    const { sessionId } = body
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
    }

    try {
      const stripe = getStripe()
      const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["subscription"],
      })

      if (checkoutSession.status !== "complete" && checkoutSession.payment_status !== "paid") {
        return NextResponse.json({ error: "Payment not completed" }, { status: 400 })
      }

      const sub = checkoutSession.subscription as any
      const currentPeriodEnd = sub?.current_period_end
        ? new Date((sub.current_period_end as number) * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

      await activateProSubscription(session.user.id, {
        provider: "stripe",
        subscriptionId: sub?.id ?? (checkoutSession.subscription as string),
        customerId: typeof checkoutSession.customer === "string" ? checkoutSession.customer : undefined,
        currentPeriodEnd,
      })

      return NextResponse.json({ success: true })
    } catch (err: any) {
      console.error("POST /api/subscription/verify (stripe) error:", err)
      return NextResponse.json({ error: "Failed to activate subscription" }, { status: 500 })
    }
  }

  // ── Razorpay ──────────────────────────────────────────────────────────────
  const { razorpayPaymentId, razorpaySubscriptionId, razorpaySignature } = body

  if (!razorpayPaymentId || !razorpaySubscriptionId || !razorpaySignature) {
    return NextResponse.json({ error: "Missing payment fields" }, { status: 400 })
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) {
    return NextResponse.json({ error: "Razorpay not configured" }, { status: 503 })
  }

  const expectedSig = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpayPaymentId}|${razorpaySubscriptionId}`)
    .digest("hex")

  if (expectedSig !== razorpaySignature) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
  }

  try {
    const razorpay = getRazorpay()
    const subscription = await razorpay.subscriptions.fetch(razorpaySubscriptionId)

    const currentPeriodEnd = subscription.current_end
      ? new Date((subscription.current_end as number) * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    await activateProSubscription(session.user.id, {
      provider: "razorpay",
      subscriptionId: razorpaySubscriptionId,
      currentPeriodEnd,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("POST /api/subscription/verify (razorpay) error:", err)
    return NextResponse.json({ error: "Failed to activate subscription" }, { status: 500 })
  }
}
