"use client"

import { useState } from "react"
import { useSubscription } from "@/hooks/use-subscription"
import { UpgradeModal } from "@/components/upgrade-modal"
import { Lock } from "lucide-react"

interface ProGateProps {
  children: React.ReactNode
  /** Optional teaser shown to free users instead of children. If omitted, a generic lock is shown. */
  preview?: React.ReactNode
  /** Short description of what is locked — shown in the upgrade modal. */
  reason?: string
}

export function ProGate({ children, preview, reason }: ProGateProps) {
  const { isPro } = useSubscription()
  const [showUpgrade, setShowUpgrade] = useState(false)

  if (isPro) return <>{children}</>

  return (
    <>
      <div
        className="relative cursor-pointer"
        onClick={() => setShowUpgrade(true)}
      >
        {preview ?? (
          <div className="flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-border text-muted-foreground text-sm">
            <Lock className="h-4 w-4" />
            Pro feature
          </div>
        )}

        {/* Blur overlay when preview is provided */}
        {preview && (
          <div className="absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-2"
            style={{ backdropFilter: "blur(4px)", backgroundColor: "rgba(15,15,15,0.5)" }}
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ backgroundColor: "hsl(80 100% 50% / 0.15)", color: "hsl(80 100% 50%)" }}
            >
              <Lock className="h-3 w-3" />
              Unlock with Pro
            </div>
          </div>
        )}
      </div>

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        reason={reason}
      />
    </>
  )
}
