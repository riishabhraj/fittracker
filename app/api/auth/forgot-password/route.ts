import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { Resend } from "resend"
import connectDB from "@/lib/mongoose"
import { User } from "@/lib/models/user"
import { PasswordResetToken } from "@/lib/models/password-reset-token"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 })
    }

    await connectDB()
    const user = await User.findOne({ email: email.toLowerCase().trim() })

    // Always return success to prevent email enumeration
    if (!user || !user.password) {
      return NextResponse.json({ ok: true })
    }

    // Delete any existing tokens for this user
    await PasswordResetToken.deleteMany({ userId: user._id.toString() })

    // Create a new token valid for 1 hour
    const token = crypto.randomBytes(32).toString("hex")
    await PasswordResetToken.create({
      userId:    user._id.toString(),
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    })

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from:    process.env.RESEND_FROM_DOMAIN === "resend.dev"
               ? "FitTracker <onboarding@resend.dev>"
               : `FitTracker <noreply@${process.env.RESEND_FROM_DOMAIN ?? "fittracker.app"}>`,
      to:      user.email,
      subject: "Reset your FitTracker password",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #0f0f0f; color: #f5f5f5; border-radius: 16px;">
          <img src="${process.env.NEXTAUTH_URL}/fittracker-app-icon.png" alt="FitTracker" width="56" height="56" style="border-radius: 14px; margin-bottom: 24px; display: block;" />
          <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">Reset your password</h1>
          <p style="color: #888; font-size: 14px; margin: 0 0 32px;">
            We received a request to reset the password for your FitTracker account.
            Click the button below to choose a new password. This link expires in <strong style="color: #f5f5f5;">1 hour</strong>.
          </p>
          <a href="${resetUrl}"
            style="display: inline-block; background: #aaff00; color: #0f0f0f; font-weight: 700; font-size: 15px;
                   padding: 14px 32px; border-radius: 12px; text-decoration: none;">
            Reset Password
          </a>
          <p style="color: #555; font-size: 12px; margin: 32px 0 0;">
            If you didn't request this, you can safely ignore this email. Your password won't change.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[forgot-password]", err)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
