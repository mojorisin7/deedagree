'use server'

import { revalidatePath } from 'next/cache'
import path from 'path'
import fs from 'fs/promises'
import prisma from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { generateDeedPdf } from '@/lib/pdf-generator'
import { sendCompletionEmail } from '@/lib/email'
import type { ActionResult } from '@/types'

interface SubmitSignatureParams {
  token: string
  signatureData: string
  witnessName: string
  witnessAddress: string
  witnessSignatureData?: string
  ipAddress: string
  userAgent?: string
  ilaConfirmed: boolean
  termsConfirmed: boolean
  voluntaryConfirmed: boolean
  liabilityConfirmed: boolean
}

export async function submitSignatureAction(params: SubmitSignatureParams): Promise<ActionResult> {
  try {
    const guarantor = await prisma.guarantor.findUnique({
      where: { inviteToken: params.token },
      include: {
        deed: {
          include: {
            guarantors: true,
            createdBy: true,
            organisation: true,
            documents: true,
          },
        },
      },
    })

    if (!guarantor) return { success: false, error: 'Invalid signing link' }
    if (guarantor.signatureStatus === 'SIGNED') return { success: false, error: 'Already signed' }

    if (guarantor.inviteExpiresAt && guarantor.inviteExpiresAt < new Date()) {
      return { success: false, error: 'This signing link has expired' }
    }

    if (
      !params.signatureData.startsWith('data:image/png;base64,') &&
      !params.signatureData.startsWith('data:image/jpeg;base64,')
    ) {
      return { success: false, error: 'Invalid signature data' }
    }

    if (params.signatureData.length > 512 * 1024) {
      return { success: false, error: 'Signature image is too large' }
    }

    if (!params.ilaConfirmed || !params.termsConfirmed || !params.voluntaryConfirmed || !params.liabilityConfirmed) {
      return { success: false, error: 'All confirmations must be checked' }
    }

    // Update the guarantor record
    await prisma.guarantor.update({
      where: { id: guarantor.id },
      data: {
        signatureStatus: 'SIGNED',
        signatureData: params.signatureData,
        signedAt: new Date(),
        signedIpAddress: params.ipAddress,
        signedUserAgent: params.userAgent,
        witnessName: params.witnessName,
        witnessAddress: params.witnessAddress,
        witnessSignature: params.witnessSignatureData,
        witnessSignedAt: new Date(),
        ilaConfirmed: params.ilaConfirmed,
        termsConfirmed: params.termsConfirmed,
        voluntaryConfirmed: params.voluntaryConfirmed,
        liabilityConfirmed: params.liabilityConfirmed,
      },
    })

    await logAudit({
      action: 'GUARANTOR_SIGNED',
      deedId: guarantor.deedId,
      guarantorId: guarantor.id,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: {
        guarantorName: guarantor.fullName,
        signedAt: new Date().toISOString(),
      },
    })

    // Refresh deed with updated guarantors
    const updatedDeed = await prisma.deed.findUnique({
      where: { id: guarantor.deedId },
      include: {
        guarantors: true,
        createdBy: true,
        organisation: true,
        documents: true,
      },
    })

    if (!updatedDeed) return { success: true, data: undefined }

    const allSigned = updatedDeed.guarantors.every((g) => g.signatureStatus === 'SIGNED')

    if (allSigned) {
      // Update deed status
      await prisma.deed.update({
        where: { id: updatedDeed.id },
        data: { status: 'FULLY_SIGNED' },
      })

      await logAudit({
        action: 'DEED_STATUS_CHANGED',
        deedId: updatedDeed.id,
        metadata: { newStatus: 'FULLY_SIGNED' },
      })

      // Generate PDF
      try {
        const deedWithDocs = {
          ...updatedDeed,
          // Override the just-signed guarantor with updated data
          guarantors: updatedDeed.guarantors.map((g) =>
            g.id === guarantor.id
              ? {
                  ...g,
                  signatureStatus: 'SIGNED' as const,
                  signatureData: params.signatureData,
                  signedAt: new Date(),
                  witnessName: params.witnessName,
                  witnessAddress: params.witnessAddress,
                  witnessSignature: params.witnessSignatureData ?? null,
                }
              : g
          ),
        }

        const pdfBuffer = await generateDeedPdf(deedWithDocs as Parameters<typeof generateDeedPdf>[0])

        const uploadDir = process.env.UPLOAD_DIR ?? './uploads'
        await fs.mkdir(uploadDir, { recursive: true })

        const filename = `${updatedDeed.reference}-signed.pdf`
        const storagePath = path.join(uploadDir, filename)
        await fs.writeFile(storagePath, pdfBuffer)

        const doc = await prisma.document.create({
          data: {
            deedId: updatedDeed.id,
            filename,
            storagePath,
            mimeType: 'application/pdf',
            sizeBytes: pdfBuffer.length,
          },
        })

        await logAudit({
          action: 'DOCUMENT_GENERATED',
          deedId: updatedDeed.id,
          metadata: { documentId: doc.id, filename },
        })

        // Send completion emails
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
        const downloadUrl = `${appUrl}/api/documents/${doc.id}`

        const allEmails = [
          updatedDeed.createdBy.email,
          ...updatedDeed.guarantors.map((g) => g.email),
        ].filter(Boolean) as string[]

        await sendCompletionEmail({
          to: allEmails,
          recipientName: updatedDeed.createdBy.name ?? updatedDeed.createdBy.email ?? '',
          deedReference: updatedDeed.reference,
          companyName: updatedDeed.companyName,
          downloadUrl,
        })
      } catch (pdfError) {
        console.error('PDF generation failed:', pdfError)
        // Don't fail the signing action if PDF generation fails
      }
    } else {
      // Update to partially signed if at least one has signed
      const anyPreviouslySigned = updatedDeed.guarantors.some(
        (g) => g.id !== guarantor.id && g.signatureStatus === 'SIGNED'
      )
      if (anyPreviouslySigned || updatedDeed.guarantors.length > 1) {
        await prisma.deed.update({
          where: { id: updatedDeed.id },
          data: { status: 'PARTIALLY_SIGNED' },
        })
      }
    }

    return { success: true, data: undefined }
  } catch (error) {
    console.error('submitSignatureAction error:', error)
    return { success: false, error: 'Failed to record signature. Please try again.' }
  }
}
