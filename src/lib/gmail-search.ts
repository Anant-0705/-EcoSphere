/**
 * Strict Gmail search for company carbon reports.
 *
 * Companies should send mail with a fixed subject phrase so we never
 * pick up random invoices / bus tickets / utility bills.
 *
 * Override via env:
 *   GMAIL_SUBJECT_PHRASE="Carbon Emission Annual Report"
 *   GMAIL_MAX_MESSAGES=1
 *   GMAIL_SEARCH_QUERY=...   (full Gmail query; overrides subject phrase builder)
 */

export const DEFAULT_GMAIL_SUBJECT_PHRASE = "Carbon Emission Annual Report"

export function getGmailSubjectPhrase(): string {
  return (
    process.env.GMAIL_SUBJECT_PHRASE?.trim() || DEFAULT_GMAIL_SUBJECT_PHRASE
  )
}

/** Gmail search operators: subject phrase + must have attachment. */
export function buildCarbonReportSearchQuery(): string {
  if (process.env.GMAIL_SEARCH_QUERY?.trim()) {
    return process.env.GMAIL_SEARCH_QUERY.trim()
  }

  const phrase = getGmailSubjectPhrase()
  // Quotes = exact phrase match in subject (Gmail operator)
  // has:attachment = only messages with files we can ingest
  return `subject:"${phrase}" has:attachment`
}

export function getGmailMaxMessages(): number {
  const n = Number(process.env.GMAIL_MAX_MESSAGES || "1")
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.min(Math.floor(n), 5) // hard cap: never scan more than 5
}

export type GmailPart = {
  filename?: string | null
  mimeType?: string | null
  body?: { attachmentId?: string | null; data?: string | null } | null
  parts?: GmailPart[] | null
}

/** Walk nested multipart payloads for file attachments. */
export function collectFileAttachments(
  parts: GmailPart[] | null | undefined,
  out: { filename: string; attachmentId: string }[] = []
): { filename: string; attachmentId: string }[] {
  if (!parts) return out

  for (const part of parts) {
    const name = part.filename?.trim()
    const id = part.body?.attachmentId
    if (name && id) {
      const ext = name.split(".").pop()?.toLowerCase()
      if (ext === "pdf" || ext === "csv" || ext === "xlsx" || ext === "xls") {
        out.push({ filename: name, attachmentId: id })
      }
    }
    if (part.parts?.length) {
      collectFileAttachments(part.parts, out)
    }
  }

  return out
}
