import Link from 'next/link'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { RecentDeeds } from '@/components/dashboard/recent-deeds'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import type { DeedWithRelations } from '@/types'

export default async function DashboardPage() {
  const session = await auth()
  const userId = session?.user?.id

  const [total, pending, completed, drafts, recentDeeds, recentLogs] = await Promise.all([
    prisma.deed.count({ where: { deletedAt: null } }),
    prisma.deed.count({ where: { status: 'PENDING_SIGNATURES', deletedAt: null } }),
    prisma.deed.count({ where: { status: { in: ['FULLY_SIGNED', 'COMPLETED'] }, deletedAt: null } }),
    prisma.deed.count({ where: { status: 'DRAFT', deletedAt: null } }),
    prisma.deed.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { guarantors: true, createdBy: true, organisation: true, documents: true },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { deed: { select: { reference: true, companyName: true } } },
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-900">
            Welcome back{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}
          </h2>
          <p className="text-slate-500 text-sm mt-1">Here&apos;s an overview of your deeds</p>
        </div>
        <Button asChild>
          <Link href="/deeds/new">
            <Plus className="h-4 w-4 mr-2" />
            New Deed
          </Link>
        </Button>
      </div>

      <StatsCards total={total} pending={pending} completed={completed} drafts={drafts} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-serif">Recent Deeds</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/deeds">View all →</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <RecentDeeds deeds={recentDeeds as DeedWithRelations[]} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-serif">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed logs={recentLogs as ActivityFeedProps['logs']} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

type ActivityFeedProps = {
  logs: (import('@prisma/client').AuditLog & { deed: { reference: string; companyName: string } | null })[]
}
