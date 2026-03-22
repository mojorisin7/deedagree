import prisma from '@/lib/prisma'
import { formatDate } from '@/lib/formatting'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ action?: string; page?: string; q?: string }>
}

export default async function AuditPage({ searchParams }: PageProps) {
  const params = await searchParams
  const action = params.action
  const q = params.q ?? ''
  const page = parseInt(params.page ?? '1', 10)
  const perPage = 50

  const where = {
    ...(action && { action }),
    ...(q && {
      OR: [
        { action: { contains: q, mode: 'insensitive' as const } },
        { deed: { reference: { contains: q, mode: 'insensitive' as const } } },
        { deed: { companyName: { contains: q, mode: 'insensitive' as const } } },
      ],
    }),
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        deed: { select: { id: true, reference: true, companyName: true } },
        user: { select: { name: true, email: true } },
        guarantor: { select: { fullName: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ])

  const totalPages = Math.ceil(total / perPage)

  const distinctActions = await prisma.auditLog.findMany({
    distinct: ['action'],
    select: { action: true },
    orderBy: { action: 'asc' },
  })

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-serif font-bold text-slate-900">Audit Log</h2>
        <p className="text-slate-500 text-sm">{total} event{total !== 1 ? 's' : ''} recorded</p>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-4">
          <form className="flex gap-3 flex-wrap">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by action, reference, or company..."
              className="flex-1 min-w-48 px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
            <select
              name="action"
              defaultValue={action ?? ''}
              className="px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
            >
              <option value="">All Actions</option>
              {distinctActions.map((a) => (
                <option key={a.action} value={a.action}>{a.action}</option>
              ))}
            </select>
            <Button type="submit" variant="outline" size="sm">Filter</Button>
            {(q || action) && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/audit">Clear</Link>
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Deed</TableHead>
                <TableHead>User / Guarantor</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{log.action}</span>
                  </TableCell>
                  <TableCell>
                    {log.deed ? (
                      <Link href={`/deeds/${log.deed.id}`} className="text-xs text-blue-900 hover:underline font-mono">
                        {log.deed.reference}
                      </Link>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {log.user?.name ?? log.user?.email ?? log.guarantor?.fullName ?? '—'}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-slate-500">{log.ipAddress ?? '—'}</TableCell>
                  <TableCell className="text-xs text-slate-500 max-w-xs truncate">
                    {log.metadata ? JSON.stringify(log.metadata) : '—'}
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">No audit records found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <p>Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            {page > 1 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/audit?q=${q}&action=${action ?? ''}&page=${page - 1}`}>Previous</Link>
              </Button>
            )}
            {page < totalPages && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/audit?q=${q}&action=${action ?? ''}&page=${page + 1}`}>Next</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
