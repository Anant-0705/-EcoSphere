import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { submitCSRProof } from "@/lib/services/social"

const schema = z.object({
  proofUrl: z.string().min(1),
})

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
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "proofUrl required" }, { status: 400 })
    }

    const part = await prisma.employeeParticipation.findUnique({ where: { id } })
    if (!part || part.employeeId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const updated = await submitCSRProof(id, parsed.data.proofUrl)
    return NextResponse.json({ success: true, participation: updated })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
