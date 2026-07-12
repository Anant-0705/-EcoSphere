import { PrismaClient } from '@prisma/client'
import { EventBus } from '../src/lib/events'
import '../src/lib/init-services'

const prisma = new PrismaClient()

async function test() {
  console.log("Fetching an engineering department...")
  const eng = await prisma.department.findFirst({ where: { name: 'Engineering' } })
  if (!eng) {
    console.error("Engineering department not found")
    process.exit(1)
  }

  console.log("Initial department score for Engineering:")
  const initialScore = await prisma.departmentScore.findUnique({ where: { departmentId: eng.id } })
  console.log(initialScore)

  console.log("Emitting CARBON_TXN_CREATED event to trigger env score recomputation...")
  EventBus.emit('CARBON_TXN_CREATED', { deptId: eng.id })

  // Wait a bit for async handlers to finish
  await new Promise(resolve => setTimeout(resolve, 2000))

  console.log("Updated department score for Engineering:")
  const updatedScore = await prisma.departmentScore.findUnique({ where: { departmentId: eng.id } })
  console.log(updatedScore)

  console.log("Test complete.")
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
