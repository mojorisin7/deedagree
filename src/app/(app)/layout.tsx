import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { LayoutShell } from '@/components/layout/layout-shell'
import type { Role } from '@prisma/client'
import { Toaster } from '@/components/ui/sonner'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const user = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role as Role,
    organisationId: session.user.organisationId,
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <LayoutShell user={user}>
        {children}
      </LayoutShell>
      <Toaster richColors position="top-right" />
    </div>
  )
}
