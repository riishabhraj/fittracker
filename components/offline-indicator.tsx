"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { WifiOff, Wifi } from "lucide-react"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)

      if (!online) {
        setShowOfflineMessage(true)
      } else if (showOfflineMessage) {
        // Show "back online" message briefly
        setTimeout(() => setShowOfflineMessage(false), 3000)
      }
    }

    // Set initial status
    updateOnlineStatus()

    // Listen for online/offline events
    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [showOfflineMessage])

  if (!showOfflineMessage) {
    return null
  }

  return (
    <Card className="fixed top-20 left-4 right-4 p-3 bg-card border-border shadow-lg z-50 md:left-auto md:right-4 md:w-80">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${isOnline ? "bg-green-500/10" : "bg-red-500/10"}`}>
          {isOnline ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{isOnline ? "Back online!" : "You're offline"}</p>
          <p className="text-xs text-muted-foreground">
            {isOnline ? "Your data will sync automatically" : "Your workouts will be saved locally"}
          </p>
        </div>
      </div>
    </Card>
  )
}
