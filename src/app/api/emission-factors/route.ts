import { NextResponse } from "next/server"
import { getEmissionFactors } from "@/lib/services/environmental"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const factors = await getEmissionFactors()
    return NextResponse.json(factors)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
