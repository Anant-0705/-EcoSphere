"use client"

export function Leaderboard({ users }: { users: any[] }) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Eco-Champions</h3>
      <div className="space-y-4">
        {users.map((user, index) => (
          <div key={user.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                index === 0 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-500" :
                index === 1 ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" :
                index === 2 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-600" :
                "bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-500"
              }`}>
                {index + 1}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                <p className="text-xs text-gray-500">{user.department?.name || 'No Dept'}</p>
              </div>
            </div>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {user.xp} XP
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-sm text-gray-500">No users found.</p>
        )}
      </div>
    </div>
  )
}
