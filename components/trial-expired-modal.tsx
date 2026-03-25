"use client"

import { useState, useEffect } from "react"
import { useSubscription } from "@/hooks/use-subscription"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { XCircle, Sparkles } from "lucide-react"
import { UpgradeModal } from "@/components/upgrade-modal"

const LOST_FEATURES = [
  "🔥 AI workout generation",
  "📈 Strength insights & plateau detection",
  "💪 Unlimited templates & goals",
]

const STORAGE_KEY = "fittracker_trial_expired_dismissed"

export function TrialExpiredModal() {
  const { isExpired } = useSubscription()
  const [open, setOpen] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

  useEffect(() => {
    if (!isExpired) return
    const dismissed = sessionStorage.getItem(STORAGE_KEY)
    if (!dismissed) setOpen(true)
  }, [isExpired])

  function dismiss() {
    sessionStorage.setItem(STORAGE_KEY, "1")
    setOpen(false)
  }

  function upgrade() {
    dismiss()
    setShowUpgrade(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={dismiss}>
        <DialogContent className="sm:max-w-sm bg-card border-border p-0 overflow-hidden">
          <div className="h-1 w-full bg-red-500/60" />
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="font-bold text-foreground">Your 7-day Pro trial just ended</p>
                <p className="text-xs text-muted-foreground">You trained with all of this — don't lose it:</p>
              </div>
            </div>

            <ul className="space-y-2">
              {LOST_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground line-through">
                  <XCircle className="h-3.5 w-3.5 shrink-0 text-red-400/60" />
                  {f}
                </li>
              ))}
            </ul>

            <p className="text-xs text-center text-muted-foreground">
              Don't go back to guessing your workouts.
            </p>

            <Button
              className="w-full h-11 font-semibold text-sm flex items-center gap-2"
              style={{ backgroundColor: "hsl(80 100% 50%)", color: "hsl(0 0% 6%)" }}
              onClick={upgrade}
            >
              <Sparkles className="h-4 w-4" />
              Keep training at your best
            </Button>

            <button
              type="button"
              onClick={dismiss}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Maybe later
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </>
  )
}
