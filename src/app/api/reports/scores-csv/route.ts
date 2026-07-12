import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDepartmentScores } from "@/lib/services/environmental"
import { canViewOrgReports } from "@/lib/rbac"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (!canViewOrgReports(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const scores = await getDepartmentScores()
    const header = "Department,Env Score,Social Score,Gov Score,Total"
    const rows = scores.map((s) => {
      const total = Math.round((s.envScore + s.socialScore + s.govScore) / 3)
      const name = `"${s.department.name.replace(/"/g, '""')}"`
      return [
        name,
        Math.round(s.envScore),
        Math.round(s.socialScore),
        Math.round(s.govScore),
        total,
      ].join(",")
    })

    const csv = [header, ...rows].join("\n")
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="ecosphere_department_scores.csv"',
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Export failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
