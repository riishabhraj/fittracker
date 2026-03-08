"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

/**
 * Silently watches the session. If it expires or is missing, redirects to /sign-in.
 * Mount once in the root layout (inside SessionProvider).
 */
export function SessionGuard() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    const path = window.location.pathname
    if (status === "unauthenticated" && !path.startsWith("/sign-in") && !path.startsWith("/onboarding")) {
      router.replace("/sign-in")
    }
  }, [status, router])

  return null
}
