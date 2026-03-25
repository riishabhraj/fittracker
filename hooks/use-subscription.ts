"use client"

import { useSession } from "next-auth/react"

export interface SubscriptionState {
  plan: "free" | "pro"
  isPro: boolean
  isTrialActive: boolean
  isExpired: boolean
  daysLeft: number
  trialEndsAt: Date | null
}

export function useSubscription(): SubscriptionState {
  const { data: session } = useSession()

  const plan = (session?.user?.plan as "free" | "pro") ?? "free"
  const trialEndsAt = session?.user?.trialEndsAt ? new Date(session.user.trialEndsAt) : null
  const now = new Date()

  const isTrialActive = plan === "free" && trialEndsAt !== null && trialEndsAt > now
  const isPro = plan === "pro" || isTrialActive
  const isExpired = plan === "free" && trialEndsAt !== null && trialEndsAt <= now
  const daysLeft = isTrialActive
    ? Math.ceil((trialEndsAt!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return { plan, isPro, isTrialActive, isExpired, daysLeft, trialEndsAt }
}
