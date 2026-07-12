import { PrismaClient, ApprovalStatus } from "@prisma/client"
import { EventBus } from "../events"

const prisma = new PrismaClient()

export async function getActiveCSRActivities() {
  return prisma.cSRActivity.findMany({
    orderBy: { date: 'asc' }
  })
}

export async function getUserCSRParticipations(userId: string) {
  return prisma.employeeParticipation.findMany({
    where: { employeeId: userId },
    include: { activity: true }
  })
}

export async function joinCSR(userId: string, activityId: string) {
  const existing = await prisma.employeeParticipation.findFirst({
    where: { employeeId: userId, activityId }
  })
  if (existing) throw new Error("Already joined")

  return prisma.employeeParticipation.create({
    data: {
      employeeId: userId,
      activityId
    }
  })
}

export async function submitCSRProof(participationId: string, proofUrl: string) {
  return prisma.employeeParticipation.update({
    where: { id: participationId },
    data: { proofUrl }
  })
}

export async function approveCSR(
  participationId: string,
  opts?: { force?: boolean }
) {
  const p = await prisma.employeeParticipation.findUnique({
    where: { id: participationId },
    include: { activity: true },
  })
  if (!p) throw new Error("Not found")
  if (p.approval === ApprovalStatus.APPROVED) return p

  const org = await prisma.organization.findFirst()
  if (org?.evidenceRequired && !p.proofUrl && !opts?.force) {
    throw new Error("Evidence required before approval")
  }

  const updated = await prisma.employeeParticipation.update({
    where: { id: participationId },
    data: { approval: ApprovalStatus.APPROVED },
  })

  EventBus.emit("CSR_APPROVED", { participationId: updated.id })
  return updated
}

export async function getPendingCSRParticipations() {
  return prisma.employeeParticipation.findMany({
    where: { approval: ApprovalStatus.PENDING },
    include: {
      employee: { select: { id: true, name: true, email: true, departmentId: true } },
      activity: true,
    },
    orderBy: { id: "desc" },
  })
}
