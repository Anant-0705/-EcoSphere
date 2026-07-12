import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { google } from "googleapis"
import { ingestDocument } from "@/lib/services/ingestion"
import { prisma } from "@/lib/db"
import { getUserGoogleAccessToken } from "@/lib/google"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    let accessToken: string | null = body.accessToken || null

    // Prefer stored OAuth tokens from Gmail connect / Google sign-in
    if (!accessToken) {
      accessToken = await getUserGoogleAccessToken(session.user.id)
    }

    if (!accessToken) {
      return NextResponse.json(
        {
          error: "Gmail not connected",
          code: "GMAIL_NOT_CONNECTED",
          connectUrl: "/api/gmail/connect",
        },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { departmentId: true, role: true },
    })

    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: accessToken })

    const gmail = google.gmail({ version: "v1", auth: oauth2Client })

    const response = await gmail.users.messages.list({
      userId: "me",
      q: "(subject:invoice OR subject:bill OR from:utility) has:attachment",
      maxResults: 5,
    })

    const messages = response.data.messages || []
    if (messages.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: "No relevant emails found",
      })
    }

    let totalCreated = 0
    let totalCO2e = 0
    let filesProcessed = 0

    for (const msg of messages) {
      if (!msg.id) continue

      const fullMsg = await gmail.users.messages.get({ userId: "me", id: msg.id })
      const parts = fullMsg.data.payload?.parts || []

      for (const part of parts) {
        if (part.filename && part.body?.attachmentId) {
          const ext = part.filename.split(".").pop()?.toLowerCase()
          if (ext === "csv" || ext === "xlsx" || ext === "pdf") {
            const attachment = await gmail.users.messages.attachments.get({
              userId: "me",
              messageId: msg.id,
              id: part.body.attachmentId,
            })

            if (attachment.data.data) {
              const buffer = Buffer.from(attachment.data.data, "base64")

              const summary = await ingestDocument(
                buffer,
                part.filename,
                "GMAIL",
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
      summary: { created: totalCreated, totalCO2e },
      message: `Processed ${filesProcessed} attachment(s)`,
    })
  } catch (error: unknown) {
    console.error("Gmail sync error:", error)
    const message = error instanceof Error ? error.message : "Failed to sync Gmail"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
