import { auth } from "@/lib/auth"
import { getActiveCSRActivities, getUserCSRParticipations } from "@/lib/services/social"
import { PrismaClient } from "@prisma/client"
import { CSRList } from "@/components/social/csr-list"

const prisma = new PrismaClient()

export default async function SocialPage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return <div>Unauthorized</div>
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { department: true }
  })

  const [activities, participations, deptScores] = await Promise.all([
    getActiveCSRActivities(),
    getUserCSRParticipations(userId),
    user?.departmentId ? prisma.departmentScore.findUnique({ where: { departmentId: user.departmentId } }) : null
  ])

  // Mock diversity data for the dashboard visual
  const diversityMetrics = [
    { label: "Women in Leadership", value: "42%" },
    { label: "Pay Equity Gap", value: "< 1%" },
    { label: "Employee Satisfaction", value: "88/100" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Social Hub</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Engage in CSR activities and track our organizational diversity goals.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Department Social Score</h3>
          <div className="mt-2 text-4xl font-bold text-blue-600 dark:text-blue-500">{Math.round(deptScores?.socialScore || 0)} / 100</div>
        </div>
        
        {diversityMetrics.map((metric, i) => (
          <div key={i} className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{metric.label}</h3>
            <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">{metric.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6">
        <CSRList activities={activities} participations={participations} />
      </div>
    </div>
  )
}
