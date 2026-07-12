import { NextResponse } from "next/server"
import { z } from "zod"
import { createCarbonTransaction } from "@/lib/services/environmental"
import { auth } from "@/lib/auth"
import { canIngest } from "@/lib/rbac"

const carbonSchema = z.object({
  source: z.string(),
  description: z.string(),
  quantity: z.number().positive(),
  emissionFactorId: z.string(),
  departmentId: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (!canIngest(session.user.role)) {
      return NextResponse.json(
        { error: "Only ADMIN or MANAGER can log carbon transactions" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = carbonSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
    }

    const txn = await createCarbonTransaction(parsed.data)
    return NextResponse.json(txn)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
