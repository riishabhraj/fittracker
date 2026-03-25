import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import connectDB from "@/lib/mongoose"
import { AnalyticsEvent } from "@/lib/models/analytics"

export async function POST(req: NextRequest) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const { event, properties } = body
  if (!event || typeof event !== "string") {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  try {
    const session = await auth()
    await connectDB()
    await AnalyticsEvent.create({
      userId: session?.user?.id ?? null,
      event,
      properties: properties ?? {},
    })
  } catch (err) {
    // Never fail the client over analytics
    console.error("Analytics write error:", err)
  }

  return NextResponse.json({ ok: true })
}
