import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { approveCSR } from "@/lib/services/social"
import { canApprove } from "@/lib/rbac"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (!canApprove(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    // Managers can force-approve even without proof (demo / override)
    const result = await approveCSR(id, { force: true })
    return NextResponse.json({ success: true, participation: result })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Approve failed"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
