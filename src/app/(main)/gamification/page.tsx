import { auth } from "@/lib/auth"
import { getLeaderboard, getActiveChallenges, getUserGamificationProfile, getRewards } from "@/lib/services/gamification"
import { ChallengesBoard } from "@/components/gamification/challenges"
import { Leaderboard } from "@/components/gamification/leaderboard"

export default async function GamificationPage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return <div>Unauthorized</div>
  }

  const [leaderboard, challenges, userProfile, rewards] = await Promise.all([
    getLeaderboard(),
    getActiveChallenges(),
    getUserGamificationProfile(userId),
    getRewards()
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Gamification Hub</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Earn XP, unlock badges, and redeem rewards by engaging in ESG activities.
        </p>
      </div>

      {/* User Profile Summary */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 text-center">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Your XP</h3>
          <div className="mt-2 text-4xl font-bold text-emerald-600 dark:text-emerald-500">{userProfile?.xp || 0}</div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 text-center">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Spendable Points</h3>
          <div className="mt-2 text-4xl font-bold text-blue-600 dark:text-blue-500">{userProfile?.points || 0}</div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">My Badges</h3>
          <div className="flex flex-wrap gap-2">
            {userProfile?.earnedBadges.map((eb: any) => (
              <span key={eb.id} title={eb.badge.name} className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl dark:bg-gray-800">
                {eb.badge.icon}
              </span>
            ))}
            {userProfile?.earnedBadges.length === 0 && (
              <span className="text-sm text-gray-500">No badges yet.</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <ChallengesBoard challenges={challenges} userProfile={userProfile} />
          
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Rewards Catalog</h3>
            {rewards.length === 0 ? (
              <p className="text-sm text-gray-500">No rewards available.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {rewards.map(r => (
                  <div key={r.id} className="rounded-lg border p-4 flex justify-between items-center dark:border-gray-800">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{r.name}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">{r.pointsRequired} Points (Stock: {r.stock})</p>
                    </div>
                    <button disabled className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-400 dark:bg-gray-800">
                      Redeem
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <Leaderboard users={leaderboard} />
        </div>
      </div>
    </div>
  )
}
