import type { Metadata } from 'next'
import { Geist, Geist_Mono, Libre_Baskerville } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const libreBaskerville = Libre_Baskerville({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  title: 'Deed of Guarantee',
  description: 'Legal document management for personal mortgage guarantees',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${libreBaskerville.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
