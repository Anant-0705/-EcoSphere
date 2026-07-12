import { Suspense } from "react"
import {
  getEmissionFactors,
  getEnvironmentalGoals,
  getCarbonTransactions,
  getDepartmentScores,
} from "@/lib/services/environmental"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { IngestPanel } from "@/components/environmental/ingest-panel"
import { GoalsList } from "@/components/environmental/goals-list"
import { CarbonForm } from "@/components/environmental/carbon-form"
import { canIngest } from "@/lib/rbac"

export default async function EnvironmentalDashboardPage() {
  const session = await auth()
  const role = session?.user?.role
  const showIngest = canIngest(role)

  const [factors, goals, txns, scores, departments] = await Promise.all([
    getEmissionFactors(),
    getEnvironmentalGoals(),
    getCarbonTransactions(),
    getDepartmentScores(),
    prisma.department.findMany({ where: { status: "ACTIVE" } }),
  ])

  const totalCo2e = txns.reduce((sum, tx) => sum + tx.co2e, 0)

  const scopeEmissions = { "Scope 1": 0, "Scope 2": 0, "Scope 3": 0 }
  for (const tx of txns) {
    const ef = factors.find((f) => f.id === tx.emissionFactorId)
    if (ef) {
      if (ef.scope === "Scope 1" || ef.scope === "Scope 2" || ef.scope === "Scope 3") {
        scopeEmissions[ef.scope] += tx.co2e
      } else {
        scopeEmissions["Scope 3"] += tx.co2e
      }
    }
  }

  let avgEnvScore = 0
  if (scores.length > 0) {
    avgEnvScore = scores.reduce((sum, s) => sum + s.envScore, 0) / scores.length
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Environmental Dashboard
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Monitor your organization&apos;s carbon footprint and environmental goals.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Emissions
          </h3>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {Math.round(totalCo2e).toLocaleString()}{" "}
            <span className="text-sm text-gray-500">kgCO2e</span>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Org Env Score
          </h3>
          <div className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-500">
            {Math.round(avgEnvScore)} / 100
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Scope 1 (Direct)
          </h3>
          <div className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
            {Math.round(scopeEmissions["Scope 1"]).toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Scope 2 & 3 (Indirect)
          </h3>
          <div className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
            {Math.round(
              scopeEmissions["Scope 2"] + scopeEmissions["Scope 3"]
            ).toLocaleString()}
          </div>
        </div>
      </div>

      {showIngest && (
        <div className="grid gap-6 md:grid-cols-2">
          <Suspense
            fallback={
              <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                Loading ingestion…
              </div>
            }
          >
            <IngestPanel />
          </Suspense>
          <CarbonForm emissionFactors={factors} departments={departments} />
        </div>
      )}

      <GoalsList goals={goals} departments={departments} />

      <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Recent Transactions
          </h3>
          <div className="text-sm text-gray-500">Includes auto-ingested data</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800/50 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Ingested Via</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Dept</th>
                <th className="px-4 py-3 text-right">CO2e</th>
              </tr>
            </thead>
            <tbody>
              {txns.slice(0, 10).map((tx) => {
                const dept = departments.find((d) => d.id === tx.departmentId)
                return (
                  <tr key={tx.id} className="border-b dark:border-gray-700">
                    <td className="whitespace-nowrap px-4 py-3">
                      {tx.date.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {tx.source}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          tx.ingestSource === "UPLOAD"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                            : tx.ingestSource === "GMAIL"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {tx.ingestSource}
                      </span>
                    </td>
                    <td className="px-4 py-3">{tx.description}</td>
                    <td className="px-4 py-3">{dept?.name || "-"}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      {tx.co2e.toFixed(2)}
                    </td>
                  </tr>
                )
              })}
              {txns.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    No transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
