import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/mongoose"
import { User } from "@/lib/models/user"
import { PasswordResetToken } from "@/lib/models/password-reset-token"

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Invalid reset link." }, { status: 400 })
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 })
    }

    await connectDB()

    const record = await PasswordResetToken.findOne({ token, used: false })
    if (!record) {
      return NextResponse.json({ error: "This reset link is invalid or has already been used." }, { status: 400 })
    }
    if (record.expiresAt < new Date()) {
      await PasswordResetToken.deleteOne({ _id: record._id })
      return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 12)
    await User.updateOne({ _id: record.userId }, { $set: { password: hashed } })

    // Mark token as used so it can't be reused
    await PasswordResetToken.updateOne({ _id: record._id }, { $set: { used: true } })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[reset-password]", err)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
