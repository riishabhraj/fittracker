import { NextResponse } from "next/server"
import { auth } from "@/auth"
import connectDB from "@/lib/mongoose"
import { User } from "@/lib/models/user"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectDB()
  const user = await User.findById(session.user.id)
    .select("name email image createdAt password")
    .lean() as { name: string; email: string; image?: string; createdAt?: Date; password?: string } | null
  if (!user) return NextResponse.json(null)
  const { password: _pw, ...rest } = user
  return NextResponse.json({ ...rest, isOAuthUser: !_pw })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: { name?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { name } = body
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 })

  await connectDB()
  const user = await User.findByIdAndUpdate(
    session.user.id,
    { $set: { name: name.trim() } },
    { new: true }
  ).select("name email image createdAt").lean()

  return NextResponse.json(user)
}
