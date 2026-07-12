import { NextResponse } from "next/server"
import { checkOverdueIssues } from "@/lib/services/governance"

export async function POST(req: Request) {
  try {
    // In a real app, verify a secret token or Vercel Cron header here
    const result = await checkOverdueIssues()
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
