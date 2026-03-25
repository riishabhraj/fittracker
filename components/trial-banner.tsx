"use client"

import { useState } from "react"
import { useSubscription } from "@/hooks/use-subscription"
import { UpgradeModal } from "@/components/upgrade-modal"
import { Sparkles, AlertCircle } from "lucide-react"

export function TrialBanner() {
  const { isTrialActive, isExpired, daysLeft } = useSubscription()
  const [showUpgrade, setShowUpgrade] = useState(false)

  if (!isTrialActive && !isExpired) return null

  return (
    <>
      {isTrialActive ? (
        <button
          type="button"
          onClick={() => setShowUpgrade(true)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
          style={{ backgroundColor: "hsl(80 100% 50% / 0.12)", borderBottom: "1px solid hsl(80 100% 50% / 0.2)" }}
        >
          <span className="flex items-center gap-2" style={{ color: "hsl(80 100% 50%)" }}>
            <Sparkles className="h-3.5 w-3.5" />
            Pro Trial active — {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
          </span>
          <span className="text-xs font-semibold underline underline-offset-2" style={{ color: "hsl(80 100% 50%)" }}>
            Upgrade
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setShowUpgrade(true)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
          style={{ backgroundColor: "rgba(239,68,68,0.1)", borderBottom: "1px solid rgba(239,68,68,0.2)" }}
        >
          <span className="flex items-center gap-2 text-red-400">
            <AlertCircle className="h-3.5 w-3.5" />
            Your Pro trial ended
          </span>
          <span className="text-xs font-semibold text-red-400 underline underline-offset-2">
            Restore Pro
          </span>
        </button>
      )}

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        reason={isExpired ? "You had 7 days of Pro. Don't lose your streak, insights, and progress now." : undefined}
      />
    </>
  )
}
