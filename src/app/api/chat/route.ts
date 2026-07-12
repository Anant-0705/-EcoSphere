import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const maxDuration = 30;

export async function POST(req: Request) {
  const body = await req.json();
  console.log('BODY KEYS:', Object.keys(body));
  console.log('BODY:', JSON.stringify(body).slice(0, 2000));
  const rawMessages: any[] = body.messages || [];

  // In v7, ALL messages use parts[] array (including user messages)
  // Format: { role: 'user', parts: [{ type: 'text', text: '...' }] }
  const coreMessages = rawMessages
    .filter((m: any) => m.role === 'user' || m.role === 'assistant')
    .map((m: any) => {
      // Extract text from parts[] first (v7 format), then fall back to content/text fields
      const text = Array.isArray(m.parts)
        ? m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('')
        : m.content || m.text || '';
      return { role: m.role as 'user' | 'assistant', content: text };
    })
    .filter((m) => m.content.trim().length > 0);

  if (coreMessages.length === 0) {
    return new Response(
      JSON.stringify({ error: 'No valid messages found' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Fetch live ESG data upfront and inject into system prompt
  let esgContext = '';
  try {
    const [scores, issues, emissions] = await Promise.all([
      prisma.departmentScore.findMany({ include: { department: true } }),
      prisma.complianceIssue.findMany({
        where: { status: { not: 'RESOLVED' } },
        take: 10,
        include: { owner: { select: { name: true, department: { select: { name: true } } } } },
      }),
      prisma.carbonTransaction.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        include: { emissionFactor: { select: { name: true, scope: true } } },
      }),
    ]);

    esgContext = `
## Live ESG Data (as of now)

### Department ESG Scores
${scores.map((s) => `- **${s.department.name}**: Env=${s.envScore}, Social=${s.socialScore}, Gov=${s.govScore}, Total=${s.totalScore}`).join('\n')}

### Open/In-Progress Compliance Issues (${issues.length} total)
${issues.length === 0 ? 'No open compliance issues.' : issues.map((i) => `- ${(i as any).title || 'Issue'} [${(i as any).status}] — Owner: ${(i as any).owner?.name || 'Unassigned'}, Dept: ${(i as any).owner?.department?.name || 'N/A'}`).join('\n')}

### Recent Carbon Transactions (last 5)
${emissions.length === 0 ? 'No recent emissions data.' : emissions.map((e) => `- ${(e as any).emissionFactor?.name || 'Unknown'} (Scope ${(e as any).emissionFactor?.scope || '?'}): ${(e as any).amount || '?'} units on ${new Date((e as any).date).toLocaleDateString()}`).join('\n')}
`;
  } catch {
    esgContext = '\n## Live ESG Data\nUnable to fetch live data at this time.\n';
  }

  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: `You are EcoSphere AI — an expert ESG Advisor for a corporate sustainability platform.
You have access to real-time company data below. Use it to answer the user's questions accurately.
Be concise, clear, and professional. Format responses with bullet points or tables where helpful.
${esgContext}`,
    messages: coreMessages,
  });

  return result.toUIMessageStreamResponse();
}
