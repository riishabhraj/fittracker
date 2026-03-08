import { NextRequest, NextResponse } from "next/server"
import { Types } from "mongoose"
import { auth } from "@/auth"
import connectDB from "@/lib/mongoose"
import { Workout } from "@/lib/models/workout"

function isValidObjectId(id: string) {
  return Types.ObjectId.isValid(id) && new Types.ObjectId(id).toString() === id
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    if (!isValidObjectId(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

    await connectDB()
    const workout = await Workout.findOne({ _id: id, userId: session.user.id }).lean()
    if (!workout) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ...(workout as any), id: (workout as any)._id.toString() })
  } catch (err) {
    console.error("GET /api/workouts/[id] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    if (!isValidObjectId(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

    let body: any
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    // Only allow updating safe fields — never userId
    const { userId: _u, _id: _i, ...safeFields } = body

    await connectDB()
    const workout = await Workout.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: safeFields },
      { new: true, runValidators: true }
    ).lean()
    if (!workout) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ...(workout as any), id: (workout as any)._id.toString() })
  } catch (err) {
    console.error("PUT /api/workouts/[id] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    if (!isValidObjectId(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

    await connectDB()
    const result = await Workout.deleteOne({ _id: id, userId: session.user.id })
    if (result.deletedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/workouts/[id] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
