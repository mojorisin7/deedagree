import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditDeedPage({ params }: PageProps) {
  const { id } = await params

  const deed = await prisma.deed.findUnique({
    where: { id, deletedAt: null },
    include: { guarantors: { orderBy: { sortOrder: 'asc' } } },
  })

  if (!deed) notFound()
  if (deed.status !== 'DRAFT') {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-slate-600">Only draft deeds can be edited.</p>
      </div>
    )
  }

  // For simplicity, redirect to the deed detail page with a note
  return (
    <div className="max-w-2xl mx-auto py-8 text-center text-slate-600">
      <p>Editing an existing deed is not yet implemented. Please create a new deed.</p>
    </div>
  )
}
