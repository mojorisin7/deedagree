import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/formatting'
import { ArrowRight } from 'lucide-react'
import type { DeedStatus } from '@prisma/client'
import type { DeedWithRelations } from '@/types'

const statusConfig: Record<DeedStatus, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-slate-100 text-slate-700' },
  PENDING_SIGNATURES: { label: 'Pending', className: 'bg-amber-100 text-amber-800' },
  PARTIALLY_SIGNED: { label: 'Part Signed', className: 'bg-blue-100 text-blue-800' },
  FULLY_SIGNED: { label: 'Fully Signed', className: 'bg-indigo-100 text-indigo-800' },
  COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
}

interface RecentDeedsProps {
  deeds: DeedWithRelations[]
}

export function RecentDeeds({ deeds }: RecentDeedsProps) {
  if (deeds.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p className="text-sm">No deeds created yet.</p>
        <Button asChild className="mt-4" size="sm">
          <Link href="/deeds/new">Create your first deed</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Amount</TableHead>
            <TableHead className="hidden md:table-cell">Guarantors</TableHead>
            <TableHead className="hidden md:table-cell">Created</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deeds.map((deed) => {
            const cfg = statusConfig[deed.status]
            return (
              <TableRow key={deed.id} className="hover:bg-slate-50">
                <TableCell>
                  <p className="font-medium text-sm">{deed.companyName}</p>
                  <p className="font-mono text-xs text-slate-500">{deed.reference}</p>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.className}`}>
                    {cfg.label}
                  </span>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm">{formatCurrency(deed.mortgageAmount)}</TableCell>
                <TableCell className="hidden md:table-cell text-center text-sm">
                  {deed.guarantors.length}
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-slate-500">{formatDate(deed.createdAt)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/deeds/${deed.id}`}>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
