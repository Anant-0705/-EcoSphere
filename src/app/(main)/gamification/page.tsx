import { auth } from "@/lib/auth"
import {
  getLeaderboard,
  getActiveChallenges,
  getUserGamificationProfile,
  getRewards,
  getPendingChallengeParticipations,
} from "@/lib/services/gamification"
import { ChallengesBoard } from "@/components/gamification/challenges"
import { Leaderboard } from "@/components/gamification/leaderboard"
import { RewardsShop } from "@/components/gamification/rewards-shop"
import { canApprove } from "@/lib/rbac"

export default async function GamificationPage() {
  const session = await auth()
  const userId = session?.user?.id
  const role = session?.user?.role

  if (!userId) {
    return <div>Unauthorized</div>
  }

  const manager = canApprove(role)

  const [leaderboard, challenges, userProfile, rewards, pending] =
    await Promise.all([
      getLeaderboard(),
      getActiveChallenges(),
      getUserGamificationProfile(userId),
      getRewards(),
      manager ? getPendingChallengeParticipations() : Promise.resolve([]),
    ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Gamification Hub
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Earn XP, unlock badges, and redeem rewards by engaging in ESG activities.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Your XP</h3>
          <div className="mt-2 text-4xl font-bold text-emerald-600 dark:text-emerald-500">
            {userProfile?.xp || 0}
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Spendable Points
          </h3>
          <div className="mt-2 text-4xl font-bold text-blue-600 dark:text-blue-500">
            {userProfile?.points || 0}
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            My Badges
          </h3>
          <div className="flex flex-wrap gap-2">
            {userProfile?.earnedBadges.map((eb: { id: string; badge: { name: string; icon: string } }) => (
              <span
                key={eb.id}
                title={eb.badge.name}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl dark:bg-gray-800"
              >
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
        <div className="space-y-6 md:col-span-2">
          <ChallengesBoard
            challenges={challenges}
            userProfile={userProfile}
            canApprove={manager}
            pendingApprovals={pending}
          />
          <RewardsShop rewards={rewards} userPoints={userProfile?.points || 0} />
        </div>
        <div>
          <Leaderboard users={leaderboard} />
        </div>
      </div>
    </div>
  )
}
