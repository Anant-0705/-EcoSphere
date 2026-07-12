import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
  });

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: "You are the EcoSphere AI ESG Advisor. You are a helpful AI assistant that answers questions about the company's Environmental, Social, and Governance (ESG) performance. Use the provided tools to query real-time data from the company's database to answer the user's questions accurately. If you don't know the answer or the tools don't return data, state that clearly. Do not make up data.",
    messages,
    tools: {
      getDepartmentScores: {
        description: 'Get the Environmental, Social, and Governance scores for all departments or a specific department.',
        parameters: z.object({
          departmentName: z.string().optional().describe('Optional name of the department to filter by.')
        }),
        execute: async ({ departmentName }) => {
          const scores = await prisma.departmentScore.findMany({
            include: { department: true }
          });
          if (departmentName) {
            return scores.filter(s => s.department.name.toLowerCase().includes(departmentName.toLowerCase()));
          }
          return scores;
        },
      },
      getComplianceIssues: {
        description: 'Get a list of open or overdue compliance issues.',
        parameters: z.object({
          status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED']).optional().describe('Filter by status'),
          onlyOverdue: z.boolean().optional().describe('If true, only return overdue issues')
        }),
        execute: async ({ status, onlyOverdue }) => {
          return prisma.complianceIssue.findMany({
            where: {
              ...(status ? { status } : {}),
              ...(onlyOverdue ? { overdue: true } : {})
            },
            include: { owner: { select: { name: true, department: { select: { name: true } } } } }
          });
        },
      },
      getRecentCarbonEmissions: {
        description: 'Get recent carbon transactions and emissions logged by the company.',
        parameters: z.object({
          limit: z.number().default(10).describe('Number of recent transactions to return')
        }),
        execute: async ({ limit }) => {
          return prisma.carbonTransaction.findMany({
            take: limit,
            orderBy: { date: 'desc' },
            include: { emissionFactor: { select: { name: true, scope: true } } }
          });
        }
      }
    },
  });

  // v7 API uses toUIMessageStreamResponse()
  return result.toUIMessageStreamResponse();
}
