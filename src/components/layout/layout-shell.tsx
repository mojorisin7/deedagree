'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import type { Role } from '@prisma/client'

interface LayoutShellProps {
  user: {
    id?: string | null
    name?: string | null
    email?: string | null
    role: Role
    organisationId?: string | null
  }
  children: React.ReactNode
}

export function LayoutShell({ user, children }: LayoutShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        userRole={user.role}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Header user={user} onMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </>
  )
}
