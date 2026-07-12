import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const scores = await prisma.departmentScore.findMany({
      include: { department: true },
    })

    const activeDepts = scores.filter(s => s.department.status === 'ACTIVE')

    const overall = activeDepts.length > 0
      ? Math.round(activeDepts.reduce((sum, s) => sum + s.totalScore, 0) / activeDepts.length)
      : 0

    const envAvg = activeDepts.length > 0
      ? Math.round(activeDepts.reduce((sum, s) => sum + s.envScore, 0) / activeDepts.length)
      : 0

    const socialAvg = activeDepts.length > 0
      ? Math.round(activeDepts.reduce((sum, s) => sum + s.socialScore, 0) / activeDepts.length)
      : 0

    const govAvg = activeDepts.length > 0
      ? Math.round(activeDepts.reduce((sum, s) => sum + s.govScore, 0) / activeDepts.length)
      : 0

    return NextResponse.json({
      overall,
      environmental: envAvg,
      social: socialAvg,
      governance: govAvg,
      departments: activeDepts.map(s => ({
        id: s.departmentId,
        name: s.department.name,
        envScore: Math.round(s.envScore),
        socialScore: Math.round(s.socialScore),
        govScore: Math.round(s.govScore),
        totalScore: Math.round(s.totalScore),
        trend: s.trend,
        reason: s.reason
      })),
    })
  } catch (error) {
    console.error('Scores API error:', error)
    return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 })
  }
}
