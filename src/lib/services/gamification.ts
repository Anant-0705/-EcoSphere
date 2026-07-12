import { PrismaClient } from "@prisma/client"
import { EventBus } from "../events"

const prisma = new PrismaClient()

// Evaluates rules like {"type":"XP","threshold":500} or {"type":"CHALLENGES_COMPLETED","threshold":5}
export async function evaluateBadgeUnlocks(userId: string) {
  const orgs = await prisma.organization.findMany({ take: 1 })
  if (!orgs[0] || !orgs[0].badgeAutoAward) return

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      earnedBadges: true,
      challengeParts: {
        where: { challenge: { status: 'COMPLETED' }, approval: 'APPROVED' }
      }
    }
  })

  if (!user) return

  const allBadges = await prisma.badge.findMany()
  const earnedBadgeIds = new Set(user.earnedBadges.map(eb => eb.badgeId))

  const completedChallengesCount = user.challengeParts.length

  for (const badge of allBadges) {
    if (earnedBadgeIds.has(badge.id)) continue

    let unlocked = false
    try {
      const rule = badge.unlockRule as any
      if (rule.type === 'XP' && typeof rule.threshold === 'number') {
        if (user.xp >= rule.threshold) unlocked = true
      } else if (rule.type === 'CHALLENGES_COMPLETED' && typeof rule.threshold === 'number') {
        if (completedChallengesCount >= rule.threshold) unlocked = true
      }
    } catch (e) {
      console.error(`Invalid unlock rule for badge ${badge.id}:`, e)
    }

    if (unlocked) {
      await prisma.employeeBadge.create({
        data: {
          employeeId: user.id,
          badgeId: badge.id
        }
      })
      EventBus.emit('BADGE_UNLOCKED', { userId: user.id, badgeId: badge.id })
    }
  }
}

// When challenge is approved, award XP
EventBus.on('CHALLENGE_APPROVED', async ({ participationId }) => {
  const p = await prisma.challengeParticipation.findUnique({
    where: { id: participationId },
    include: { challenge: true }
  })
  if (p && p.approval === 'APPROVED' && p.xpAwarded === 0) {
    // Award XP
    const user = await prisma.user.update({
      where: { id: p.employeeId },
      data: { xp: { increment: p.challenge.xp } }
    })
    await prisma.challengeParticipation.update({
      where: { id: p.id },
      data: { xpAwarded: p.challenge.xp }
    })
    EventBus.emit('XP_CHANGED', { userId: user.id })
  }
})

// When CSR is approved, award points
EventBus.on('CSR_APPROVED', async ({ participationId }) => {
  const p = await prisma.employeeParticipation.findUnique({
    where: { id: participationId },
    include: { activity: true }
  })
  if (p && p.approval === 'APPROVED' && p.pointsEarned === 0) {
    // Award spendable points (and maybe XP? Spec says pointsEarned, so points)
    await prisma.user.update({
      where: { id: p.employeeId },
      data: { points: { increment: p.activity.points } }
    })
    await prisma.employeeParticipation.update({
      where: { id: p.id },
      data: { pointsEarned: p.activity.points, completionDate: new Date() }
    })
  }
})

EventBus.on('XP_CHANGED', async ({ userId }) => {
  await evaluateBadgeUnlocks(userId)
})
