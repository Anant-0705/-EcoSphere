import { NextResponse } from "next/server"
import { getEnvironmentalGoals } from "@/lib/services/environmental"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const deptId = searchParams.get('departmentId') ?? undefined

    const goals = await getEnvironmentalGoals(deptId)
    return NextResponse.json(goals)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
