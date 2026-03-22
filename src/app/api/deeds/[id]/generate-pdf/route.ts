import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generatePdfAction } from '@/app/actions/documents'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const result = await generatePdfAction(id)

  if (result.success) {
    return NextResponse.json({ documentId: result.data.documentId })
  }
  return NextResponse.json({ error: result.error }, { status: 400 })
}
