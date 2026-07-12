"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function IssuesBoard({ issues }: { issues: any[] }) {
  const router = useRouter()
  const [runningCron, setRunningCron] = useState(false)

  async function triggerCron() {
    setRunningCron(true)
    try {
      const res = await fetch("/api/cron/check-overdue", { method: "POST" })
      if (res.ok) router.refresh()
    } finally {
      setRunningCron(false)
    }
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Compliance Issues</h3>
        <button 
          onClick={triggerCron}
          disabled={runningCron}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-3 py-1 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          {runningCron ? "Running..." : "Run Nightly Overdue Check"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800/50 dark:text-gray-300">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Audit</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Severity</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <tr key={issue.id} className={`border-b dark:border-gray-700 ${issue.overdue ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                  {issue.title}
                  {issue.overdue && <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/50 dark:text-red-300">Overdue</span>}
                </td>
                <td className="px-4 py-3">{issue.audit?.title || '-'}</td>
                <td className="px-4 py-3 whitespace-nowrap">{new Date(issue.dueDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    issue.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                    issue.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {issue.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold">{issue.severity}</td>
              </tr>
            ))}
            {issues.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center">No compliance issues.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
