import { NextResponse } from "next/server"
import { auth } from "@/auth"
import connectDB from "@/lib/mongoose"
import { Profile } from "@/lib/models/profile"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: { date?: string; weight?: number; bodyFat?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { date, weight, bodyFat } = body
  if (!date || !weight) return NextResponse.json({ error: "date and weight are required" }, { status: 400 })

  await connectDB()
  const profile = await Profile.findOneAndUpdate(
    { userId: session.user.id },
    {
      $push: {
        weightHistory: {
          $each: [{ date: new Date(date), weight, ...(bodyFat !== undefined && { bodyFat }) }],
          $sort: { date: 1 },
        },
      },
    },
    { upsert: true, new: true }
  ).lean()

  return NextResponse.json(profile)
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: { date?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { date } = body
  if (!date) return NextResponse.json({ error: "date is required" }, { status: 400 })

  await connectDB()
  await Profile.findOneAndUpdate(
    { userId: session.user.id },
    { $pull: { weightHistory: { date: new Date(date) } } }
  )

  return NextResponse.json({ success: true })
}
