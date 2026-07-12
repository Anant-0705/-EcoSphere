"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function ChallengesBoard({ challenges, userProfile }: { challenges: any[], userProfile: any }) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  
  const participations = userProfile?.challengeParts || []
  const joinedIds = new Set(participations.map((p: any) => p.challengeId))

  async function handleJoin(challengeId: string) {
    setLoadingId(challengeId)
    try {
      const res = await fetch("/api/participations/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId })
      })
      if (res.ok) router.refresh()
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Active Challenges</h3>
      
      {challenges.length === 0 ? (
        <p className="text-sm text-gray-500">No active challenges available right now.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {challenges.map((c) => {
            const hasJoined = joinedIds.has(c.id)
            const part = participations.find((p: any) => p.challengeId === c.id)

            return (
              <div key={c.id} className="rounded-lg border p-4 dark:border-gray-800 dark:bg-gray-800/50 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{c.title}</h4>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                      {c.xp} XP
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{c.description}</p>
                </div>
                
                <div className="mt-4 border-t pt-4 dark:border-gray-700">
                  {!hasJoined ? (
                    <button
                      onClick={() => handleJoin(c.id)}
                      disabled={loadingId === c.id}
                      className="w-full rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                    >
                      {loadingId === c.id ? "Joining..." : "Join Challenge"}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status: <span className="text-emerald-600 dark:text-emerald-400">{part.approval}</span>
                      </div>
                      {part.approval === 'PENDING' && (
                        <button
                          disabled
                          className="w-full rounded-md bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-500 dark:bg-gray-700"
                        >
                          Waiting for Approval
                        </button>
                      )}
                      {part.approval === 'APPROVED' && (
                        <button
                          disabled
                          className="w-full rounded-md bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/30"
                        >
                          Completed!
                        </button>
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
  )
}
