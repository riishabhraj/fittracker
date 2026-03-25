import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import connectDB from "@/lib/mongoose"
import { Goal } from "@/lib/models/goal"

const VALID_TYPES = ["strength", "habit", "consistency", "bodyweight"]

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectDB()
    const goals = await Goal.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean()
    return NextResponse.json(goals.map((g: any) => ({ ...g, id: g._id.toString() })))
  } catch (err) {
    console.error("GET /api/goals error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    let body: any
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    if (!body.title || typeof body.title !== "string") {
      return NextResponse.json({ error: "title is required" }, { status: 400 })
    }
    if (!VALID_TYPES.includes(body.type)) {
      return NextResponse.json({ error: `type must be one of: ${VALID_TYPES.join(", ")}` }, { status: 400 })
    }
    if (typeof body.target !== "number" || body.target <= 0) {
      return NextResponse.json({ error: "target must be a positive number" }, { status: 400 })
    }
    if (!body.unit || typeof body.unit !== "string") {
      return NextResponse.json({ error: "unit is required" }, { status: 400 })
    }

    await connectDB()

    // Free plan: max 3 goals
    const plan = (session.user as any).plan ?? "free"
    const trialEndsAt = (session.user as any).trialEndsAt ? new Date((session.user as any).trialEndsAt) : null
    const isPro = plan === "pro" || (trialEndsAt !== null && trialEndsAt > new Date())
    if (!isPro) {
      const count = await Goal.countDocuments({ userId: session.user.id })
      if (count >= 3) {
        return NextResponse.json({ error: "GOAL_LIMIT" }, { status: 402 })
      }
    }

    const doc = await Goal.create({ ...body, userId: session.user.id })
    return NextResponse.json({ ...doc.toObject(), id: doc._id.toString() }, { status: 201 })
  } catch (err) {
    console.error("POST /api/goals error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
