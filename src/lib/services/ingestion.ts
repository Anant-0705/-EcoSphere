import { PrismaClient } from '@prisma/client'
import { createGroq } from '@ai-sdk/groq'
import { generateText } from 'ai'
import Papa from 'papaparse'
import * as xlsx from 'xlsx'
import pdfParse from 'pdf-parse'
import { EventBus } from '../events'

const prisma = new PrismaClient()

interface ExtractionResult {
  description: string
  quantity: number
  unit: string
  emissionFactorId: string
  confidence: number
}

export async function ingestDocument(
  fileBuffer: Buffer,
  filename: string,
  source: 'MANUAL' | 'UPLOAD' | 'GMAIL',
  uploaderId: string,
  departmentId?: string
) {
  try {
    const ext = filename.split('.').pop()?.toLowerCase()
    let rawData = ''

    if (ext === 'csv') {
      const text = fileBuffer.toString('utf-8')
      const parsed = Papa.parse(text, { header: true })
      rawData = JSON.stringify(parsed.data)
    } else if (ext === 'xlsx' || ext === 'xls') {
      const workbook = xlsx.read(fileBuffer, { type: 'buffer' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      rawData = JSON.stringify(xlsx.utils.sheet_to_json(firstSheet))
    } else if (ext === 'pdf') {
      const pdfData = await pdfParse(fileBuffer)
      rawData = pdfData.text
    } else {
      throw new Error(`Unsupported file type: ${ext}`)
    }

    // Truncate rawData if it's too large to prevent token explosion
    const truncatedData = rawData.substring(0, 15000)

    const factors = await prisma.emissionFactor.findMany()
    const factorList = factors.map(f => ({
      id: f.id,
      name: f.name,
      keywords: f.keywords,
      unit: f.unit
    }))

    const prompt = `You are a carbon accounting data extraction tool.
Analyze the following raw data extracted from an invoice or log file.
Your job is to identify line items that represent carbon-emitting activities (like fuel use, electricity consumption, flights, purchases) and map them to the provided Emission Factors.

Raw Data:
${truncatedData}

Available Emission Factors:
${JSON.stringify(factorList, null, 2)}

For each identified line item, output a JSON object in this exact array format:
[
  {
    "description": "Short description of the item (e.g. 'Fleet Diesel Purchase')",
    "quantity": <number>,
    "unit": "Must match the unit of the mapped emission factor (e.g. 'L', 'kWh', 'kg')",
    "emissionFactorId": "The 'id' of the best matching emission factor",
    "confidence": <number between 0 and 1 indicating how confident you are in this mapping>
  }
]

Rules:
1. ONLY return the raw JSON array. No markdown blocks, no conversational text.
2. If the raw data contains no relevant items, return an empty array [].
3. Only map to the provided emission factors. If nothing matches, do not invent one.`

    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })
    
    // Extract using Groq
    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt,
      maxTokens: 2000,
    })

    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    let extractedItems: ExtractionResult[] = []
    
    try {
      extractedItems = JSON.parse(cleanedText)
    } catch (e) {
      console.error('Failed to parse AI extraction output:', cleanedText)
      throw new Error('AI extraction returned malformed data.')
    }

    if (!Array.isArray(extractedItems)) {
      extractedItems = []
    }

    const batchId = `BATCH-${Date.now()}`
    let createdCount = 0
    let totalCO2e = 0
    const needsReview = []

    for (const item of extractedItems) {
      const factor = factors.find(f => f.id === item.emissionFactorId)
      if (!factor) continue

      const co2e = item.quantity * factor.factor

      await prisma.carbonTransaction.create({
        data: {
          source: source === 'GMAIL' ? 'EXPENSE' : 'UPLOAD', // simplified mapping
          description: item.description,
          quantity: item.quantity,
          emissionFactorId: factor.id,
          co2e,
          departmentId,
          ingestSource: source,
          batchId
        }
      })

      createdCount++
      totalCO2e += co2e
      
      if (item.confidence < 0.6) {
        needsReview.push(item.description)
      }
    }

    // Emit event if we created anything
    if (createdCount > 0 && departmentId) {
      EventBus.emit('CARBON_TXN_CREATED', { deptId: departmentId })
    }

    const summary = {
      created: createdCount,
      totalCO2e: Math.round(totalCO2e),
      needsReview
    }

    // Notify user
    EventBus.emit('INGEST_DONE', { userId: uploaderId, summary })

    return summary
  } catch (error: any) {
    console.error('Ingestion error:', error)
    throw new Error(error.message || 'Failed to ingest document')
  }
}
