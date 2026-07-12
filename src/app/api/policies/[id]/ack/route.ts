import { NextResponse } from "next/server"
import { acknowledgePolicy } from "@/lib/services/governance"
import { auth } from "@/lib/auth"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const ack = await acknowledgePolicy(session.user.id, id)
    return NextResponse.json(ack)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
