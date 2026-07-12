import { PrismaClient } from "@prisma/client"
import { EventBus } from "../events"

const prisma = new PrismaClient()

async function createNotification(userId: string, type: string, title: string, body: string) {
  const orgs = await prisma.organization.findMany({ take: 1 })
  const org = orgs[0]

  if (!org || !org.notifyInApp) return

  await prisma.notification.create({
    data: { userId, type, title, body }
  })

  // If email notifications were implemented, we would send an email here if org.notifyEmail is true.
  if (org.notifyEmail) {
    console.log(`[Email Mock] Sending email to User ${userId}: ${title} - ${body}`)
  }
}

EventBus.on('COMPLIANCE_ISSUE_NEW', async ({ issueId }) => {
  const issue = await prisma.complianceIssue.findUnique({ where: { id: issueId } })
  if (issue && issue.ownerId) {
    await createNotification(
      issue.ownerId, 
      'COMPLIANCE_ISSUE', 
      'New Compliance Issue Assigned', 
      `You have been assigned a new ${issue.severity} severity compliance issue.`
    )
  }
})

EventBus.on('OVERDUE_ISSUE', async ({ issueId }) => {
  const issue = await prisma.complianceIssue.findUnique({ where: { id: issueId } })
  if (issue && issue.ownerId) {
    await createNotification(
      issue.ownerId, 
      'COMPLIANCE_ISSUE', 
      'Compliance Issue Overdue', 
      `Your assigned compliance issue is now overdue. Please resolve it immediately.`
    )
  }
})

EventBus.on('CSR_APPROVED', async ({ participationId }) => {
  const p = await prisma.employeeParticipation.findUnique({ 
    where: { id: participationId }, include: { activity: true }
  })
  if (p) {
    await createNotification(
      p.employeeId, 
      'APPROVAL', 
      'CSR Activity Approved', 
      `Your participation in ${p.activity.title} has been approved. You earned ${p.pointsEarned} points!`
    )
  }
})

EventBus.on('CHALLENGE_APPROVED', async ({ participationId }) => {
  const p = await prisma.challengeParticipation.findUnique({ 
    where: { id: participationId }, include: { challenge: true }
  })
  if (p) {
    await createNotification(
      p.employeeId, 
      'APPROVAL', 
      'Challenge Progress Approved', 
      `Your progress in the ${p.challenge.title} challenge has been approved. You earned ${p.xpAwarded} XP!`
    )
  }
})

EventBus.on('POLICY_REMINDER', async ({ userId, policyId }) => {
  const policy = await prisma.eSGPolicy.findUnique({ where: { id: policyId } })
  if (policy) {
    await createNotification(
      userId, 
      'POLICY_REMINDER', 
      'Action Required: Acknowledge Policy', 
      `Please read and acknowledge the mandatory policy: ${policy.title}.`
    )
  }
})

EventBus.on('BADGE_UNLOCKED', async ({ userId, badgeId }) => {
  const badge = await prisma.badge.findUnique({ where: { id: badgeId } })
  if (badge) {
    await createNotification(
      userId, 
      'BADGE_UNLOCK', 
      'New Badge Unlocked!', 
      `Congratulations! You've earned the ${badge.name} badge ${badge.icon}.`
    )
  }
})
