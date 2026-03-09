"use client"

interface SupersetBracketProps {
  /** Name of exercise A (top) */
  topName: string
  /** Name of exercise B (bottom) */
  bottomName: string
}

/**
 * Visual connector rendered between two exercises that share a supersetGroup.
 * Shows a vertical bracket on the left + "SUPERSET" label.
 */
export function SupersetBracket({ topName, bottomName }: SupersetBracketProps) {
  return (
    <div className="flex items-stretch gap-3 -my-1 px-1">
      {/* Vertical bracket line */}
      <div className="flex flex-col items-center w-6 shrink-0">
        <div className="w-px flex-1 bg-primary/40" />
        <div
          className="text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded"
          style={{ backgroundColor: "hsl(80 100% 50% / 0.15)", color: "hsl(80 100% 50%)" }}
        >
          SS
        </div>
        <div className="w-px flex-1 bg-primary/40" />
      </div>

      {/* Labels */}
      <div className="flex flex-col justify-between py-1 text-xs text-muted-foreground">
        <span>{topName}</span>
        <span>{bottomName}</span>
      </div>
    </div>
  )
}
