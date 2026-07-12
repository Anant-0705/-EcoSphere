import { google } from "googleapis"
import { prisma } from "@/lib/db"

const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "openid",
  "email",
  "profile",
]

export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/gmail/callback`

  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set")
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

export function getGmailAuthUrl(state: string) {
  const client = getOAuth2Client()
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GMAIL_SCOPES,
    state,
  })
}

/**
 * Resolve the EcoSphere user for Gmail OAuth: prefer id, fall back to email.
 */
export async function resolveAppUser(opts: { userId?: string | null; email?: string | null }) {
  if (opts.userId) {
    const byId = await prisma.user.findUnique({ where: { id: opts.userId } })
    if (byId) return byId
  }
  if (opts.email) {
    const byEmail = await prisma.user.findUnique({
      where: { email: opts.email.toLowerCase() },
    })
    if (byEmail) return byEmail
    // case-sensitive exact match fallback
    const byEmailExact = await prisma.user.findUnique({ where: { email: opts.email } })
    if (byEmailExact) return byEmailExact
  }
  return null
}

/** Get a valid access token for the user, refreshing if needed. */
export async function getUserGoogleAccessToken(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      googleAccessToken: true,
      googleRefreshToken: true,
      googleTokenExpiry: true,
    },
  })

  if (!user) return null

  const stillValid =
    user.googleAccessToken &&
    user.googleTokenExpiry &&
    user.googleTokenExpiry.getTime() > Date.now() + 60_000

  if (stillValid && user.googleAccessToken) {
    return user.googleAccessToken
  }

  if (!user.googleRefreshToken) {
    return user.googleAccessToken || null
  }

  const client = getOAuth2Client()
  client.setCredentials({ refresh_token: user.googleRefreshToken })

  const { credentials } = await client.refreshAccessToken()
  const accessToken = credentials.access_token || null
  const expiry = credentials.expiry_date ? new Date(credentials.expiry_date) : null

  await prisma.user.update({
    where: { id: userId },
    data: {
      googleAccessToken: accessToken,
      googleTokenExpiry: expiry,
      ...(credentials.refresh_token
        ? { googleRefreshToken: credentials.refresh_token }
        : {}),
    },
  })

  return accessToken
}

export async function storeGoogleTokens(
  opts: {
    userId?: string | null
    email?: string | null
  },
  tokens: {
    access_token?: string | null
    refresh_token?: string | null
    expiry_date?: number | null
  }
) {
  const user = await resolveAppUser(opts)

  if (!user) {
    throw new Error(
      "user_not_found: Your session is out of date (DB user missing). Sign out, sign in again, then retry Connect Gmail."
    )
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(tokens.access_token ? { googleAccessToken: tokens.access_token } : {}),
      ...(tokens.refresh_token ? { googleRefreshToken: tokens.refresh_token } : {}),
      ...(tokens.expiry_date != null
        ? { googleTokenExpiry: new Date(tokens.expiry_date) }
        : {}),
    },
  })

  return user
}
