"use client"

import { Suspense } from "react"
import { InstallPrompt } from "@/components/install-prompt"
import { IOSInstallPrompt } from "@/components/ios-install-prompt"
import { BrowserInstallPrompt } from "@/components/browser-install-prompt"

export function ClientInstallPrompts() {
  return (
    <Suspense fallback={null}>
      <InstallPrompt />
      <IOSInstallPrompt />
      <BrowserInstallPrompt />
    </Suspense>
  )
}
