import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
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
      <Sidebar userRole={user.role} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  )
}
