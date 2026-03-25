"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Sparkles, ArrowLeft } from "lucide-react"
import { useSubscription } from "@/hooks/use-subscription"
import { useRegionPricing } from "@/hooks/use-region"
import { CheckoutButton } from "@/components/checkout-button"
import { useSession } from "next-auth/react"
import { track } from "@/lib/analytics"
import { toast } from "sonner"
import Link from "next/link"

const FREE_FEATURES = [
  "Unlimited workout logging",
  "3 saved templates",
  "Basic charts & streak tracking",
  "1 AI workout generation (trial)",
  "7-day Pro trial on signup",
]

const PRO_FEATURES = [
  "Everything in Free",
  "Unlimited AI workout generation",
  "Full AI insights & analysis",
  "Unlimited saved templates",
  "Advanced analytics & plateau detection",
  "PDF progress reports",
  "All future AI features",
]

// Handles Stripe redirect back from checkout
function StripeReturnHandler() {
  const params = useSearchParams()
  const { update } = useSession()
  const router = useRouter()

  useEffect(() => {
    const sessionId = params.get("session_id")
    const provider = params.get("provider")
    if (sessionId && provider === "stripe") {
      fetch("/api/subscription/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "stripe", sessionId }),
      })
        .then(async (res) => {
          if (res.ok) {
            await update()
            track("upgrade_success", { provider: "stripe" })
            toast.success("Welcome to Pro! All features are now unlocked.")
          } else {
            const err = await res.json().catch(() => ({}))
            toast.error(err.error ?? "Subscription activation failed. Contact support.")
          }
        })
        .catch(() => toast.error("Could not verify payment. Contact support."))
        .finally(() => {
          // Clean URL
          router.replace("/pricing")
        })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

function PricingContent() {
  const router = useRouter()
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly")
  const { isPro, isTrialActive } = useSubscription()
  const { monthly, yearly, yearlyPerMonth, provider, region } = useRegionPricing()

  return (
    <div className="min-h-screen bg-background">
      <StripeReturnHandler />

      <header
        className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="px-5 pt-4 pb-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Upgrade to Pro</h1>
        </div>
      </header>

      <main className="px-5 py-6 pb-28 space-y-6 max-w-lg mx-auto">

        {/* Hero */}
        <div className="text-center space-y-2 pt-2">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "hsl(80 100% 50% / 0.15)" }}
          >
            <Sparkles className="h-7 w-7" style={{ color: "hsl(80 100% 50%)" }} />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Train smarter,<br />not harder.</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Get AI-driven insights, unlimited generation, and advanced analytics to hit your goals faster.
          </p>
        </div>

        {/* Current plan badge */}
        {isPro && (
          <div
            className="text-center text-sm font-semibold py-2 px-4 rounded-full mx-auto w-fit"
            style={{ backgroundColor: "hsl(80 100% 50% / 0.15)", color: "hsl(80 100% 50%)" }}
          >
            {isTrialActive ? "Pro Trial Active" : "You're on Pro"} ✓
          </div>
        )}

        {/* Billing toggle */}
        {!isPro && (
          <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
              style={billing === "monthly" ? { backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" } : { color: "hsl(0 0% 55%)" }}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("yearly")}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors relative"
              style={billing === "yearly" ? { backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" } : { color: "hsl(0 0% 55%)" }}
            >
              Yearly
              <span
                className="absolute -top-2 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: "#f97316", color: "#fff" }}
              >
                -37%
              </span>
            </button>
          </div>
        )}

        {/* Plan cards */}
        <div className="space-y-4">

          {/* Free */}
          <Card className="p-5 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-foreground">Free</p>
                <p className="text-xs text-muted-foreground">Always free</p>
              </div>
              <p className="text-xl font-bold text-foreground">{region === "india" ? "₹0" : "$0"}</p>
            </div>
            <ul className="space-y-2">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Check className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                  {f}
                </li>
              ))}
            </ul>
          </Card>

          {/* Pro */}
          <div className="relative">
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full z-10"
              style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
            >
              RECOMMENDED
            </div>

            <Card
              className="p-5 border-2"
              style={{ borderColor: "hsl(80 100% 50% / 0.5)", backgroundColor: "hsl(80 100% 50% / 0.04)" }}
            >
              <div className="flex items-center justify-between mb-4 pt-1">
                <div>
                  <p className="font-bold text-foreground flex items-center gap-1.5">
                    Pro
                    <Sparkles className="h-3.5 w-3.5" style={{ color: "hsl(80 100% 50%)" }} />
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {billing === "yearly" ? "Billed annually" : "Billed monthly"}
                  </p>
                </div>
                <div className="text-right">
                  {billing === "yearly" ? (
                    <>
                      <p className="text-2xl font-bold text-foreground">
                        {yearly}<span className="text-sm font-normal text-muted-foreground">/yr</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{yearlyPerMonth}/mo</p>
                    </>
                  ) : (
                    <p className="text-2xl font-bold text-foreground">
                      {monthly}<span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </p>
                  )}
                </div>
              </div>

              <ul className="space-y-2 mb-5">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                    <Check className="h-3.5 w-3.5 shrink-0" style={{ color: "hsl(80 100% 50%)" }} />
                    {f}
                  </li>
                ))}
              </ul>

              {isPro ? (
                <Button className="w-full h-12" variant="outline" disabled>
                  Current Plan ✓
                </Button>
              ) : (
                <CheckoutButton billingCycle={billing} className="w-full h-12" />
              )}
            </Card>
          </div>
        </div>

        {/* Fine print */}
        <p className="text-center text-xs text-muted-foreground px-4">
          Secure payment via {provider === "stripe" ? "Stripe" : "Razorpay"} · Cancel anytime · No hidden fees
        </p>

        <div className="text-center">
          <Link href="/privacy-policy">
            <span className="text-xs text-muted-foreground underline underline-offset-2">Privacy Policy</span>
          </Link>
        </div>
      </main>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    }>
      <PricingContent />
    </Suspense>
  )
}
