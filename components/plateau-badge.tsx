"use client"

import { AlertTriangle } from "lucide-react"

interface PlateauBadgeProps {
  weeksStalled: number
  className?: string
}

/**
 * Small orange badge shown next to an exercise name when it's plateaued.
 */
export function PlateauBadge({ weeksStalled, className = "" }: PlateauBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${className}`}
      style={{ backgroundColor: "rgba(249,115,22,0.15)", color: "#f97316" }}
      title={`No improvement in ~${weeksStalled} week${weeksStalled !== 1 ? "s" : ""}`}
    >
      <AlertTriangle className="h-2.5 w-2.5" />
      Plateau ~{weeksStalled}w
    </span>
  )
}
