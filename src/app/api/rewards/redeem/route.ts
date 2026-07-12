import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { rewardId } = await req.json()
    if (!rewardId) {
      return NextResponse.json({ error: 'Reward ID is required' }, { status: 400 })
    }

    const userId = session.user.id

    // Run transaction to check points, deduct points, decrement stock, create redemption record
    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } })
      if (!user) throw new Error('User not found')

      const reward = await tx.reward.findUnique({ where: { id: rewardId } })
      if (!reward) throw new Error('Reward not found')
      
      if (reward.stock <= 0) throw new Error('Reward out of stock')
      if (user.points < reward.pointsRequired) throw new Error('Insufficient points')

      // Deduct points
      await tx.user.update({
        where: { id: user.id },
        data: { points: { decrement: reward.pointsRequired } }
      })

      // Decrement stock
      await tx.reward.update({
        where: { id: reward.id },
        data: { stock: { decrement: 1 } }
      })

      // Create redemption
      const redemption = await tx.rewardRedemption.create({
        data: {
          employeeId: user.id,
          rewardId: reward.id,
          pointsSpent: reward.pointsRequired
        }
      })

      return redemption
    })

    return NextResponse.json({ success: true, redemption: result })
  } catch (error: any) {
    console.error('Reward redemption error:', error)
    return NextResponse.json({ error: error.message || 'Failed to redeem reward' }, { status: 500 })
  }
}
