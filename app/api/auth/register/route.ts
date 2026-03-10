import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/mongoose"
import { User } from "@/lib/models/user"

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

    // Check if email already taken
    const existing = await User.findOne({ email: email.toLowerCase().trim() }).select("+password")
    if (existing) {
      const isOAuth = !existing.password
      return NextResponse.json({
        error: isOAuth
          ? "This email is linked to a Google account. Please sign in with Google instead."
          : "An account with this email already exists.",
      }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 10)

    await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error("POST /api/auth/register error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
