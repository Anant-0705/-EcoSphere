import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const baseUrl = (
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "http://localhost:3000"
  ).replace(/\/$/, "")

  try {
    const {
      getOAuth2Client,
      storeGoogleTokens,
      formatGoogleError,
    } = await import("@/lib/google")

    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    if (error) {
      return NextResponse.redirect(
        `${baseUrl}/environmental?gmail=error&reason=${encodeURIComponent(error)}`
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${baseUrl}/environmental?gmail=error&reason=missing_code`
      )
    }

    let userId: string | undefined
    let email: string | undefined
    try {
      const parsed = JSON.parse(
        Buffer.from(state, "base64url").toString("utf8")
      ) as { userId?: string; email?: string }
      userId = parsed.userId
      email = parsed.email
    } catch {
      return NextResponse.redirect(
        `${baseUrl}/environmental?gmail=error&reason=invalid_state`
      )
    }

    const client = await getOAuth2Client()
    const { tokens } = await client.getToken(code)
    client.setCredentials(tokens)

    let googleEmail = email
    try {
      const { google } = await import("googleapis")
      const oauth2 = google.oauth2({ version: "v2", auth: client })
      const me = await oauth2.userinfo.get()
      if (me.data.email) googleEmail = me.data.email
    } catch (e) {
      console.warn("Could not fetch Google userinfo:", e)
    }

    await storeGoogleTokens(
      { userId, email: googleEmail || email },
      {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
      }
    )

    return NextResponse.redirect(`${baseUrl}/environmental?gmail=connected`)
  } catch (error: unknown) {
    console.error("Gmail callback error:", error)
    const { formatGoogleError } = await import("@/lib/google").catch(() => ({
      formatGoogleError: (e: unknown) =>
        e instanceof Error ? e.message : "callback_failed",
    }))
    const message = formatGoogleError(error)
    const short =
      message.startsWith("user_not_found")
        ? "user_not_found"
        : message.length > 180
          ? message.slice(0, 180)
          : message
    return NextResponse.redirect(
      `${baseUrl}/environmental?gmail=error&reason=${encodeURIComponent(short)}`
    )
  }
}
