import { auth } from "@/lib/auth"
import { getMandatoryPolicies, getUserAcknowledgements, getComplianceIssues } from "@/lib/services/governance"
import { PrismaClient } from "@prisma/client"
import { PoliciesList } from "@/components/governance/policies-list"
import { IssuesBoard } from "@/components/governance/issues-board"

const prisma = new PrismaClient()

export default async function GovernancePage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return <div>Unauthorized</div>
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { department: true }
  })

  const [policies, acks, issues, deptScores] = await Promise.all([
    getMandatoryPolicies(),
    getUserAcknowledgements(userId),
    getComplianceIssues(user?.departmentId || undefined),
    user?.departmentId ? prisma.departmentScore.findUnique({ where: { departmentId: user.departmentId } }) : null
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Governance Hub</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Manage compliance issues and acknowledge corporate policies.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Department Gov Score</h3>
          <div className="mt-2 text-4xl font-bold text-indigo-600 dark:text-indigo-500">{Math.round(deptScores?.govScore || 0)} / 100</div>
        </div>
        
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Policies</h3>
          <div className="mt-2 text-4xl font-bold text-gray-900 dark:text-gray-100">
            {policies.length - acks.length}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Overdue Issues</h3>
          <div className="mt-2 text-4xl font-bold text-red-600 dark:text-red-500">
            {issues.filter(i => i.overdue).length}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <IssuesBoard issues={issues} />
        </div>
        <div>
          <PoliciesList policies={policies} acks={acks} />
        </div>
      </div>
    </div>
  )
}
