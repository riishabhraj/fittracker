import Stripe from "stripe"

let _client: Stripe | null = null

export function getStripe(): Stripe {
  if (!_client) {
    const secret = process.env.STRIPE_SECRET_KEY
    if (!secret) {
      throw new Error("Stripe not configured. Set STRIPE_SECRET_KEY in .env.local")
    }
    _client = new Stripe(secret, { apiVersion: "2026-02-25.clover" as any })
  }
  return _client
}
