import { auth } from "@/lib/auth"

export default async function SettingsPage() {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return <div>Unauthorized</div>
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="rounded-xl border bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800 divide-y dark:divide-gray-800">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Profile Information</h3>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input type="text" disabled defaultValue={user.name || ''} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-500 dark:bg-gray-800 dark:border-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" disabled defaultValue={user.email || ''} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-500 dark:bg-gray-800 dark:border-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <input type="text" disabled defaultValue={user.role || ''} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-500 dark:bg-gray-800 dark:border-gray-700" />
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Email Alerts</p>
                <p className="text-sm text-gray-500">Receive an email when you are assigned a new compliance issue.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Gamification Weekly Summary</p>
                <p className="text-sm text-gray-500">Get a weekly recap of your XP and Leaderboard standing.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
