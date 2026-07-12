import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getCarbonTransactions } from "@/lib/services/environmental"
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

    const txns = await getCarbonTransactions()
    const header = "Date,Source,Ingested Via,Description,Scope,Quantity,CO2e,DepartmentId"
    const rows = txns.map((tx) => {
      const desc = `"${(tx.description || "").replace(/"/g, '""')}"`
      return [
        tx.date.toISOString().slice(0, 10),
        tx.source,
        tx.ingestSource,
        desc,
        tx.emissionFactor?.scope || "",
        tx.quantity,
        tx.co2e.toFixed(2),
        tx.departmentId || "",
      ].join(",")
    })

    const csv = [header, ...rows].join("\n")
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="ecosphere_carbon_ledger.csv"',
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Export failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
