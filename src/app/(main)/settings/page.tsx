import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { canManageUsers } from "@/lib/rbac"
import { AdminPanel } from "@/components/settings/admin-panel"
import { getEmissionFactors } from "@/lib/services/environmental"

export default async function SettingsPage() {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return <div>Unauthorized</div>
  }

  const isAdmin = canManageUsers(user.role)

  const [users, factors, departments] = isAdmin
    ? await Promise.all([
        prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            departmentId: true,
            department: { select: { name: true } },
          },
          orderBy: { name: "asc" },
        }),
        getEmissionFactors(),
        prisma.department.findMany({
          where: { status: "ACTIVE" },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        }),
      ])
    : [[], [], []]

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Account info{isAdmin ? " and admin tools" : ""}.
        </p>
      </div>

      <div className="divide-y rounded-xl border bg-white shadow-sm dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Profile
          </h3>
          <div className="max-w-md space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <input
                type="text"
                disabled
                defaultValue={user.name || ""}
                className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                disabled
                defaultValue={user.email || ""}
                className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role
              </label>
              <input
                type="text"
                disabled
                defaultValue={user.role || ""}
                className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
          </div>
        </div>
      </div>

      {isAdmin ? (
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Admin
          </h2>
          <AdminPanel
            users={users as any}
            factors={factors as any}
            departments={departments as any}
          />
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Admin tools (users, emission factors, publish policies) are available to{" "}
          <strong>ADMIN</strong> only.
        </p>
      )}
    </div>
  )
}
