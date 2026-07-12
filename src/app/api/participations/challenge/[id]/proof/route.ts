import { NextResponse } from "next/server"
import { z } from "zod"
import { submitChallengeProof } from "@/lib/services/gamification"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

const proofSchema = z.object({
  proofUrl: z.string().min(1),
})

async function handleProof(req: Request, id: string, userId: string) {
  const body = await req.json()
  const parsed = proofSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "proofUrl required" }, { status: 400 })
  }

  const part = await prisma.challengeParticipation.findUnique({ where: { id } })
  if (!part || part.employeeId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const participation = await submitChallengeProof(id, parsed.data.proofUrl)
  return NextResponse.json(participation)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = await params
    return await handleProof(req, id, session.user.id)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return POST(req, { params })
}
