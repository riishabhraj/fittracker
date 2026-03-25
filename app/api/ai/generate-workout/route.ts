import { NextResponse } from "next/server"
import { auth } from "@/auth"
import Anthropic from "@anthropic-ai/sdk"
import connectDB from "@/lib/mongoose"
import { User } from "@/lib/models/user"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const isPro =
    session.user.plan === "pro" ||
    (session.user.plan === "free" &&
      session.user.trialEndsAt != null &&
      new Date(session.user.trialEndsAt) > new Date())

  if (!isPro) {
    await connectDB()
    const dbUser = await User.findById(session.user.id).select("aiGeneratorUsed")
    if (dbUser?.aiGeneratorUsed) {
      return NextResponse.json(
        { error: "You've used your free AI generation. Upgrade to Pro for unlimited workouts.", code: "AI_LIMIT" },
        { status: 402 }
      )
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI generator not configured. Add ANTHROPIC_API_KEY to .env.local." },
      { status: 503 }
    )
  }

  let body: { goal?: string; duration?: number; equipment?: string; muscles?: string; difficulty?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { goal, duration, equipment, muscles, difficulty } = body

  if (!goal || !duration || !equipment || !difficulty) {
    return NextResponse.json({ error: "Missing required fields: goal, duration, equipment, difficulty" }, { status: 400 })
  }

  const prompt = `You are a certified personal trainer. Generate a workout plan as JSON.

Requirements:
- Goal: ${goal}
- Duration: ${duration} minutes
- Equipment: ${equipment}
- Target muscles: ${muscles || "full body"}
- Difficulty: ${difficulty}

Return ONLY valid JSON — no markdown fences, no explanation. Use this exact schema:
{
  "workoutName": "descriptive name",
  "exercises": [
    {
      "name": "Exercise Name",
      "category": "one of: Chest | Back | Shoulders | Arms | Legs | Core | Cardio",
      "sets": 3,
      "reps": 10,
      "notes": "brief form tip or empty string"
    }
  ]
}

Rules:
- Include 4–7 exercises suited to the duration
- Use common exercise names (e.g. "Barbell Squats", "Push-ups")
- Adjust sets/reps for ${difficulty} difficulty
- For ${duration} min sessions, keep rest time in mind
- workoutName should be specific, e.g. "Upper Body Hypertrophy" not "Workout"`

  const client = new Anthropic({ apiKey })

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  })

  const raw = message.content[0].type === "text" ? message.content[0].text : ""

  // Safely extract JSON even if the model wraps it in backticks
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) {
    console.error("AI response could not be parsed:", raw)
    return NextResponse.json({ error: "AI returned an unexpected format. Please try again." }, { status: 500 })
  }

  try {
    const workout = JSON.parse(match[0])

    // Mark first-time use for free users
    if (!isPro) {
      await connectDB()
      await User.findByIdAndUpdate(session.user.id, { aiGeneratorUsed: true })
    }

    return NextResponse.json(workout)
  } catch {
    return NextResponse.json({ error: "AI returned invalid JSON. Please try again." }, { status: 500 })
  }
}
