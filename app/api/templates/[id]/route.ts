import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { Types } from "mongoose"
import connectDB from "@/lib/mongoose"
import { Template } from "@/lib/models/template"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid template ID" }, { status: 400 })
  }

  await connectDB()
  const template = await Template.findOne({ _id: id, userId: session.user.id }).lean()
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(template)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid template ID" }, { status: 400 })
  }

  await connectDB()
  const result = await Template.findOneAndDelete({ _id: id, userId: session.user.id })
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({ success: true })
}
