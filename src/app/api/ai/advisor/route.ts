import { NextResponse } from 'next/server'
import { createGroq } from '@ai-sdk/groq'
import { generateText } from 'ai'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    const [scores, issues, goals, participations] = await Promise.all([
      prisma.departmentScore.findMany({ include: { department: true } }),
      prisma.complianceIssue.findMany({
        where: { status: { not: 'RESOLVED' } },
        include: { owner: { select: { name: true, department: { select: { name: true } } } } },
      }),
      prisma.environmentalGoal.findMany(),
      prisma.employeeParticipation.findMany({
        where: { approval: 'APPROVED' },
        include: { employee: { select: { department: { select: { name: true } } } } },
      }),
    ])

    const overallESG = scores.length > 0
      ? Math.round(scores.reduce((s, d) => s + d.totalScore, 0) / scores.length)
      : 0

    const deptSummary = scores.map(s => ({
      dept: s.department.name,
      total: Math.round(s.totalScore),
      env: Math.round(s.envScore),
      social: Math.round(s.socialScore),
      gov: Math.round(s.govScore),
    }))

    const issuesSummary = issues.map(i => ({
      title: (i as any).title || 'Issue',
      status: i.status,
      overdue: i.overdue,
      owner: (i as any).owner?.name || 'Unassigned',
      dept: (i as any).owner?.department?.name || 'Unknown',
    }))

    const prompt = `You are an ESG expert advisor. Analyze the following live company data and provide strategic insights.

Overall ESG Score: ${overallESG}/100

Department Scores:
${deptSummary.map(d => `- ${d.dept}: Total ${d.total} (Env:${d.env}, Social:${d.social}, Gov:${d.gov})`).join('\n')}

Open Compliance Issues (${issues.length} total, ${issues.filter(i => i.overdue).length} overdue):
${issuesSummary.map(i => `- [${i.overdue ? 'OVERDUE' : i.status}] ${i.title} — Owner: ${i.owner}, Dept: ${i.dept}`).join('\n') || 'None'}

Environmental Goals: ${goals.length} goals tracked
CSR Participations approved: ${participations.length}

Provide your analysis in this EXACT JSON format (no markdown, no code fences, just raw JSON):
{
  "summary": "2-3 sentence overall health assessment",
  "score": ${overallESG},
  "diagnoses": [
    {"department": "dept name", "area": "Environmental|Social|Governance", "finding": "specific finding with numbers", "severity": "high|medium|low"}
  ],
  "recommendations": [
    {"action": "specific actionable step", "impact": "expected score change", "priority": 1}
  ]
}`

    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt,
      maxTokens: 1000,
    })

    // Clean and parse JSON
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const insights = JSON.parse(cleaned)

    return NextResponse.json(insights)
  } catch (error) {
    console.error('Advisor error:', error)
    return NextResponse.json({
      summary: 'Unable to generate insights at this time. Please try again.',
      score: 0,
      diagnoses: [],
      recommendations: [],
    })
  }
}
