import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { authConfig } from "@/lib/auth.config"

/** Load EcoSphere user fields into the JWT (always by email when possible). */
async function attachDbUserToToken(
  token: { id?: string; role?: string; departmentId?: string | null; email?: string | null },
  email?: string | null
) {
  const lookupEmail = email || token.email
  if (!lookupEmail) return token

  const dbUser = await prisma.user.findUnique({
    where: { email: lookupEmail },
    select: { id: true, role: true, departmentId: true, email: true },
  })

  if (dbUser) {
    token.id = dbUser.id
    token.role = dbUser.role
    token.departmentId = dbUser.departmentId
    token.email = dbUser.email
  }

  return token
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        if (user.status !== "ACTIVE") {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          departmentId: user.departmentId,
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false

        const existing = await prisma.user.findUnique({
          where: { email: user.email },
        })

        if (existing) {
          await prisma.user.update({
            where: { id: existing.id },
            data: {
              name: user.name ?? existing.name,
              image: user.image ?? existing.image,
              ...(account.refresh_token
                ? { googleRefreshToken: account.refresh_token }
                : {}),
              ...(account.access_token
                ? {
                    googleAccessToken: account.access_token,
                    googleTokenExpiry: account.expires_at
                      ? new Date(account.expires_at * 1000)
                      : null,
                  }
                : {}),
            },
          })
          // Must overwrite Google's provider subject with our Prisma cuid
          user.id = existing.id
          user.role = existing.role
          user.departmentId = existing.departmentId
        } else {
          const created = await prisma.user.create({
            data: {
              name: user.name || user.email.split("@")[0],
              email: user.email,
              image: user.image,
              passwordHash: null,
              role: "EMPLOYEE",
              googleRefreshToken: account.refresh_token ?? null,
              googleAccessToken: account.access_token ?? null,
              googleTokenExpiry: account.expires_at
                ? new Date(account.expires_at * 1000)
                : null,
            },
          })
          user.id = created.id
          user.role = created.role
          user.departmentId = created.departmentId
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      // On every sign-in, force Prisma user id (never keep Google "sub" as app user id)
      if (user) {
        token.email = user.email ?? token.email
        token.name = user.name ?? token.name
        token.picture = user.image ?? token.picture

        if (user.id && (user as { role?: string }).role != null) {
          token.id = user.id
          token.role = (user as { role?: string }).role
          token.departmentId = (user as { departmentId?: string | null }).departmentId ?? null
        }
      }

      // Resolve / re-sync from DB by email (handles Google + stale JWTs after reseed)
      if (token.email) {
        await attachDbUserToToken(token, token.email as string)
      }

      // First Google login path: account present, ensure DB row is mapped
      if (account?.provider === "google" && token.email) {
        await attachDbUserToToken(token, token.email as string)
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // Never fall back to token.sub (Google subject id) — only Prisma id
        session.user.id = (token.id as string) || ""
        session.user.role = (token.role as string) || "EMPLOYEE"
        session.user.departmentId = (token.departmentId as string | null) ?? null
        if (token.email) session.user.email = token.email as string
      }
      return session
    },
  },
})
