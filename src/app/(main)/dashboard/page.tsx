export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Organization Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Overview of your ESG performance and insights.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder cards for Overall Scores */}
        {["Overall ESG", "Environmental", "Social", "Governance"].map((title, i) => (
          <div key={i} className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title} Score</h3>
            <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">--</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* AI Advisor Panel Placeholder */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700 md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">ESG Advisor AI</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Intelligent insights based on your latest metrics.</p>
            </div>
            <button className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500">
              Get ESG Insights
            </button>
          </div>
          <div className="mt-6 flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">Click "Get ESG Insights" to generate AI analysis.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
