import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { ingestDocument } from "@/lib/services/ingestion"
import { prisma } from "@/lib/db"
import {
  formatGoogleError,
  getUserGoogleAccessToken,
} from "@/lib/google"
import {
  buildCarbonReportSearchQuery,
  collectFileAttachments,
  getGmailMaxMessages,
  getGmailSubjectPhrase,
} from "@/lib/gmail-search"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * Strict Gmail sync: only emails whose subject matches the company phrase
 * (default: "Carbon Emission Annual Report"), latest message first.
 */
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({} as { accessToken?: string }))
    let accessToken: string | null = body.accessToken || null

    if (!accessToken) {
      try {
        accessToken = await getUserGoogleAccessToken(session.user.id)
      } catch (e) {
        // Missing DB columns (migration not applied) often surfaces here
        const msg = formatGoogleError(e)
        if (
          msg.includes("does not exist") ||
          msg.includes("Unknown column") ||
          msg.includes("column")
        ) {
          return NextResponse.json(
            {
              error:
                "Database is missing Google OAuth columns. Run: npx prisma db push (or migrate deploy) on the production DATABASE_URL.",
              code: "DB_SCHEMA_OUTDATED",
            },
            { status: 500 }
          )
        }
        throw e
      }
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
      return NextResponse.json(
        { error: "Insufficient permissions (ADMIN or MANAGER required)" },
        { status: 403 }
      )
    }

    // Dynamic import — more reliable on Vercel serverless
    const { google } = await import("googleapis")
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: accessToken })
    const gmail = google.gmail({ version: "v1", auth: oauth2Client })

    const searchQuery = buildCarbonReportSearchQuery()
    const subjectPhrase = getGmailSubjectPhrase()
    const maxResults = getGmailMaxMessages()

    let response
    try {
      response = await gmail.users.messages.list({
        userId: "me",
        q: searchQuery,
        maxResults,
      })
    } catch (e) {
      return NextResponse.json(
        { error: formatGoogleError(e), code: "GMAIL_API_ERROR" },
        { status: 502 }
      )
    }

    const messages = response.data.messages || []
    if (messages.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: `No emails found with subject containing "${subjectPhrase}". Company mail must use that exact phrase in the subject line.`,
        query: searchQuery,
      })
    }

    let totalCreated = 0
    let totalCO2e = 0
    let filesProcessed = 0
    const matchedSubjects: string[] = []
    const fileErrors: string[] = []

    for (const msg of messages) {
      if (!msg.id) continue

      const fullMsg = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "full",
      })

      const headers = fullMsg.data.payload?.headers || []
      const subject =
        headers.find((h) => h.name?.toLowerCase() === "subject")?.value ||
        "(no subject)"

      if (!subject.toLowerCase().includes(subjectPhrase.toLowerCase())) {
        if (!process.env.GMAIL_SEARCH_QUERY?.trim()) {
          continue
        }
      }

      matchedSubjects.push(subject)

      const root = fullMsg.data.payload
      const parts = root?.parts || (root ? [root] : [])
      const files = collectFileAttachments(
        parts as Parameters<typeof collectFileAttachments>[0]
      )

      if (files.length === 0) continue

      for (const file of files) {
        try {
          const attachment = await gmail.users.messages.attachments.get({
            userId: "me",
            messageId: msg.id,
            id: file.attachmentId,
          })

          if (!attachment.data.data) continue

          const buffer = Buffer.from(attachment.data.data, "base64")
          const summary = await ingestDocument(
            buffer,
            file.filename,
            "GMAIL",
            session.user.id,
            user.departmentId || undefined
          )

          filesProcessed++
          totalCreated += summary.created
          totalCO2e += summary.totalCO2e
        } catch (fileErr) {
          fileErrors.push(
            `${file.filename}: ${formatGoogleError(fileErr)}`
          )
        }
      }
    }

    if (filesProcessed === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message:
          fileErrors.length > 0
            ? `Found mail but failed to process attachments: ${fileErrors[0]}`
            : `Found ${messages.length} matching email(s) but no PDF/CSV/XLSX attachments to parse.`,
        query: searchQuery,
        subjects: matchedSubjects,
        fileErrors,
      })
    }

    return NextResponse.json({
      success: true,
      processed: filesProcessed,
      summary: { created: totalCreated, totalCO2e },
      message: `Processed ${filesProcessed} attachment(s) from ${matchedSubjects.length} carbon-report email(s)`,
      query: searchQuery,
      subjects: matchedSubjects,
      fileErrors: fileErrors.length ? fileErrors : undefined,
    })
  } catch (error: unknown) {
    console.error("Gmail sync error:", error)
    const message = formatGoogleError(error)
    return NextResponse.json(
      {
        error: message,
        code: "GMAIL_SYNC_FAILED",
      },
      { status: 500 }
    )
  }
}
