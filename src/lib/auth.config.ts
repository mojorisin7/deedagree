import type { NextAuthConfig } from 'next-auth'

// Edge-safe auth config (no Prisma, no bcrypt)
// Used by middleware which runs in the Edge runtime
export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      // This is handled in middleware.ts manually
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.organisationId = (user as any).organisationId
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as any
        session.user.organisationId = (token.organisationId as any) ?? null
      }
      return session
    },
  },
}
