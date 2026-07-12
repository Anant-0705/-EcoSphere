"use client"

export function GoalsList({ goals, departments }: { goals: any[], departments: any[] }) {
  if (goals.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Active Environmental Goals</h3>
        <p className="text-sm text-gray-500">No active goals found.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Active Environmental Goals</h3>
      <div className="space-y-6">
        {goals.map((goal) => {
          const dept = departments.find(d => d.id === goal.departmentId)
          const range = goal.target - goal.baseline
          let progress = 0
          if (range !== 0) {
            progress = ((goal.current - goal.baseline) / range) * 100
          }
          progress = Math.max(0, Math.min(100, progress))

          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{goal.title}</p>
                  <p className="text-xs text-gray-500">
                    {dept?.name || "Org-wide"} • Target: {goal.target} {goal.metric}
                  </p>
                </div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.round(progress)}%
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
