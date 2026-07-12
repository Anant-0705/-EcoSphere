import { NextResponse } from "next/server"
import { checkOverdueIssues } from "@/lib/services/governance"
import { checkOverduePolicies } from "@/lib/services/policy"

export async function POST(req: Request) {
  try {
    // In a real app, verify a secret token or Vercel Cron header here
    const issuesResult = await checkOverdueIssues()
    const policiesUpdated = await checkOverduePolicies()
    return NextResponse.json({
      issuesUpdated: issuesResult.updatedCount,
      policiesUpdated
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
