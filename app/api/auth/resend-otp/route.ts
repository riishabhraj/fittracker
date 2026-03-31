import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { Resend } from "resend"
import connectDB from "@/lib/mongoose"
import { User } from "@/lib/models/user"
import { OtpToken } from "@/lib/models/otp-token"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 })
    }

    await connectDB()

    const normalizedEmail = email.toLowerCase().trim()

    const user = await User.findOne({ email: normalizedEmail }).select("+password")
    // Silent success if not found or OAuth user — no enumeration
    if (!user || !user.password) {
      return NextResponse.json({ ok: true })
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "This email is already verified." }, { status: 400 })
    }

    // Check cooldown
    const existingToken = await OtpToken.findOne({ email: normalizedEmail })
    if (existingToken) {
      const elapsed = Date.now() - existingToken.createdAt.getTime()
      if (elapsed < 60_000) {
        const secondsLeft = Math.ceil((60_000 - elapsed) / 1000)
        return NextResponse.json({ error: "Please wait before requesting another code.", secondsLeft }, { status: 429 })
      }
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedOtp = await bcrypt.hash(otp, 10)

    await OtpToken.deleteMany({ email: normalizedEmail })
    await OtpToken.create({
      userId: user._id.toString(),
      email: normalizedEmail,
      hashedOtp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    })

    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: process.env.RESEND_FROM_DOMAIN === "resend.dev"
        ? "FitTracker <onboarding@resend.dev>"
        : `FitTracker <noreply@${process.env.RESEND_FROM_DOMAIN ?? "fittracker.app"}>`,
      to: normalizedEmail,
      subject: "Your new FitTracker verification code",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #0f0f0f; color: #f5f5f5; border-radius: 16px;">
          <img src="${process.env.NEXTAUTH_URL}/fittracker-app-icon.png" alt="FitTracker" width="56" height="56" style="border-radius: 14px; margin-bottom: 24px; display: block;" />
          <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">Verify your email</h1>
          <p style="color: #888; font-size: 14px; margin: 0 0 32px;">
            Here is your new verification code. It expires in <strong style="color: #f5f5f5;">10 minutes</strong>.
          </p>
          <div style="background: #1c1c1c; border: 1px solid #2e2e2e; border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 32px;">
            <p style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 12px;">Your verification code</p>
            <p style="font-size: 40px; font-weight: 700; letter-spacing: 0.25em; color: #aaff00; margin: 0; font-family: monospace;">${otp}</p>
          </div>
          <p style="color: #555; font-size: 12px; margin: 0;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[resend-otp]", err)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
