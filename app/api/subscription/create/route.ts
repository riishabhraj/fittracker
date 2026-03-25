import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getRazorpay } from "@/lib/razorpay"
import { getStripe } from "@/lib/stripe"

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let billingCycle: string
  let provider: string
  try {
    const body = await req.json()
    billingCycle = body.billingCycle ?? "monthly"
    provider = body.provider ?? "razorpay"
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  // ── Stripe ────────────────────────────────────────────────────────────────
  if (provider === "stripe") {
    const priceId =
      billingCycle === "yearly"
        ? process.env.STRIPE_PRICE_ID_YEARLY
        : process.env.STRIPE_PRICE_ID_MONTHLY

    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe prices not configured. Set STRIPE_PRICE_ID_MONTHLY / STRIPE_PRICE_ID_YEARLY in .env.local." },
        { status: 503 }
      )
    }

    try {
      const stripe = getStripe()
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${getAppUrl()}/pricing?session_id={CHECKOUT_SESSION_ID}&provider=stripe`,
        cancel_url: `${getAppUrl()}/pricing`,
        customer_email: session.user.email ?? undefined,
        metadata: { userId: session.user.id },
        subscription_data: { metadata: { userId: session.user.id } },
      })

      return NextResponse.json({ url: checkoutSession.url })
    } catch (err: any) {
      console.error("POST /api/subscription/create (stripe) error:", err)
      return NextResponse.json({ error: err?.message ?? "Failed to create Stripe session" }, { status: 500 })
    }
  }

  // ── Razorpay (default) ────────────────────────────────────────────────────
  const planId =
    billingCycle === "yearly"
      ? process.env.RAZORPAY_PLAN_ID_YEARLY
      : process.env.RAZORPAY_PLAN_ID_MONTHLY

  if (!planId) {
    return NextResponse.json(
      { error: "Razorpay plans not configured. Set RAZORPAY_PLAN_ID_MONTHLY / RAZORPAY_PLAN_ID_YEARLY in .env.local." },
      { status: 503 }
    )
  }

  try {
    const razorpay = getRazorpay()
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: billingCycle === "yearly" ? 10 : 120,
      notes: {
        userId: session.user.id,
        billingCycle,
        userEmail: session.user.email ?? "",
      },
    })

    return NextResponse.json({ subscriptionId: subscription.id, key: process.env.RAZORPAY_KEY_ID })
  } catch (err: any) {
    console.error("POST /api/subscription/create (razorpay) error:", err)
    return NextResponse.json(
      { error: err?.error?.description ?? "Failed to create subscription" },
      { status: 500 }
    )
  }
}
