import { redirect } from 'next/navigation'
import { auth } from './auth'
import type { Role } from '@prisma/client'

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  return session.user
}

export async function requireRole(...roles: Role[]) {
  const user = await requireAuth()
  if (!roles.includes(user.role as Role)) redirect('/unauthorized')
  return user
}

export function canManageDeeds(role: string): boolean {
  return ['ADMIN', 'SOLICITOR', 'BROKER'].includes(role)
}

export function canAdminister(role: string): boolean {
  return role === 'ADMIN'
}
