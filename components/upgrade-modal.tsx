"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Check, Sparkles } from "lucide-react"
import { CheckoutButton } from "@/components/checkout-button"
import { track } from "@/lib/analytics"
import Link from "next/link"

const PRO_FEATURES = [
  "Unlimited AI workout generation",
  "Advanced insights & analytics",
  "Unlimited saved templates",
  "PDF export",
  "All future AI features",
]

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  reason?: string
}

export function UpgradeModal({ open, onClose, reason }: UpgradeModalProps) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly")

  useEffect(() => {
    if (open) track("upgrade_modal_shown", { reason: reason ?? "unknown" })
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm bg-card border-border p-0 overflow-hidden">
        {/* Lime accent bar */}
        <div className="h-1 w-full" style={{ backgroundColor: "hsl(80 100% 50%)" }} />

        <div className="p-6 space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "hsl(80 100% 50% / 0.15)" }}>
                <Sparkles className="h-4 w-4" style={{ color: "hsl(80 100% 50%)" }} />
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">Upgrade to Pro</DialogTitle>
            </div>
            {reason && <p className="text-sm text-muted-foreground">{reason}</p>}
          </DialogHeader>

          <ul className="space-y-2">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                <Check className="h-3.5 w-3.5 shrink-0" style={{ color: "hsl(80 100% 50%)" }} />
                {f}
              </li>
            ))}
          </ul>

          {/* Billing toggle */}
          <div className="flex items-center gap-1 bg-background border border-border rounded-xl p-1">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={billing === "monthly" ? { backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" } : { color: "hsl(0 0% 55%)" }}
            >
              ₹199 / mo
            </button>
            <button
              type="button"
              onClick={() => setBilling("yearly")}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors relative"
              style={billing === "yearly" ? { backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" } : { color: "hsl(0 0% 55%)" }}
            >
              ₹1,499 / yr
              <span
                className="absolute -top-2 -right-1 text-[8px] font-bold px-1 py-0.5 rounded-full"
                style={{ backgroundColor: "#f97316", color: "#fff" }}
              >
                -37%
              </span>
            </button>
          </div>

          <CheckoutButton
            billingCycle={billing}
            className="w-full h-11 text-sm font-semibold"
            onSuccess={onClose}
          />

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Secure · Cancel anytime</p>
            <Link href="/pricing" onClick={onClose}>
              <span className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors">
                View full plan
              </span>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
