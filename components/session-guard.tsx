"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const PUBLIC_PATHS = [
  "/sign-in",
  "/reset-password",
  "/verify-email",
  "/privacy-policy",
  "/onboarding",
]

/**
 * Silently watches the session. If it expires or is missing, redirects to /sign-in.
 * Mount once in the root layout (inside SessionProvider).
 */
export function SessionGuard() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    const path = window.location.pathname
    const isPublic = PUBLIC_PATHS.some((p) => path.startsWith(p))
    if (status === "unauthenticated" && !isPublic) {
      router.replace("/sign-in")
    }
  }, [status, router])

  return null
}
