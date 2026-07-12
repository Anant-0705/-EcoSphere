import { PrismaClient } from '@prisma/client'
import { EventBus } from '../events'

const prisma = new PrismaClient()

export async function publishPolicy(title: string, body: string, mandatory: boolean, ackDeadline: Date) {
  // 1. Create the policy
  const policy = await prisma.eSGPolicy.create({
    data: {
      title,
      body,
      mandatory,
      ackDeadline
    }
  })

  // 2. If mandatory, auto-create PENDING obligations for ALL employees
  if (mandatory) {
    const users = await prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      select: { id: true }
    })

    if (users.length > 0) {
      const acks = users.map(u => ({
        policyId: policy.id,
        employeeId: u.id,
        status: 'PENDING' as const
      }))
      
      await prisma.policyAcknowledgement.createMany({
        data: acks
      })
    }
  }

  // 3. Emit event
  EventBus.emit('POLICY_PUBLISHED', { policyId: policy.id })

  return policy
}

export async function checkOverduePolicies() {
  const now = new Date()
  
  // Find all PENDING acks where the policy deadline has passed
  const overdueAcks = await prisma.policyAcknowledgement.findMany({
    where: {
      status: 'PENDING',
      policy: {
        ackDeadline: { lt: now }
      }
    },
    include: {
      policy: true,
      employee: {
        select: { departmentId: true }
      }
    }
  })

  if (overdueAcks.length === 0) return 0

  let updatedCount = 0
  for (const ack of overdueAcks) {
    // 1. Mark as OVERDUE
    await prisma.policyAcknowledgement.update({
      where: { id: ack.id },
      data: { status: 'OVERDUE' }
    })
    
    // 2. Penalize Gov score for that department
    if (ack.employee.departmentId) {
      await prisma.departmentScore.update({
        where: { departmentId: ack.employee.departmentId },
        data: { govScore: { decrement: 2 } } // Deduct 2 points for missing deadline
      })
      EventBus.emit('SCORE_CHANGED', { deptId: ack.employee.departmentId })
    }

    updatedCount++
  }

  return updatedCount
}
