import type { NextAuthConfig } from "next-auth"

/**
 * Edge-compatible Auth.js config (no Prisma / bcrypt).
 * Used by middleware. Full providers + DB callbacks live in auth.ts.
 */
export const authConfig = {
  providers: [],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl
      const isLoggedIn = !!auth?.user

      if (pathname.startsWith("/login")) {
        if (isLoggedIn) return Response.redirect(new URL("/dashboard", request.nextUrl))
        return true
      }

      if (!isLoggedIn) {
        return false
      }

      if (pathname.startsWith("/admin") && auth?.user?.role !== "ADMIN") {
        return Response.redirect(new URL("/dashboard", request.nextUrl))
      }

      return true
    },
    // Lightweight JWT/session for Edge — full resolution happens in auth.ts
    async jwt({ token, user }) {
      if (user) {
        if (user.id) token.id = user.id
        if ((user as { role?: string }).role != null) {
          token.role = (user as { role?: string }).role
        }
        if ("departmentId" in user) {
          token.departmentId = (user as { departmentId?: string | null }).departmentId ?? null
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        // Do not use token.sub as user id (Google subject ≠ Prisma id)
        session.user.id = (token.id as string) || ""
        session.user.role = (token.role as string) || "EMPLOYEE"
        session.user.departmentId = (token.departmentId as string | null) ?? null
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "super-secret-development-key-ecosphere",
  trustHost: true,
} satisfies NextAuthConfig
