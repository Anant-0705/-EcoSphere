import { NextResponse } from "next/server"
import { z } from "zod"
import { joinCSR } from "@/lib/services/social"
import { auth } from "@/lib/auth"

const joinSchema = z.object({
  activityId: z.string()
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = joinSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
    }

    const participation = await joinCSR(session.user.id, parsed.data.activityId)
    return NextResponse.json(participation)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
