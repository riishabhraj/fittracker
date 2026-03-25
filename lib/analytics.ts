/** Fire-and-forget analytics tracking. Never throws. */
export function track(event: string, properties?: Record<string, any>) {
  if (typeof window === "undefined") return
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, properties }),
  }).catch(() => {})
}
