import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { canManageEmissionFactors } from "@/lib/rbac"

const schema = z.object({
  name: z.string().min(1),
  scope: z.string().min(1),
  unit: z.string().min(1),
  factor: z.number().positive(),
  source: z.string().optional(),
  keywords: z.array(z.string()).optional(),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || !canManageEmissionFactors(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
    }

    const factor = await prisma.emissionFactor.create({
      data: {
        name: parsed.data.name,
        scope: parsed.data.scope,
        unit: parsed.data.unit,
        factor: parsed.data.factor,
        source: parsed.data.source,
        keywords: parsed.data.keywords || [],
      },
    })
    return NextResponse.json(factor)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
