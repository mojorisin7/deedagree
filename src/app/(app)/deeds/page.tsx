import Link from 'next/link'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DeedStatusBadge } from '@/components/deeds/deed-status-badge'
import { formatCurrency, formatDate } from '@/lib/formatting'
import { Plus, ArrowRight } from 'lucide-react'
import type { DeedStatus } from '@prisma/client'

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>
}

export default async function DeedsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const q = params.q ?? ''
  const status = params.status as DeedStatus | undefined
  const page = parseInt(params.page ?? '1', 10)
  const perPage = 20

  const where = {
    deletedAt: null,
    ...(status && { status }),
    ...(q && {
      OR: [
        { companyName: { contains: q, mode: 'insensitive' as const } },
        { reference: { contains: q, mode: 'insensitive' as const } },
        { lender: { contains: q, mode: 'insensitive' as const } },
        { guarantors: { some: { fullName: { contains: q, mode: 'insensitive' as const } } } },
      ],
    }),
  }

  const [deeds, total] = await Promise.all([
    prisma.deed.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
      include: { guarantors: true },
    }),
    prisma.deed.count({ where }),
  ])

  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-900">Deeds</h2>
          <p className="text-slate-500 text-sm">{total} deed{total !== 1 ? 's' : ''} found</p>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/deeds/new">
            <Plus className="h-4 w-4 mr-2" />
            New Deed
          </Link>
        </Button>
      </div>

      {/* Search/Filter Bar */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <form className="flex flex-col sm:flex-row gap-3">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by company, lender, guarantor, or reference..."
              className="flex-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
            <div className="flex gap-2">
              <select
                name="status"
                defaultValue={status ?? ''}
                className="flex-1 sm:flex-none px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="PENDING_SIGNATURES">Pending Signatures</option>
                <option value="PARTIALLY_SIGNED">Partially Signed</option>
                <option value="FULLY_SIGNED">Fully Signed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <Button type="submit" variant="outline" size="sm">Search</Button>
              {(q || status) && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/deeds">Clear</Link>
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardContent className="p-0">
          {deeds.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <p className="text-sm">No deeds found.</p>
              <Button asChild className="mt-4" size="sm">
                <Link href="/deeds/new">Create your first deed</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Lender</TableHead>
                    <TableHead className="hidden sm:table-cell">Amount</TableHead>
                    <TableHead className="hidden md:table-cell">Guarantors</TableHead>
                    <TableHead className="hidden md:table-cell">Created</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deeds.map((deed) => (
                    <TableRow key={deed.id} className="hover:bg-slate-50">
                      <TableCell>
                        <p className="font-medium text-sm">{deed.companyName}</p>
                        <p className="font-mono text-xs text-slate-500">{deed.reference}</p>
                      </TableCell>
                      <TableCell>
                        <DeedStatusBadge status={deed.status} />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-slate-600 text-sm">{deed.lender}</TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{formatCurrency(deed.mortgageAmount)}</TableCell>
                      <TableCell className="hidden md:table-cell text-center text-sm">
                        <span className="text-slate-600">
                          {deed.guarantors.filter((g) => g.signatureStatus === 'SIGNED').length}/{deed.guarantors.length} signed
                        </span>
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
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <p>Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            {page > 1 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/deeds?q=${q}&status=${status ?? ''}&page=${page - 1}`}>Previous</Link>
              </Button>
            )}
            {page < totalPages && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/deeds?q=${q}&status=${status ?? ''}&page=${page + 1}`}>Next</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
