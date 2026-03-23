'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import type { Role } from '@prisma/client'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  roles?: Role[]
}

const navItems: NavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/deeds', icon: FileText, label: 'Deeds' },
  { href: '/audit', icon: ClipboardList, label: 'Audit Log', roles: ['ADMIN', 'SOLICITOR'] },
  { href: '/settings', icon: Settings, label: 'Settings' },
  { href: '/admin', icon: Shield, label: 'Admin', roles: ['ADMIN'] },
]

interface SidebarProps {
  userRole: Role
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ userRole, mobileOpen = false, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex relative flex-col bg-slate-900 text-slate-100 transition-all duration-200 h-full',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          {!collapsed && (
            <div>
              <p className="font-serif font-bold text-sm tracking-wider">DEED OF</p>
              <p className="font-serif font-bold text-sm tracking-wider text-amber-400">GUARANTEE</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors ml-auto"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all',
                  isActive
                    ? 'bg-blue-900 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {!collapsed && (
          <div className="p-4 border-t border-slate-700 text-xs text-slate-500">
            <p>v1.0.0 — Legal Document Management</p>
          </div>
        )}
      </aside>

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col w-72 bg-slate-900 text-slate-100 transition-transform duration-250 md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div>
            <p className="font-serif font-bold text-sm tracking-wider">DEED OF</p>
            <p className="font-serif font-bold text-sm tracking-wider text-amber-400">GUARANTEE</p>
          </div>
          <button
            onClick={onMobileClose}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-all',
                  isActive
                    ? 'bg-blue-900 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-700 text-xs text-slate-500">
          <p>v1.0.0 — Legal Document Management</p>
        </div>
      </aside>
    </>
  )
}
