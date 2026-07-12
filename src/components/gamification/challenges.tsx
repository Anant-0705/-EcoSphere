"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  challenges: any[]
  userProfile: any
  canApprove?: boolean
  pendingApprovals?: any[]
}

export function ChallengesBoard({
  challenges,
  userProfile,
  canApprove = false,
  pendingApprovals = [],
}: Props) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [proofUrl, setProofUrl] = useState<Record<string, string>>({})
  const [error, setError] = useState("")

  const participations = userProfile?.challengeParts || []
  const joinedIds = new Set(participations.map((p: any) => p.challengeId))

  async function handleJoin(challengeId: string) {
    setLoadingId(challengeId)
    setError("")
    try {
      const res = await fetch("/api/participations/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId }),
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
    try {
      const res = await fetch(`/api/participations/challenge/${participationId}/proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proofUrl: url }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed")
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
      const res = await fetch(
        `/api/participations/challenge/${participationId}/approve`,
        { method: "POST" }
      )
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
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30">
          {error}
        </p>
      )}

      {canApprove && pendingApprovals.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-6 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Pending challenge approvals ({pendingApprovals.length})
          </h3>
          <div className="space-y-3">
            {pendingApprovals.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-3 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {p.employee?.name} — {p.challenge?.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {p.employee?.email} · {p.challenge?.xp} XP
                    {p.proofUrl ? ` · proof: ${p.proofUrl}` : ""}
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
          Active Challenges
        </h3>

        {challenges.length === 0 ? (
          <p className="text-sm text-gray-500">No active challenges available right now.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {challenges.map((c) => {
              const hasJoined = joinedIds.has(c.id)
              const part = participations.find((p: any) => p.challengeId === c.id)

              return (
                <div
                  key={c.id}
                  className="flex flex-col justify-between rounded-lg border p-4 dark:border-gray-800 dark:bg-gray-800/50"
                >
                  <div>
                    <div className="mb-2 flex items-start justify-between">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{c.title}</h4>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                        {c.xp} XP
                      </span>
                    </div>
                    <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                      {c.description}
                    </p>
                  </div>

                  <div className="mt-4 space-y-2 border-t pt-4 dark:border-gray-700">
                    {!hasJoined ? (
                      <button
                        type="button"
                        onClick={() => handleJoin(c.id)}
                        disabled={loadingId === c.id}
                        className="w-full rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                      >
                        {loadingId === c.id ? "Joining..." : "Join Challenge"}
                      </button>
                    ) : part?.approval === "APPROVED" ? (
                      <button
                        type="button"
                        disabled
                        className="w-full rounded-md bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/30"
                      >
                        Completed!
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Status:{" "}
                          <span className="text-amber-600 dark:text-amber-400">
                            {part.approval}
                          </span>
                        </div>
                        {!part.proofUrl && (
                          <div className="flex gap-2">
                            <input
                              type="url"
                              placeholder="Proof URL"
                              className="flex-1 rounded-md border px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-800"
                              value={proofUrl[part.id] || ""}
                              onChange={(e) =>
                                setProofUrl((s) => ({ ...s, [part.id]: e.target.value }))
                              }
                            />
                            <button
                              type="button"
                              onClick={() => handleProof(part.id)}
                              className="rounded-md bg-gray-800 px-2 py-1 text-xs text-white dark:bg-gray-200 dark:text-gray-900"
                            >
                              Submit
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
