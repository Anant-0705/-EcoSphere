import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { ingestDocument } from '@/lib/services/ingestion'
import { prisma } from '@prisma/client'

// Since there is no global prisma instance in lib/db, we can't import it that way.
// Wait, we need to lookup the user to get their departmentId.
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Get user's department
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { departmentId: true, role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Allow ADMIN or MANAGER to upload for their dept
    if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    
    const buffer = Buffer.from(await file.arrayBuffer())
    const summary = await ingestDocument(buffer, file.name, 'UPLOAD', session.user.id, user.departmentId || undefined)

    return NextResponse.json({ success: true, summary })
  } catch (error: any) {
    console.error('Ingest route error:', error)
    return NextResponse.json({ error: error.message || 'Failed to process document' }, { status: 500 })
  }
}
