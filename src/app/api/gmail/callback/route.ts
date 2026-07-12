import { NextResponse } from "next/server"
import { google } from "googleapis"
import { getOAuth2Client, storeGoogleTokens } from "@/lib/google"

/**
 * Google OAuth redirect target (matches GOOGLE_REDIRECT_URI).
 * Exchanges code for tokens and stores them on the user.
 */
export async function GET(req: Request) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

  try {
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
      return NextResponse.redirect(`${baseUrl}/environmental?gmail=error&reason=missing_code`)
    }

    let userId: string | undefined
    let email: string | undefined
    try {
      const parsed = JSON.parse(Buffer.from(state, "base64url").toString("utf8")) as {
        userId?: string
        email?: string
      }
      userId = parsed.userId
      email = parsed.email
    } catch {
      return NextResponse.redirect(`${baseUrl}/environmental?gmail=error&reason=invalid_state`)
    }

    const client = getOAuth2Client()
    const { tokens } = await client.getToken(code)
    client.setCredentials(tokens)

    // Prefer email from Google if state email/id is stale
    let googleEmail = email
    try {
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
    const message = error instanceof Error ? error.message : "callback_failed"
    // Keep URL reason short for UI
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
