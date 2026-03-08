import { NextResponse } from "next/server"
import { auth } from "@/auth"
import connectDB from "@/lib/mongoose"
import { Profile } from "@/lib/models/profile"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectDB()
  const profile = await Profile.findOne({ userId: session.user.id }).lean()
  return NextResponse.json(profile ?? null)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const {
    goal,
    experienceLevel,
    height,
    weight,
    age,
    workoutDaysPerWeek,
    equipment,
    onboardingCompleted,
  } = body

  await connectDB()
  const profile = await Profile.findOneAndUpdate(
    { userId: session.user.id },
    {
      $set: {
        ...(goal !== undefined && { goal }),
        ...(experienceLevel !== undefined && { experienceLevel }),
        ...(height !== undefined && { height }),
        ...(weight !== undefined && { weight }),
        ...(age !== undefined && { age }),
        ...(workoutDaysPerWeek !== undefined && { workoutDaysPerWeek }),
        ...(equipment !== undefined && { equipment }),
        ...(onboardingCompleted !== undefined && { onboardingCompleted }),
      },
    },
    { upsert: true, new: true, runValidators: true }
  ).lean()

  return NextResponse.json(profile, { status: 200 })
}
