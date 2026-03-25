"use client"

import { useEffect, useState } from "react"
import { useSubscription } from "@/hooks/use-subscription"
import { Card } from "@/components/ui/card"
import { Sparkles, Lock } from "lucide-react"
import { getInsight, type FitnessProfile } from "@/lib/fitness-utils"
import { UpgradeModal } from "@/components/upgrade-modal"

export function AIInsightPreviewCard() {
  const { isPro } = useSubscription()
  const [profile, setProfile] = useState<FitnessProfile | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then(setProfile)
      .catch(() => {})
  }, [])

  if (!profile) return null

  const insight = getInsight(profile)

  if (isPro) {
    return (
      <Card className="p-5 bg-card border-border">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold text-primary uppercase tracking-widest">AI Insight</p>
        </div>
        <p className="font-bold text-foreground mb-1">{insight.program}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
      </Card>
    )
  }

  // Free: show program name + first sentence, blur rest
  return (
    <>
      <div className="relative cursor-pointer rounded-xl overflow-hidden" onClick={() => setShowUpgrade(true)}>
        <Card className="p-5 bg-card border-border">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">AI Insight</p>
          </div>
          <p className="font-bold text-foreground mb-1">{insight.program}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {insight.description.split(".")[0]}.
          </p>

          {/* Fake blurred continuation */}
          <div className="relative mt-2 overflow-hidden h-10">
            <p
              className="text-sm text-muted-foreground leading-relaxed select-none pointer-events-none"
              style={{ filter: "blur(5px)" }}
            >
              Focus on progressive overload and track volume per muscle group weekly.
            </p>
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to bottom, transparent 0%, hsl(0 0% 11%) 80%)" }}
            />
          </div>
        </Card>

        {/* Lock pill */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: "hsl(80 100% 50% / 0.15)", color: "hsl(80 100% 50%)" }}
          >
            <Lock className="h-3 w-3" />
            Unlock full analysis
          </div>
        </div>
      </div>

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        reason="You're making progress — but something might be holding you back. Unlock your full AI training analysis."
      />
    </>
  )
}
