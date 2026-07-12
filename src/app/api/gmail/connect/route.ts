import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  // Resolve base without pulling googleapis at module load
  const baseUrl = (
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "http://localhost:3000"
  ).replace(/\/$/, "")

  try {
    const { auth } = await import("@/lib/auth")
    const {
      getGmailAuthUrl,
      resolveAppUser,
    } = await import("@/lib/google")

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

    const url = await getGmailAuthUrl(state)
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
