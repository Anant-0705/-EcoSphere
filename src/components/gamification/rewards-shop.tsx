"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export function RewardsShop({ rewards, userPoints }: { rewards: any[], userPoints: number }) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState("")

  async function handleRedeem(rewardId: string) {
    setLoadingId(rewardId)
    setError("")
    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to redeem reward")
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Rewards Catalog</h3>
      {error && <div className="mb-4 text-sm text-red-500">{error}</div>}
      
      {rewards.length === 0 ? (
        <p className="text-sm text-gray-500">No rewards available.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rewards.map(r => {
            const canAfford = userPoints >= r.pointsRequired
            const isOutOfStock = r.stock <= 0
            const isDisabled = !canAfford || isOutOfStock || loadingId === r.id

            return (
              <div key={r.id} className="rounded-lg border p-4 flex justify-between items-center dark:border-gray-800 dark:bg-gray-800/50">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{r.name}</p>
                  <p className={`text-xs ${canAfford ? 'text-blue-600 dark:text-blue-400' : 'text-red-500'}`}>
                    {r.pointsRequired} Points (Stock: {r.stock})
                  </p>
                </div>
                <button 
                  onClick={() => handleRedeem(r.id)}
                  disabled={isDisabled} 
                  className={`rounded-md px-3 py-1.5 text-sm font-medium flex items-center justify-center min-w-[80px] transition-colors ${
                    !isDisabled 
                      ? "bg-blue-600 text-white hover:bg-blue-500" 
                      : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                  }`}
                >
                  {loadingId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : (isOutOfStock ? "Out" : "Redeem")}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
