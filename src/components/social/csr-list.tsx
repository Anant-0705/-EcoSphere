"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function CSRList({ activities, participations }: { activities: any[], participations: any[] }) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const joinedIds = new Set(participations.map(p => p.activityId))

  async function handleJoin(activityId: string) {
    setLoadingId(activityId)
    try {
      const res = await fetch("/api/participations/csr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId })
      })
      if (res.ok) router.refresh()
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Upcoming CSR Events</h3>
      
      <div className="grid gap-4 md:grid-cols-2">
        {activities.map(a => {
          const hasJoined = joinedIds.has(a.id)
          const part = participations.find(p => p.activityId === a.id)

          return (
            <div key={a.id} className="rounded-lg border p-4 flex flex-col justify-between dark:border-gray-800 dark:bg-gray-800/50">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{a.title}</h4>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                    {a.points} Pts
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{a.description}</p>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Date: {new Date(a.date).toLocaleDateString()}
                </p>
              </div>
              
              <div className="mt-4 border-t pt-4 dark:border-gray-700">
                {!hasJoined ? (
                  <button
                    onClick={() => handleJoin(a.id)}
                    disabled={loadingId === a.id}
                    className="w-full rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                  >
                    {loadingId === a.id ? "Joining..." : "Join Event"}
                  </button>
                ) : (
                  <div className="space-y-2 text-center">
                    <span className={`inline-block w-full rounded-md px-3 py-1.5 text-sm font-semibold ${
                      part.approval === 'APPROVED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' : 'bg-gray-100 text-gray-500 dark:bg-gray-700'
                    }`}>
                      {part.approval === 'APPROVED' ? "Approved!" : "Pending Approval"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        {activities.length === 0 && (
          <p className="text-sm text-gray-500">No active CSR activities.</p>
        )}
      </div>
    </div>
  )
}
