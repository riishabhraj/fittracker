"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"
import { toast } from "sonner"
import { useRegionPricing } from "@/hooks/use-region"
import { track } from "@/lib/analytics"

interface CheckoutButtonProps {
  billingCycle: "monthly" | "yearly"
  className?: string
  label?: string
  onSuccess?: () => void
}

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

export function CheckoutButton({ billingCycle, className, label, onSuccess }: CheckoutButtonProps) {
  const { data: session, update } = useSession()
  const { provider, monthly, yearly } = useRegionPricing()
  const [loading, setLoading] = useState(false)

  const defaultLabel = billingCycle === "yearly"
    ? `Upgrade — ${yearly}/yr`
    : `Upgrade — ${monthly}/mo`

  const handleStripe = async () => {
    track("upgrade_clicked", { provider: "stripe", billingCycle })
    setLoading(true)
    try {
      const res = await fetch("/api/subscription/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingCycle, provider: "stripe" }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error ?? "Failed to start checkout.")
        return
      }
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRazorpay = async () => {
    track("upgrade_clicked", { provider: "razorpay", billingCycle })
    setLoading(true)
    try {
      const createRes = await fetch("/api/subscription/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingCycle, provider: "razorpay" }),
      })
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}))
        toast.error(err.error ?? "Failed to start checkout.")
        return
      }
      const { subscriptionId, key } = await createRes.json()

      const loaded = await loadRazorpayScript()
      if (!loaded) {
        toast.error("Could not load payment gateway. Check your connection.")
        return
      }

      const options = {
        key,
        subscription_id: subscriptionId,
        name: "FitTracker",
        description: `Pro Plan — ${billingCycle === "yearly" ? "₹1,499/year" : "₹199/month"}`,
        image: "/fittracker-app-icon.png",
        prefill: { email: session?.user?.email ?? "", name: session?.user?.name ?? "" },
        theme: { color: "#AAFF00" },
        handler: async (response: {
          razorpay_payment_id: string
          razorpay_subscription_id: string
          razorpay_signature: string
        }) => {
          try {
            const verifyRes = await fetch("/api/subscription/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                provider: "razorpay",
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySubscriptionId: response.razorpay_subscription_id,
                razorpaySignature: response.razorpay_signature,
              }),
            })
            if (!verifyRes.ok) { toast.error("Payment verification failed. Contact support."); return }
            await update()
            track("upgrade_success", { provider: "razorpay", billingCycle })
            toast.success("Welcome to Pro! All features are now unlocked.")
            onSuccess?.()
          } catch {
            toast.error("Payment recorded but activation failed. Contact support.")
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      className={className}
      style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
      onClick={provider === "stripe" ? handleStripe : handleRazorpay}
      disabled={loading}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[hsl(0_0%_6%)] border-t-transparent rounded-full animate-spin" />
          {provider === "stripe" ? "Redirecting…" : "Opening checkout…"}
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          {label ?? defaultLabel}
        </span>
      )}
    </Button>
  )
}
