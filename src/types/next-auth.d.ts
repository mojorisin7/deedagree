import type { DefaultSession } from 'next-auth'
import type { Role } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: Role
      organisationId: string | null
    } & DefaultSession['user']
  }

  interface User {
    role: Role
    organisationId: string | null
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string
    role: Role
    organisationId: string | null
  }
}
