"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function PoliciesList({ policies, acks }: { policies: any[], acks: any[] }) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleAck(policyId: string) {
    setLoadingId(policyId)
    try {
      const res = await fetch(`/api/policies/${policyId}/ack`, {
        method: "POST"
      })
      if (res.ok) router.refresh()
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Mandatory Policies</h3>
      
      <div className="space-y-4">
        {policies.map(p => {
          const ackRecord = acks.find(a => a.policyId === p.id)
          const isAcked = ackRecord?.status === 'ACKNOWLEDGED'
          const isOverdue = ackRecord?.status === 'OVERDUE'
          return (
            <div key={p.id} className={`rounded-lg border p-4 flex justify-between items-center dark:border-gray-800 ${isOverdue ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10' : ''}`}>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{p.title} <span className="text-xs text-gray-500">v{p.version}</span></p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{p.body}</p>
                {isOverdue && <p className="text-xs font-bold text-red-600 mt-1">OVERDUE (Deadline: {new Date(p.ackDeadline).toLocaleDateString()})</p>}
              </div>
              {!isAcked ? (
                <button
                  onClick={() => handleAck(p.id)}
                  disabled={loadingId === p.id}
                  className={`rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50 ${isOverdue ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                >
                  {loadingId === p.id ? "Signing..." : "Acknowledge"}
                </button>
              ) : (
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-500">
                  ✓ Acknowledged
                </span>
              )}
            </div>
          )
        })}
        {policies.length === 0 && (
          <p className="text-sm text-gray-500">No mandatory policies active.</p>
        )}
      </div>
    </div>
  )
}
