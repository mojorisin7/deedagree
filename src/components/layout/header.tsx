'use client'

import { signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { LogOut, Settings, Menu } from 'lucide-react'
import type { Role } from '@prisma/client'

function getPageTitle(pathname: string): string {
  const routes: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/deeds': 'Deeds',
    '/audit': 'Audit Log',
    '/settings': 'Settings',
    '/admin': 'Administration',
  }

  for (const [prefix, title] of Object.entries(routes)) {
    if (pathname.startsWith(prefix)) return title
  }
  return 'Deed of Guarantee'
}

const roleBadgeVariant: Record<Role, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  ADMIN: 'default',
  SOLICITOR: 'secondary',
  BROKER: 'outline',
  VIEWER: 'outline',
}

interface HeaderProps {
  user: {
    name?: string | null
    email?: string | null
    role: Role
  }
  onMenuToggle?: () => void
}

export function Header({ user, onMenuToggle }: HeaderProps) {
  const pathname = usePathname()
  const title = getPageTitle(pathname)

  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : (user.email?.[0] ?? 'U').toUpperCase()

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 bg-white border-b border-slate-200">
      <div className="flex items-center gap-3">
        {/* Hamburger - mobile only */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-serif font-semibold text-slate-900">{title}</h1>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <Badge variant={roleBadgeVariant[user.role]} className="text-xs hidden sm:inline-flex">
          {user.role}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarFallback className="bg-blue-900 text-white text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <p className="font-medium text-sm">{user.name ?? 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => { window.location.href = '/settings' }} className="flex items-center gap-2 cursor-pointer">
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 flex items-center gap-2 cursor-pointer"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
