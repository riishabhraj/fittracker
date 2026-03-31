import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { Resend } from "resend"
import connectDB from "@/lib/mongoose"
import { User } from "@/lib/models/user"
import { OtpToken } from "@/lib/models/otp-token"

export async function POST(req: NextRequest) {
  try {
    let body: any
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const { name, email, password } = body

    // Validate fields
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 })
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    await connectDB()

    const normalizedEmail = email.toLowerCase().trim()

    // Check if email already taken
    const existing = await User.findOne({ email: normalizedEmail }).select("+password")
    if (existing) {
      const isOAuth = !existing.password
      if (isOAuth) {
        return NextResponse.json({
          error: "This email is linked to a Google account. Please sign in with Google instead.",
        }, { status: 409 })
      }
      // Existing unverified account — let them re-verify
      if (!existing.emailVerified) {
        return NextResponse.json({
          error: "An account with this email exists but hasn't been verified.",
          requiresVerification: true,
          email: normalizedEmail,
        }, { status: 409 })
      }
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 10)

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
      subscription: {
        plan: "free",
        status: "trialing",
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    // Generate and send OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedOtp = await bcrypt.hash(otp, 10)

    await OtpToken.deleteMany({ email: normalizedEmail })
    await OtpToken.create({
      userId: user._id.toString(),
      email: normalizedEmail,
      hashedOtp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    })

    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: process.env.RESEND_FROM_DOMAIN === "resend.dev"
          ? "FitTracker <onboarding@resend.dev>"
          : `FitTracker <noreply@${process.env.RESEND_FROM_DOMAIN ?? "fittracker.app"}>`,
        to: normalizedEmail,
        subject: "Verify your FitTracker email",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #0f0f0f; color: #f5f5f5; border-radius: 16px;">
            <img src="${process.env.NEXTAUTH_URL}/fittracker-app-icon.png" alt="FitTracker" width="56" height="56" style="border-radius: 14px; margin-bottom: 24px; display: block;" />
            <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">Verify your email</h1>
            <p style="color: #888; font-size: 14px; margin: 0 0 32px;">
              Enter this 6-digit code in FitTracker to confirm your email address.
              It expires in <strong style="color: #f5f5f5;">10 minutes</strong>.
            </p>
            <div style="background: #1c1c1c; border: 1px solid #2e2e2e; border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 32px;">
              <p style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 12px;">Your verification code</p>
              <p style="font-size: 40px; font-weight: 700; letter-spacing: 0.25em; color: #aaff00; margin: 0; font-family: monospace;">${otp}</p>
            </div>
            <p style="color: #555; font-size: 12px; margin: 0;">
              If you didn't create a FitTracker account, you can safely ignore this email.
            </p>
          </div>
        `,
      })
    } catch (emailErr) {
      console.error("[register] email send failed:", emailErr)
      // Don't fail the request — user can resend
    }

    return NextResponse.json({ requiresVerification: true, email: normalizedEmail }, { status: 201 })
  } catch (err) {
    console.error("POST /api/auth/register error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
