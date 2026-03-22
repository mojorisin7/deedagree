import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') ?? '1', 10)
  const perPage = 50

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: { deedId: id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        user: { select: { name: true, email: true } },
        guarantor: { select: { fullName: true } },
      },
    }),
    prisma.auditLog.count({ where: { deedId: id } }),
  ])

  return NextResponse.json({ logs, total, page, perPage })
}
