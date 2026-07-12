import { getCarbonTransactions } from "@/lib/services/environmental"
import { getDepartmentScores } from "@/lib/services/environmental"

export default async function ReportsPage() {
  const [txns, scores] = await Promise.all([
    getCarbonTransactions(),
    getDepartmentScores()
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">ESG Reports</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          View and export raw environmental data and department scores.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Department ESG Scores</h3>
          <button className="text-sm rounded-md bg-emerald-600 px-3 py-1.5 font-medium text-white shadow-sm hover:bg-emerald-500">
            Export CSV
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800/50 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Env Score</th>
                <th className="px-4 py-3">Social Score</th>
                <th className="px-4 py-3">Gov Score</th>
                <th className="px-4 py-3 font-bold text-gray-900 dark:text-white">Total</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s) => (
                <tr key={s.id} className="border-b dark:border-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{s.department.name}</td>
                  <td className="px-4 py-3 text-emerald-600">{Math.round(s.envScore)}</td>
                  <td className="px-4 py-3 text-blue-600">{Math.round(s.socialScore)}</td>
                  <td className="px-4 py-3 text-indigo-600">{Math.round(s.govScore)}</td>
                  <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                    {Math.round((s.envScore + s.socialScore + s.govScore) / 3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Carbon Transactions Ledger</h3>
          <button className="text-sm rounded-md bg-emerald-600 px-3 py-1.5 font-medium text-white shadow-sm hover:bg-emerald-500">
            Export PDF
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800/50 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Scope</th>
                <th className="px-4 py-3 text-right">CO2e</th>
              </tr>
            </thead>
            <tbody>
              {txns.map((tx) => (
                <tr key={tx.id} className="border-b dark:border-gray-700">
                  <td className="px-4 py-3 whitespace-nowrap">{tx.date.toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{tx.source}</td>
                  <td className="px-4 py-3">{tx.description}</td>
                  <td className="px-4 py-3">{tx.emissionFactor.scope}</td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                    {tx.co2e.toFixed(2)}
                  </td>
                </tr>
              ))}
              {txns.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
