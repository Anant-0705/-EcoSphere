import { NextResponse } from "next/server"
import { redeemReward } from "@/lib/services/gamification"
import { auth } from "@/lib/auth"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const redemption = await redeemReward(session.user.id, id)
    return NextResponse.json(redemption)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
