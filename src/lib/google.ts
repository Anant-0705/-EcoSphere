import { prisma } from "@/lib/db"

const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "openid",
  "email",
  "profile",
]

/** Production-safe base URL (never use localhost on Vercel). */
export function getAppBaseUrl() {
  const fromEnv = process.env.NEXTAUTH_URL?.trim() || process.env.AUTH_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, "")

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`
  }

  return "http://localhost:3000"
}

export function getGmailRedirectUri() {
  const explicit = process.env.GOOGLE_REDIRECT_URI?.trim()
  if (
    explicit &&
    !(
      process.env.VERCEL &&
      (explicit.includes("localhost") || explicit.includes("127.0.0.1"))
    )
  ) {
    return explicit
  }
  return `${getAppBaseUrl()}/api/gmail/callback`
}

/** Lazy-load googleapis (avoids Vercel serverless module-init crashes). */
export async function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = getGmailRedirectUri()

  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set")
  }

  const { google } = await import("googleapis")
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

export async function getGmailAuthUrl(state: string) {
  const client = await getOAuth2Client()
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GMAIL_SCOPES,
    state,
  })
}

export async function resolveAppUser(opts: {
  userId?: string | null
  email?: string | null
}) {
  if (opts.userId) {
    const byId = await prisma.user.findUnique({ where: { id: opts.userId } })
    if (byId) return byId
  }
  if (opts.email) {
    const byEmail = await prisma.user.findUnique({
      where: { email: opts.email.toLowerCase() },
    })
    if (byEmail) return byEmail
    const byEmailExact = await prisma.user.findUnique({
      where: { email: opts.email },
    })
    if (byEmailExact) return byEmailExact
  }
  return null
}

export async function getUserGoogleAccessToken(
  userId: string
): Promise<string | null> {
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

  try {
    const client = await getOAuth2Client()
    client.setCredentials({ refresh_token: user.googleRefreshToken })

    const { credentials } = await client.refreshAccessToken()
    const accessToken = credentials.access_token || null
    const expiry = credentials.expiry_date
      ? new Date(credentials.expiry_date)
      : null

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
  } catch (e) {
    console.error("Failed to refresh Google access token:", e)
    return null
  }
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
      ...(tokens.access_token
        ? { googleAccessToken: tokens.access_token }
        : {}),
      ...(tokens.refresh_token
        ? { googleRefreshToken: tokens.refresh_token }
        : {}),
      ...(tokens.expiry_date != null
        ? { googleTokenExpiry: new Date(tokens.expiry_date) }
        : {}),
    },
  })

  return user
}

export function formatGoogleError(error: unknown): string {
  if (!error) return "Unknown error"
  if (typeof error === "string") return error

  const e = error as {
    message?: string
    code?: number | string
    errors?: { message?: string }[]
    response?: { data?: { error?: { message?: string; status?: string } } }
  }

  const apiMsg =
    e.response?.data?.error?.message ||
    e.errors?.[0]?.message ||
    e.message ||
    "Google API error"

  if (
    String(apiMsg).includes("Gmail API has not been used") ||
    String(apiMsg).includes("accessNotConfigured")
  ) {
    return "Gmail API is not enabled for this Google Cloud project. Enable it in Google Cloud Console → APIs → Gmail API."
  }

  if (
    String(apiMsg).includes("invalid_grant") ||
    String(apiMsg).includes("Invalid Credentials")
  ) {
    return "Gmail token expired or invalid. Click Connect Gmail again."
  }

  if (
    String(apiMsg).includes("does not exist") ||
    String(apiMsg).includes("Unknown argument")
  ) {
    return "Database schema is outdated (missing Google OAuth columns). Run prisma db push on production DATABASE_URL."
  }

  return apiMsg
}
