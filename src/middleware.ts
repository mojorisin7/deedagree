import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

const publicPaths = [
  '/login',
  '/register',
  '/sign',
  '/api/auth',
  '/unauthorized',
]

export default auth((req) => {
  const { pathname } = req.nextUrl

  const isPublic =
    publicPaths.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'

  if (!req.auth && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (req.auth && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
