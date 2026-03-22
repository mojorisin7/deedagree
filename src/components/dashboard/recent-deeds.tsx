import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Reference</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Lender</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Guarantors</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-10"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deeds.map((deed) => {
          const cfg = statusConfig[deed.status]
          return (
            <TableRow key={deed.id} className="hover:bg-slate-50">
              <TableCell className="font-mono text-xs font-medium">{deed.reference}</TableCell>
              <TableCell className="font-medium">{deed.companyName}</TableCell>
              <TableCell className="text-slate-600 text-sm">{deed.lender}</TableCell>
              <TableCell className="text-sm">{formatCurrency(deed.mortgageAmount)}</TableCell>
              <TableCell className="text-center text-sm">
                {deed.guarantors.length}
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.className}`}>
                  {cfg.label}
                </span>
              </TableCell>
              <TableCell className="text-sm text-slate-500">{formatDate(deed.createdAt)}</TableCell>
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
  )
}
