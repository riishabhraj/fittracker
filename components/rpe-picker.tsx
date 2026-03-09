"use client"

import { Slider } from "@/components/ui/slider"

interface RPEPickerProps {
  value: number | undefined
  onChange: (value: number) => void
}

const RPE_LEVELS: Record<number, { label: string; color: string }> = {
  1:  { label: "Very easy",      color: "#22c55e" },
  2:  { label: "Easy",           color: "#22c55e" },
  3:  { label: "Moderate",       color: "#86efac" },
  4:  { label: "Somewhat hard",  color: "#86efac" },
  5:  { label: "Hard",           color: "#f59e0b" },
  6:  { label: "Hard",           color: "#f59e0b" },
  7:  { label: "Very hard",      color: "#f97316" },
  8:  { label: "Very hard",      color: "#f97316" },
  9:  { label: "Near max",       color: "#ef4444" },
  10: { label: "Max effort",     color: "#ef4444" },
}

export function RPEPicker({ value, onChange }: RPEPickerProps) {
  const info = value !== undefined ? RPE_LEVELS[value] : null

  return (
    <div className="flex items-center gap-3 py-2 px-1">
      <span className="text-xs font-medium text-muted-foreground w-8 shrink-0">RPE</span>
      <Slider
        min={1}
        max={10}
        step={1}
        value={[value ?? 5]}
        onValueChange={([v]) => onChange(v)}
        className="flex-1"
      />
      <div className="flex items-center gap-1.5 w-[90px] shrink-0">
        {info && (
          <>
            <span
              className="text-sm font-bold tabular-nums"
              style={{ color: info.color }}
            >
              {value}
            </span>
            <span
              className="text-xs leading-tight"
              style={{ color: info.color }}
            >
              {info.label}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
