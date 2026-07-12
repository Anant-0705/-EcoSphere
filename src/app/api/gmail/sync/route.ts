import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { google } from 'googleapis'
import { ingestDocument } from '@/lib/services/ingestion'
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Usually we would fetch a stored refresh token for the user here.
    // For demo purposes, we require the client to provide the access token (or we can stub it)
    const { accessToken } = await req.json().catch(() => ({}))

    if (!accessToken) {
      // In a real app we'd redirect to OAuth, but here we just return a 400
      // since the frontend should initiate OAuth and pass the token.
      return NextResponse.json({ error: 'Missing Gmail access token' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { departmentId: true, role: true }
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: accessToken })

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

    // Find recent emails with attachments that might be invoices
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: '(subject:invoice OR subject:bill OR from:utility) has:attachment',
      maxResults: 5 // Just process the 5 most recent for the demo
    })

    const messages = response.data.messages || []
    if (messages.length === 0) {
      return NextResponse.json({ success: true, processed: 0, message: 'No relevant emails found' })
    }

    let totalCreated = 0
    let totalCO2e = 0
    let filesProcessed = 0

    for (const msg of messages) {
      if (!msg.id) continue
      
      const fullMsg = await gmail.users.messages.get({ userId: 'me', id: msg.id })
      const parts = fullMsg.data.payload?.parts || []

      for (const part of parts) {
        if (part.filename && part.body?.attachmentId) {
          const ext = part.filename.split('.').pop()?.toLowerCase()
          // Only process files we can parse
          if (ext === 'csv' || ext === 'xlsx' || ext === 'pdf') {
            const attachment = await gmail.users.messages.attachments.get({
              userId: 'me',
              messageId: msg.id,
              id: part.body.attachmentId
            })

            if (attachment.data.data) {
              const buffer = Buffer.from(attachment.data.data, 'base64')
              
              // Process via ingestion pipeline
              const summary = await ingestDocument(
                buffer, 
                part.filename, 
                'GMAIL', 
                session.user.id, 
                user.departmentId || undefined
              )
              
              filesProcessed++
              totalCreated += summary.created
              totalCO2e += summary.totalCO2e
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: filesProcessed,
      summary: { created: totalCreated, totalCO2e }
    })

  } catch (error: any) {
    console.error('Gmail sync error:', error)
    return NextResponse.json({ error: error.message || 'Failed to sync Gmail' }, { status: 500 })
  }
}
