"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  activities: any[]
  participations: any[]
  canApprove?: boolean
  pendingApprovals?: any[]
}

export function CSRList({
  activities,
  participations,
  canApprove = false,
  pendingApprovals = [],
}: Props) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [proofUrl, setProofUrl] = useState<Record<string, string>>({})
  const [error, setError] = useState("")

  const joinedIds = new Set(participations.map((p) => p.activityId))

  async function handleJoin(activityId: string) {
    setLoadingId(activityId)
    setError("")
    try {
      const res = await fetch("/api/participations/csr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to join")
      }
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed")
    } finally {
      setLoadingId(null)
    }
  }

  async function handleProof(participationId: string) {
    const url = proofUrl[participationId]?.trim()
    if (!url) return
    setLoadingId(participationId)
    setError("")
    try {
      const res = await fetch(`/api/participations/csr/${participationId}/proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proofUrl: url }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to submit proof")
      }
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed")
    } finally {
      setLoadingId(null)
    }
  }

  async function handleApprove(participationId: string) {
    setLoadingId(participationId)
    setError("")
    try {
      const res = await fetch(`/api/participations/csr/${participationId}/approve`, {
        method: "POST",
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Approve failed")
      }
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </p>
      )}

      {canApprove && pendingApprovals.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-6 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Pending CSR approvals ({pendingApprovals.length})
          </h3>
          <div className="space-y-3">
            {pendingApprovals.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-3 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {p.employee?.name} — {p.activity?.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {p.employee?.email}
                    {p.proofUrl ? ` · proof: ${p.proofUrl}` : " · no proof yet"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleApprove(p.id)}
                  disabled={loadingId === p.id}
                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  {loadingId === p.id ? "…" : "Approve"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Upcoming CSR Events
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          {activities.map((a) => {
            const hasJoined = joinedIds.has(a.id)
            const part = participations.find((p) => p.activityId === a.id)

            return (
              <div
                key={a.id}
                className="flex flex-col justify-between rounded-lg border p-4 dark:border-gray-800 dark:bg-gray-800/50"
              >
                <div>
                  <div className="mb-2 flex items-start justify-between">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{a.title}</h4>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                      {a.points} Pts
                    </span>
                  </div>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">{a.description}</p>
                  <p className="mb-4 text-xs font-medium text-gray-700 dark:text-gray-300">
                    Date: {new Date(a.date).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-4 space-y-2 border-t pt-4 dark:border-gray-700">
                  {!hasJoined ? (
                    <button
                      type="button"
                      onClick={() => handleJoin(a.id)}
                      disabled={loadingId === a.id}
                      className="w-full rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                    >
                      {loadingId === a.id ? "Joining..." : "Join Event"}
                    </button>
                  ) : part?.approval === "APPROVED" ? (
                    <span className="inline-block w-full rounded-md bg-blue-100 px-3 py-1.5 text-center text-sm font-semibold text-blue-700 dark:bg-blue-900/30">
                      Approved! +{part.pointsEarned || a.points} pts
                    </span>
                  ) : (
                    <div className="space-y-2">
                      <span className="inline-block w-full rounded-md bg-gray-100 px-3 py-1.5 text-center text-sm font-semibold text-gray-600 dark:bg-gray-700">
                        Pending approval
                      </span>
                      {!part?.proofUrl && (
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder="Proof URL (photo/link)"
                            className="flex-1 rounded-md border px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-800"
                            value={proofUrl[part.id] || ""}
                            onChange={(e) =>
                              setProofUrl((s) => ({ ...s, [part.id]: e.target.value }))
                            }
                          />
                          <button
                            type="button"
                            onClick={() => handleProof(part.id)}
                            disabled={loadingId === part.id}
                            className="rounded-md bg-gray-800 px-2 py-1 text-xs text-white dark:bg-gray-200 dark:text-gray-900"
                          >
                            Submit
                          </button>
                        </div>
                      )}
                      {part?.proofUrl && (
                        <p className="text-xs text-gray-500">Proof: {part.proofUrl}</p>
                      )}
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
    </div>
  )
}
