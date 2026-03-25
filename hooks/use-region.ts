"use client"

import { useMemo } from "react"

export type Region = "india" | "global"

export interface RegionPricing {
  monthly: string
  yearly: string
  yearlyPerMonth: string
  currency: string
  provider: "razorpay" | "stripe"
}

const INDIA_TIMEZONES = new Set(["Asia/Kolkata", "Asia/Calcutta"])

export function useRegion(): Region {
  return useMemo(() => {
    if (typeof window === "undefined") return "global"
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      return INDIA_TIMEZONES.has(tz) ? "india" : "global"
    } catch {
      return "global"
    }
  }, [])
}

export function useRegionPricing(): RegionPricing & { region: Region } {
  const region = useRegion()
  const pricing: RegionPricing =
    region === "india"
      ? { monthly: "₹199", yearly: "₹1,499", yearlyPerMonth: "₹125", currency: "INR", provider: "razorpay" }
      : { monthly: "$4.99", yearly: "$39", yearlyPerMonth: "$3.25", currency: "USD", provider: "stripe" }
  return { ...pricing, region }
}
