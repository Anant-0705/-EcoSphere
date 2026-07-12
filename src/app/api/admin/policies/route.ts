import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { canPublishPolicy } from "@/lib/rbac"
import { publishPolicy } from "@/lib/services/policy"

const schema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  mandatory: z.boolean().default(true),
  ackDeadline: z.string(), // ISO date
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || !canPublishPolicy(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
    }

    const policy = await publishPolicy(
      parsed.data.title,
      parsed.data.body,
      parsed.data.mandatory,
      new Date(parsed.data.ackDeadline)
    )
    return NextResponse.json(policy)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
