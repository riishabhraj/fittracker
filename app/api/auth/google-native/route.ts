import { NextRequest, NextResponse } from "next/server"
import { encode } from "next-auth/jwt"
import connectDB from "@/lib/mongoose"
import { User } from "@/lib/models/user"

// Must match auth.config.ts exactly — single source of truth for cookie name
const COOKIE_NAME = "authjs.session-token"

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json()
    if (!idToken) return NextResponse.json({ error: "Missing idToken" }, { status: 400 })

    // Verify the Google ID token
    const googleRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    )
    if (!googleRes.ok) return NextResponse.json({ error: "Invalid Google token" }, { status: 401 })

    const payload = await googleRes.json()

    // Verify the token was issued for our app
    const validIds = [process.env.GOOGLE_CLIENT_ID, process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID].filter(Boolean)
    if (!validIds.includes(payload.aud)) {
      return NextResponse.json({ error: "Token audience mismatch" }, { status: 401 })
    }

    if (!payload.email) return NextResponse.json({ error: "No email in token" }, { status: 401 })

    const email = (payload.email as string).toLowerCase()
    const name  = (payload.name as string | undefined) ?? email.split("@")[0]

    // Find or create user
    await connectDB()
    let user = await User.findOne({ email })
    if (!user) {
      user = await User.create({
        email,
        name,
        emailVerified: new Date(),
        subscription: {
          plan: "free",
          status: "trialing",
          trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      })
    }

    // Encode a JWT identical to what Auth.js would create
    // Salt MUST match the cookie name used in auth.config.ts
    const sessionToken = await encode({
      token: {
        sub:   user._id.toString(),
        id:    user._id.toString(),
        email: user.email,
        name:  user.name ?? null,
        plan:  user.subscription?.plan ?? "free",
        trialEndsAt: user.subscription?.trialEndsAt ?? null,
      },
      secret:  process.env.AUTH_SECRET!,
      salt:    COOKIE_NAME,
      maxAge:  30 * 24 * 60 * 60,
    })

    const response = NextResponse.json({ ok: true })

    // Cookie settings MUST match auth.config.ts: sameSite: "none", secure: true
    response.cookies.set(COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure:   true,
      sameSite: "none",
      path:     "/",
      maxAge:   30 * 24 * 60 * 60,
    })

    return response
  } catch (err) {
    console.error("[google-native] auth error:", err)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
