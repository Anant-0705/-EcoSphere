import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getGmailAuthUrl, resolveAppUser } from "@/lib/google"

/**
 * Starts the Gmail OAuth flow (gmail.readonly).
 * Redirects to Google, then back to /api/gmail/callback.
 */
export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", baseUrl))
    }

    // Resolve real Prisma user (session id may be stale after reseed / Google sub)
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
    const message = error instanceof Error ? error.message : "Failed to start Gmail OAuth"
    console.error("Gmail connect error:", error)
    return NextResponse.redirect(
      `${baseUrl}/environmental?gmail=error&reason=${encodeURIComponent(message)}`
    )
  }
}
