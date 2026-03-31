"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"
import { toast } from "sonner"

interface RazorpayCheckoutButtonProps {
  billingCycle: "monthly" | "yearly"
  className?: string
  label?: string
  onSuccess?: () => void
}

// Loads the Razorpay checkout.js script once
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false)
    if ((window as any).Razorpay) return resolve(true)
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export function RazorpayCheckoutButton({
  billingCycle,
  className,
  label,
  onSuccess,
}: RazorpayCheckoutButtonProps) {
  const { data: session, update } = useSession()
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      // 1. Create subscription on server
      const createRes = await fetch("/api/subscription/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingCycle }),
      })

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}))
        toast.error(err.error ?? "Failed to start checkout. Please try again.")
        return
      }

      const { subscriptionId, key } = await createRes.json()

      // 2. Load Razorpay script
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        toast.error("Could not load payment gateway. Check your connection.")
        return
      }

      // 3. Open Razorpay checkout
      const options = {
        key,
        subscription_id: subscriptionId,
        name: "FitTracker",
        description: `Pro Plan — ${billingCycle === "yearly" ? "₹1,499/year" : "₹199/month"}`,
        image: "/fittracker-app-icon.png",
        prefill: {
          email: session?.user?.email ?? "",
          name: session?.user?.name ?? "",
        },
        theme: { color: "#AAFF00" },
        handler: async (response: {
          razorpay_payment_id: string
          razorpay_subscription_id: string
          razorpay_signature: string
        }) => {
          // 4. Verify payment on server
          try {
            const verifyRes = await fetch("/api/subscription/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySubscriptionId: response.razorpay_subscription_id,
                razorpaySignature: response.razorpay_signature,
              }),
            })

            if (!verifyRes.ok) {
              toast.error("Payment verification failed. Contact support.")
              return
            }

            // 5. Refresh JWT session to pick up new plan
            await update()
            toast.success("Welcome to Pro! All features are now unlocked.")
            onSuccess?.()
          } catch {
            toast.error("Payment recorded but activation failed. Contact support.")
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (err) {
      console.error("Razorpay checkout error:", err)
      toast.error("Something went wrong. Please try again.")
    } finally {
      // Loading stays true until modal closes or payment succeeds
      setLoading(false)
    }
  }

  return (
    <Button
      className={className}
      style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
      onClick={handleUpgrade}
      disabled={loading}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[hsl(0_0%_6%)] border-t-transparent rounded-full animate-spin" />
          Opening checkout…
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          {label ?? (billingCycle === "yearly" ? "Upgrade — ₹1,499/yr" : "Upgrade — ₹199/mo")}
        </span>
      )}
    </Button>
  )
}
