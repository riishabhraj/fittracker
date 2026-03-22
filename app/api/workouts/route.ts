import { NextRequest, NextResponse } from "next/server"
import { Types } from "mongoose"
import { auth } from "@/auth"
import connectDB from "@/lib/mongoose"
import { Workout } from "@/lib/models/workout"

function isValidObjectId(id: string) {
  return Types.ObjectId.isValid(id) && new Types.ObjectId(id).toString() === id
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectDB()
    const workouts = await Workout.find({ userId: session.user.id })
      .sort({ date: -1 })
      .limit(500)
      .lean()
    return NextResponse.json(workouts.map((w: any) => ({ ...w, id: w._id.toString() })))
  } catch (err) {
    console.error("GET /api/workouts error:", err)
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

    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400 })
    }
    if (!body.date || typeof body.date !== "string") {
      return NextResponse.json({ error: "date is required" }, { status: 400 })
    }
    if (!Array.isArray(body.exercises)) {
      return NextResponse.json({ error: "exercises must be an array" }, { status: 400 })
    }

    await connectDB()

    const fields = {
      name: body.name,
      date: body.date,
      duration: Number(body.duration) || 0,
      exercises: body.exercises,
      totalSets: Number(body.totalSets) || 0,
      totalReps: Number(body.totalReps) || 0,
      totalWeight: Number(body.totalWeight) || 0,
      personalRecords: Number(body.personalRecords) || 0,
      usedTemplate: Boolean(body.usedTemplate),
      usedAIGenerate: Boolean(body.usedAIGenerate),
      userId: session.user.id,
    }

    // If a valid ObjectId is provided, upsert — prevents duplicates when
    // the same session is finished multiple times (back button, app resume, etc.)
    if (body.id && isValidObjectId(body.id)) {
      const doc = await Workout.findOneAndUpdate(
        { _id: body.id, userId: session.user.id },
        { $set: fields },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
      return NextResponse.json({ ...doc.toObject(), id: doc._id.toString() }, { status: 200 })
    }

    const doc = await Workout.create(fields)
    return NextResponse.json({ ...doc.toObject(), id: doc._id.toString() }, { status: 201 })
  } catch (err) {
    console.error("POST /api/workouts error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
