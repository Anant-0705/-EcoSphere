"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Upload, Mail, Loader2, AlertCircle, CheckCircle, Link2 } from "lucide-react"
import { useEffect } from "react"

export function IngestPanel() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<{
    type: "success" | "error"
    message: string
    summary?: { created?: number; totalCO2e?: number; needsReview?: string[] }
  } | null>(null)

  useEffect(() => {
    const gmail = searchParams.get("gmail")
    if (gmail === "connected") {
      setResult({
        type: "success",
        message: "Gmail connected successfully. You can sync invoices now.",
      })
    } else if (gmail === "error") {
      const reason = searchParams.get("reason") || "unknown"
      if (reason === "access_denied") {
        setResult({
          type: "error",
          message:
            "Google blocked Gmail access (403 access_denied). Your OAuth app is likely in Testing mode and this Google account is not a Test user, or the gmail.readonly scope is missing on the consent screen. See README → Google Cloud setup.",
        })
      } else if (reason === "user_not_found" || reason.includes("user_not_found")) {
        setResult({
          type: "error",
          message:
            "Your session points to a user that no longer exists in the database (common after reseed/reset). Sign out, sign in again (credentials or Google), then retry Connect Gmail.",
        })
      } else {
        setResult({ type: "error", message: `Gmail connection failed: ${reason}` })
      }
    }
  }, [searchParams])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setResult(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload document")
      }

      setResult({
        type: "success",
        message: `Successfully processed ${file.name}`,
        summary: data.summary,
      })
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed"
      setResult({ type: "error", message })
    } finally {
      setLoading(false)
      e.target.value = ""
    }
  }

  async function handleGmailSync() {
    setSyncing(true)
    setResult(null)

    try {
      const res = await fetch("/api/gmail/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })

      const data = await res.json()

      if (res.status === 400 && data.code === "GMAIL_NOT_CONNECTED") {
        // Start OAuth connect flow
        window.location.href = data.connectUrl || "/api/gmail/connect"
        return
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to sync Gmail")
      }

      setResult({
        type: "success",
        message: data.message || `Processed ${data.processed} emails`,
        summary: data.summary,
      })
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sync failed"
      setResult({ type: "error", message })
    } finally {
      setSyncing(false)
    }
  }

  function handleConnectGmail() {
    window.location.href = "/api/gmail/connect"
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Automated Data Ingestion
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Upload invoices or sync your inbox to auto-extract carbon data using AI.
          </p>
        </div>
        <button
          type="button"
          onClick={handleConnectGmail}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <Link2 className="h-3.5 w-3.5" />
          Connect Gmail
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label
          className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors ${loading ? "opacity-50 pointer-events-none" : ""}`}
        >
          <input
            type="file"
            className="sr-only"
            onChange={handleUpload}
            accept=".csv,.xlsx,.xls,.pdf"
            disabled={loading}
          />
          {loading ? (
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-2" />
          ) : (
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
          )}
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Upload Data</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">CSV, XLSX, PDF</span>
        </label>

        <button
          type="button"
          onClick={handleGmailSync}
          disabled={syncing}
          className={`flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-6 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800 transition-colors ${syncing ? "opacity-50" : ""}`}
        >
          {syncing ? (
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
          ) : (
            <Mail className="h-8 w-8 text-blue-500 mb-2" />
          )}
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Sync Gmail</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Scan for invoices</span>
        </button>
      </div>

      {result && (
        <div
          className={`mt-4 rounded-md p-4 text-sm ${
            result.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800/30 dark:text-emerald-300"
              : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/30 dark:border-red-800/30 dark:text-red-300"
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {result.type === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {result.message}
          </div>
          {result.summary && (
            <div className="mt-2 text-xs opacity-90">
              Created: {result.summary.created} transactions | Total CO2e:{" "}
              {result.summary.totalCO2e}kg
              {result.summary.needsReview && result.summary.needsReview.length > 0 && (
                <div className="mt-1 font-semibold text-amber-600 dark:text-amber-400">
                  {result.summary.needsReview.length} items flagged for review
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
