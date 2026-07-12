import { NextResponse } from "next/server"
import { z } from "zod"
import { submitChallengeProof } from "@/lib/services/gamification"
import { auth } from "@/lib/auth"

const proofSchema = z.object({
  proofUrl: z.string().url()
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const parsed = proofSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
    }

    const participation = await submitChallengeProof(id, parsed.data.proofUrl)
    return NextResponse.json(participation)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
