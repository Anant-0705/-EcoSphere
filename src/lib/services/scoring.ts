import { PrismaClient, ApprovalStatus, IssueStatus } from "@prisma/client"
import { EventBus } from "../events"

const prisma = new PrismaClient()

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

export async function recomputeDepartmentEnvScore(deptId: string) {
  const dept = await prisma.department.findUnique({ where: { id: deptId } })
  if (!dept) return

  const goals = await prisma.environmentalGoal.findMany({ where: { departmentId: deptId } })
  
  let envScore = 50
  if (goals.length > 0) {
    let totalProgress = 0
    for (const g of goals) {
      // Avoid division by zero if target == baseline
      const range = g.target - g.baseline
      let progress = 0
      if (range !== 0) {
        progress = ((g.current - g.baseline) / range) * 100
      }
      totalProgress += clamp(progress, 0, 100)
    }
    envScore = totalProgress / goals.length
  }

  // Calculate emissions modifier
  const allDepts = await prisma.department.findMany({ where: { status: 'ACTIVE' } })
  const totalEmployees = allDepts.reduce((sum, d) => sum + d.employeeCount, 0)
  
  const allTxns = await prisma.carbonTransaction.findMany()
  const orgTotalCo2e = allTxns.reduce((sum, tx) => sum + tx.co2e, 0)
  const deptTxns = allTxns.filter(tx => tx.departmentId === deptId)
  const deptCo2e = deptTxns.reduce((sum, tx) => sum + tx.co2e, 0)

  const orgAvgPerEmployee = orgTotalCo2e / Math.max(totalEmployees, 1)
  const deptCO2ePerEmployee = deptCo2e / Math.max(dept.employeeCount, 1)

  let modifier = 0
  if (orgAvgPerEmployee > 0) {
    modifier = 50 * (orgAvgPerEmployee - deptCO2ePerEmployee) / orgAvgPerEmployee
  }
  modifier = clamp(modifier, -20, +20)

  envScore = clamp(envScore + modifier, 0, 100)
  
  await saveDepartmentScore(deptId, { envScore })
}

export async function recomputeDepartmentSocialScore(deptId: string) {
  const dept = await prisma.department.findUnique({ where: { id: deptId }, include: { users: true } })
  if (!dept) return

  const employeeIds = dept.users.map(u => u.id)
  
  const approvedCSR = await prisma.employeeParticipation.count({
    where: {
      employeeId: { in: employeeIds },
      approval: ApprovalStatus.APPROVED
    }
  })

  const csrRate = clamp((approvedCSR / Math.max(dept.employeeCount, 1)) * 50, 0, 100)
  const trainingRate = 50 // Not fully tracked in MVP, default 50 as per spec

  const socialScore = clamp((0.6 * csrRate) + (0.4 * trainingRate), 0, 100)
  await saveDepartmentScore(deptId, { socialScore })
}

export async function recomputeDepartmentGovScore(deptId: string) {
  const dept = await prisma.department.findUnique({ where: { id: deptId }, include: { users: true } })
  if (!dept) return

  const employeeIds = dept.users.map(u => u.id)

  const requiredPolicies = await prisma.eSGPolicy.count({ where: { mandatory: true } })
  
  // Acks by dept employees for mandatory policies
  const acks = await prisma.policyAcknowledgement.count({
    where: {
      employeeId: { in: employeeIds },
      policy: { mandatory: true }
    }
  })

  let ackRate = 100
  if (requiredPolicies > 0 && dept.employeeCount > 0) {
    ackRate = clamp((acks / (requiredPolicies * dept.employeeCount)) * 100, 0, 100)
  }

  const openIssues = await prisma.complianceIssue.count({
    where: {
      ownerId: { in: employeeIds },
      status: { not: IssueStatus.RESOLVED }
    }
  })

  const overdueIssues = await prisma.complianceIssue.count({
    where: {
      ownerId: { in: employeeIds },
      status: { not: IssueStatus.RESOLVED },
      overdue: true
    }
  })

  const complianceHealth = clamp(100 - (openIssues * 5) - (overdueIssues * 10), 0, 100)
  const govScore = clamp((0.5 * ackRate) + (0.5 * complianceHealth), 0, 100)

  await saveDepartmentScore(deptId, { govScore })
}

async function saveDepartmentScore(deptId: string, updates: { envScore?: number, socialScore?: number, govScore?: number }) {
  const orgs = await prisma.organization.findMany({ take: 1 })
  const org = orgs[0]

  let score = await prisma.departmentScore.findUnique({ where: { departmentId: deptId } })
  if (!score) {
    score = await prisma.departmentScore.create({
      data: { departmentId: deptId }
    })
  }

  const env = updates.envScore ?? score.envScore
  const social = updates.socialScore ?? score.socialScore
  const gov = updates.govScore ?? score.govScore

  let totalScore = 0
  if (org) {
    totalScore = (env * org.weightEnv + social * org.weightSocial + gov * org.weightGov) / 100
  }

  await prisma.departmentScore.update({
    where: { departmentId: deptId },
    data: {
      envScore: env,
      socialScore: social,
      govScore: gov,
      totalScore
    }
  })
}

// Subscribe to relevant events
EventBus.on('CARBON_TXN_CREATED', async ({ deptId }) => {
  await recomputeDepartmentEnvScore(deptId)
})

EventBus.on('CSR_APPROVED', async ({ participationId }) => {
  const p = await prisma.employeeParticipation.findUnique({ 
    where: { id: participationId }, 
    include: { employee: true } 
  })
  if (p?.employee?.departmentId) {
    await recomputeDepartmentSocialScore(p.employee.departmentId)
  }
})

EventBus.on('COMPLIANCE_ISSUE_NEW', async ({ issueId }) => {
  const issue = await prisma.complianceIssue.findUnique({
    where: { id: issueId },
    include: { owner: true }
  })
  if (issue?.owner?.departmentId) {
    await recomputeDepartmentGovScore(issue.owner.departmentId)
  }
})

EventBus.on('OVERDUE_ISSUE', async ({ issueId }) => {
  const issue = await prisma.complianceIssue.findUnique({
    where: { id: issueId },
    include: { owner: true }
  })
  if (issue?.owner?.departmentId) {
    await recomputeDepartmentGovScore(issue.owner.departmentId)
  }
})

EventBus.on('POLICY_ACK', async ({ userId }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (user?.departmentId) {
    await recomputeDepartmentGovScore(user.departmentId)
  }
})
