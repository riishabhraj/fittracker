import { NextResponse } from "next/server"
import { auth } from "@/auth"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/mongoose"
import { User } from "@/lib/models/user"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: { currentPassword?: string; newPassword?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { currentPassword, newPassword } = body
  if (!currentPassword || !newPassword)
    return NextResponse.json({ error: "Both fields are required" }, { status: 400 })
  if (newPassword.length < 8)
    return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 })

  await connectDB()
  const user = await User.findById(session.user.id).select("+password")
  if (!user?.password)
    return NextResponse.json(
      { error: "This account uses Google sign-in — no password to change" },
      { status: 400 }
    )

  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid)
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 })

  user.password = await bcrypt.hash(newPassword, 12)
  await user.save()

  return NextResponse.json({ success: true })
}
