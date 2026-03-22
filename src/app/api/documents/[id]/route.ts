import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import fs from 'fs/promises'
import path from 'path'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const doc = await prisma.document.findUnique({ where: { id } })
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    const fileBuffer = await fs.readFile(doc.storagePath)
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': doc.mimeType,
        'Content-Disposition': `attachment; filename="${doc.filename}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    })
  } catch {
    return NextResponse.json({ error: 'File not found on disk' }, { status: 404 })
  }
}
