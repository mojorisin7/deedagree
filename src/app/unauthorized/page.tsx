import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShieldX } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <ShieldX className="h-16 w-16 text-slate-400 mx-auto" />
        <h1 className="text-2xl font-serif font-bold text-slate-900">Access Denied</h1>
        <p className="text-slate-600">You do not have permission to view this page.</p>
        <Button asChild variant="outline">
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
