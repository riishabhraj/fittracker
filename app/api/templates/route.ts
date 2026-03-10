import { NextResponse } from "next/server"
import { auth } from "@/auth"
import connectDB from "@/lib/mongoose"
import { Template } from "@/lib/models/template"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectDB()
  const templates = await Template.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean()

  return NextResponse.json(templates)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: { name?: string; exercises?: any[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const { name, exercises } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }
  if (!Array.isArray(exercises) || exercises.length === 0) {
    return NextResponse.json({ error: "At least one exercise is required" }, { status: 400 })
  }

  await connectDB()
  const template = await Template.create({
    userId: session.user.id,
    name: name.trim(),
    exercises: exercises.map((e: { id?: string; name: string; category?: string; sets?: Array<{ reps?: number; weight?: number }> }) => ({
      id: e.id ?? "",
      name: e.name,
      category: e.category ?? "",
      sets: (e.sets ?? []).map((s) => ({ reps: s.reps ?? 0, weight: s.weight ?? 0 })),
    })),
  })

  return NextResponse.json(template, { status: 201 })
}
