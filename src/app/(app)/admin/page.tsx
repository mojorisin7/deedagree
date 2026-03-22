import { requireRole } from '@/lib/auth-utils'
import prisma from '@/lib/prisma'
import { formatDate } from '@/lib/formatting'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { Role } from '@prisma/client'

const roleColors: Record<Role, string> = {
  ADMIN: 'bg-red-100 text-red-800',
  SOLICITOR: 'bg-blue-100 text-blue-800',
  BROKER: 'bg-amber-100 text-amber-800',
  VIEWER: 'bg-slate-100 text-slate-700',
}

export default async function AdminPage() {
  await requireRole('ADMIN')

  const [users, organisations, stats] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { organisation: { select: { name: true } } },
    }),
    prisma.organisation.findMany({ orderBy: { name: 'asc' } }),
    prisma.deed.groupBy({ by: ['status'], _count: true }),
  ])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif font-bold text-slate-900">Administration</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Card key={s.status} className="border-slate-200">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide">{s.status.replace(/_/g, ' ')}</p>
              <p className="text-2xl font-bold font-serif text-slate-900 mt-1">{s._count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-serif">Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Organisation</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name ?? '—'}</TableCell>
                  <TableCell className="text-sm text-slate-600">{user.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">{user.organisation?.name ?? '—'}</TableCell>
                  <TableCell className="text-sm text-slate-500">{formatDate(user.createdAt)}</TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">No users found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-serif">Organisations ({organisations.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organisations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell className="text-sm text-slate-500">{org.type.replace(/_/g, ' ')}</TableCell>
                  <TableCell className="text-sm text-slate-500">{org.email ?? '—'}</TableCell>
                  <TableCell className="text-sm text-slate-500">{formatDate(org.createdAt)}</TableCell>
                </TableRow>
              ))}
              {organisations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">No organisations found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
