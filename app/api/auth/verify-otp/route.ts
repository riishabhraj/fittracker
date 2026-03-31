import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/mongoose"
import { User } from "@/lib/models/user"
import { OtpToken } from "@/lib/models/otp-token"

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 })
    }
    if (!otp || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: "Invalid code format." }, { status: 400 })
    }

    await connectDB()

    const normalizedEmail = email.toLowerCase().trim()

    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 })
    }

    const token = await OtpToken.findOne({ email: normalizedEmail })
    if (!token) {
      return NextResponse.json({ error: "No verification code found. Please request a new one." }, { status: 400 })
    }

    if (token.expiresAt < new Date()) {
      await OtpToken.deleteOne({ _id: token._id })
      return NextResponse.json({ error: "Your code has expired. Please request a new one." }, { status: 400 })
    }

    if (token.attempts >= 5) {
      return NextResponse.json({ error: "Too many incorrect attempts. Please request a new code." }, { status: 400 })
    }

    const valid = await bcrypt.compare(otp, token.hashedOtp)
    if (!valid) {
      await OtpToken.updateOne({ _id: token._id }, { $inc: { attempts: 1 } })
      const attemptsLeft = 5 - (token.attempts + 1)
      return NextResponse.json({
        error: `Incorrect code. ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining.`,
        attemptsLeft,
      }, { status: 400 })
    }

    // Success — verify user and clear token
    await User.updateOne({ _id: user._id }, { $set: { emailVerified: new Date() } })
    await OtpToken.deleteOne({ _id: token._id })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[verify-otp]", err)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
