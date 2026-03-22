'use server'

import path from 'path'
import fs from 'fs/promises'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { logAudit } from '@/lib/audit'
import { generateDeedPdf } from '@/lib/pdf-generator'
import type { ActionResult } from '@/types'

async function getAuthUser() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')
  return session.user
}

export async function generatePdfAction(deedId: string): Promise<ActionResult<{ documentId: string }>> {
  try {
    const user = await getAuthUser()

    if (!['ADMIN', 'SOLICITOR'].includes(user.role as string)) {
      return { success: false, error: 'Insufficient permissions' }
    }

    const deed = await prisma.deed.findUnique({
      where: { id: deedId },
      include: {
        guarantors: { orderBy: { sortOrder: 'asc' } },
        createdBy: true,
        organisation: true,
        documents: true,
      },
    })

    if (!deed) return { success: false, error: 'Deed not found' }

    const pdfBuffer = await generateDeedPdf(deed as Parameters<typeof generateDeedPdf>[0])

    const uploadDir = process.env.UPLOAD_DIR ?? './uploads'
    await fs.mkdir(uploadDir, { recursive: true })

    const version = deed.documents.length + 1
    const filename = `${deed.reference}-v${version}.pdf`
    const storagePath = path.join(uploadDir, filename)
    await fs.writeFile(storagePath, pdfBuffer)

    const doc = await prisma.document.create({
      data: {
        deedId,
        filename,
        storagePath,
        mimeType: 'application/pdf',
        sizeBytes: pdfBuffer.length,
        version,
      },
    })

    await logAudit({
      action: 'DOCUMENT_GENERATED',
      deedId,
      userId: user.id,
      metadata: { documentId: doc.id, filename, version },
    })

    return { success: true, data: { documentId: doc.id } }
  } catch (error) {
    console.error('generatePdfAction error:', error)
    return { success: false, error: 'Failed to generate PDF' }
  }
}
