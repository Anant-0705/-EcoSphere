import { PrismaClient, IssueStatus } from "@prisma/client"
import { EventBus } from "../events"

const prisma = new PrismaClient()

export async function getMandatoryPolicies() {
  return prisma.eSGPolicy.findMany({
    where: { mandatory: true }
  })
}

export async function getUserAcknowledgements(userId: string) {
  return prisma.policyAcknowledgement.findMany({
    where: { employeeId: userId }
  })
}

export async function acknowledgePolicy(userId: string, policyId: string) {
  const existing = await prisma.policyAcknowledgement.findUnique({
    where: { policyId_employeeId: { policyId, employeeId: userId } }
  })
  if (existing) return existing

  const ack = await prisma.policyAcknowledgement.create({
    data: { policyId, employeeId: userId }
  })
  
  EventBus.emit('POLICY_ACK', { policyId, userId })
  return ack
}

export async function getComplianceIssues(departmentId?: string) {
  return prisma.complianceIssue.findMany({
    where: departmentId ? { owner: { departmentId } } : undefined,
    include: { owner: true, audit: true },
    orderBy: { dueDate: 'asc' }
  })
}

export async function updateIssueStatus(issueId: string, status: IssueStatus) {
  const issue = await prisma.complianceIssue.update({
    where: { id: issueId },
    data: { status }
  })
  // If resolved, it might change score or clear overdue flag
  if (status === IssueStatus.RESOLVED && issue.overdue) {
    await prisma.complianceIssue.update({
      where: { id: issueId },
      data: { overdue: false }
    })
  }
  // Force score recompute by emitting event
  // Re-using OVERDUE_ISSUE or creating a specific one. Actually COMPLIANCE_ISSUE_NEW triggers score update in Phase 2
  EventBus.emit('COMPLIANCE_ISSUE_NEW', { issueId }) 
  return issue
}

export async function checkOverdueIssues() {
  const now = new Date()
  const issues = await prisma.complianceIssue.findMany({
    where: {
      status: { not: IssueStatus.RESOLVED },
      dueDate: { lt: now },
      overdue: false
    }
  })

  let count = 0
  for (const issue of issues) {
    await prisma.complianceIssue.update({
      where: { id: issue.id },
      data: { overdue: true }
    })
    EventBus.emit('OVERDUE_ISSUE', { issueId: issue.id })
    count++
  }
  return { updatedCount: count }
}
