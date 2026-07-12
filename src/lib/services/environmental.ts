import { PrismaClient } from "@prisma/client"
import { EventBus } from "../events"

const prisma = new PrismaClient()

export async function createCarbonTransaction(data: {
  source: string
  description: string
  quantity: number
  emissionFactorId: string
  departmentId?: string
  auto?: boolean
}) {
  const ef = await prisma.emissionFactor.findUnique({
    where: { id: data.emissionFactorId }
  })
  
  if (!ef) {
    throw new Error("Emission Factor not found")
  }

  const co2e = data.quantity * ef.factor

  const txn = await prisma.carbonTransaction.create({
    data: {
      source: data.source,
      description: data.description,
      quantity: data.quantity,
      emissionFactorId: data.emissionFactorId,
      co2e,
      departmentId: data.departmentId,
      auto: data.auto ?? false
    }
  })

  // Emit event if it belongs to a department so the scoring engine recalculates
  if (txn.departmentId) {
    EventBus.emit('CARBON_TXN_CREATED', { deptId: txn.departmentId })
  }

  return txn
}

export async function getEmissionFactors() {
  return prisma.emissionFactor.findMany({
    orderBy: { name: 'asc' }
  })
}

export async function getEnvironmentalGoals(departmentId?: string) {
  return prisma.environmentalGoal.findMany({
    where: departmentId ? { departmentId } : undefined,
    orderBy: { deadline: 'asc' }
  })
}

export async function getCarbonTransactions(departmentId?: string) {
  return prisma.carbonTransaction.findMany({
    where: departmentId ? { departmentId } : undefined,
    orderBy: { date: 'desc' },
    include: { emissionFactor: true }
  })
}

export async function getDepartmentScores() {
  return prisma.departmentScore.findMany({
    include: { department: true }
  })
}
