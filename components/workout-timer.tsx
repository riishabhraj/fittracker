"use client"

import { useState, useEffect } from "react"
import { Timer } from "lucide-react"

interface WorkoutTimerProps {
  isActive: boolean
  duration?: number // Duration in minutes passed from parent
}

export function WorkoutTimer({ isActive, duration }: WorkoutTimerProps) {
  // Initialise from duration so resumed sessions start at the right offset
  const [seconds, setSeconds] = useState(() => (duration ?? 0) * 60)

  useEffect(() => {
    if (!isActive) return
    const interval = setInterval(() => {
      setSeconds((s) => s + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [isActive])

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const displayTime = seconds

  return (
    <div className="flex items-center space-x-2 bg-primary/10 px-3 py-1 rounded-lg">
      <Timer className="h-4 w-4 text-primary" />
      <span className="text-sm font-mono text-primary">{formatTime(displayTime)}</span>
    </div>
  )
}
