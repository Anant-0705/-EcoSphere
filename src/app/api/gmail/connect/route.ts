import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import {
  getAppBaseUrl,
  getGmailAuthUrl,
  resolveAppUser,
} from "@/lib/google"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Starts the Gmail OAuth flow (gmail.readonly).
 */
export async function GET() {
  const baseUrl = getAppBaseUrl()

  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", baseUrl))
    }

    const dbUser = await resolveAppUser({
      userId: session.user.id,
      email: session.user.email,
    })

    if (!dbUser) {
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent(
          "Session out of date. Sign out and sign in again before connecting Gmail."
        )}`
      )
    }

    if (dbUser.role !== "ADMIN" && dbUser.role !== "MANAGER") {
      return NextResponse.redirect(
        `${baseUrl}/environmental?gmail=error&reason=${encodeURIComponent(
          "Only ADMIN or MANAGER can connect Gmail"
        )}`
      )
    }

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.redirect(
        `${baseUrl}/environmental?gmail=error&reason=${encodeURIComponent(
          "GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET missing on server"
        )}`
      )
    }

    const state = Buffer.from(
      JSON.stringify({
        userId: dbUser.id,
        email: dbUser.email,
        ts: Date.now(),
      })
    ).toString("base64url")

    const url = getGmailAuthUrl(state)
    return NextResponse.redirect(url)
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to start Gmail OAuth"
    console.error("Gmail connect error:", error)
    return NextResponse.redirect(
      `${baseUrl}/environmental?gmail=error&reason=${encodeURIComponent(message)}`
    )
  }
}
