'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { logAudit } from '@/lib/audit'
import { generateDeedReference } from '@/lib/reference'
import { generateInviteToken, getInviteExpiry } from '@/lib/tokens'
import { sendInviteEmail, sendReminderEmail } from '@/lib/email'
import { formatCurrency, formatDate } from '@/lib/formatting'
import type { ActionResult } from '@/types'
import type { CreateDeedInput } from '@/lib/validations/deed'
import type { DeedStatus, GuaranteeType, GoverningLaw } from '@prisma/client'

async function getAuthUser() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')
  return session.user
}

export async function createDeedAction(data: CreateDeedInput): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthUser()

    const deed = await prisma.$transaction(async (tx) => {
      const reference = await generateDeedReference(tx as Parameters<Parameters<typeof prisma.$transaction>[0]>[0])

      return tx.deed.create({
        data: {
          reference,
          status: 'DRAFT',
          companyName: data.company.companyName,
          companyRegNumber: data.company.companyRegNumber,
          companyAddress: data.company.companyAddress,
          companyIncDate: data.company.companyIncDate ? new Date(data.company.companyIncDate) : null,
          directorName: data.company.directorName,
          directorEmail: data.company.directorEmail,
          propertyAddress: data.property.propertyAddress,
          titleNumber: data.property.titleNumber,
          mortgageAmount: data.property.mortgageAmount,
          lender: data.property.lender,
          lenderAddress: data.property.lenderAddress,
          mortgageRef: data.property.mortgageRef,
          mortgageStartDate: data.property.mortgageStartDate ? new Date(data.property.mortgageStartDate) : null,
          mortgageTermYears: data.property.mortgageTermYears,
          guaranteeType: data.terms.guaranteeType as GuaranteeType,
          limitedAmount: data.terms.limitedAmount,
          governingLaw: data.terms.governingLaw as GoverningLaw,
          executionDate: data.terms.executionDate ? new Date(data.terms.executionDate) : null,
          specialConditions: data.terms.specialConditions,
          jointAndSeveral: data.terms.jointAndSeveral,
          includesInterest: data.terms.includesInterest,
          includesCosts: data.terms.includesCosts,
          requiresILA: data.terms.requiresILA,
          createdById: user.id,
          guarantors: {
            create: data.guarantors.map((g, idx) => ({
              fullName: g.fullName,
              email: g.email,
              dateOfBirth: g.dateOfBirth ? new Date(g.dateOfBirth) : null,
              address: g.address,
              phone: g.phone,
              relationshipToCompany: g.relationshipToCompany,
              maxIndividualLiability: g.maxIndividualLiability,
              sortOrder: idx,
            })),
          },
        },
      })
    })

    await logAudit({
      action: 'DEED_CREATED',
      deedId: deed.id,
      userId: user.id,
      metadata: { reference: deed.reference, companyName: deed.companyName },
    })

    revalidatePath('/deeds')
    revalidatePath('/dashboard')

    return { success: true, data: { id: deed.id } }
  } catch (error) {
    console.error('createDeedAction error:', error)
    return { success: false, error: 'Failed to create deed. Please try again.' }
  }
}

export async function updateDeedAction(
  id: string,
  data: Partial<CreateDeedInput>
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()

    const existing = await prisma.deed.findUnique({ where: { id, deletedAt: null } })
    if (!existing) return { success: false, error: 'Deed not found' }
    if (existing.status !== 'DRAFT') return { success: false, error: 'Only draft deeds can be edited' }

    const updateData: Record<string, unknown> = {}

    if (data.company) {
      updateData.companyName = data.company.companyName
      updateData.companyRegNumber = data.company.companyRegNumber
      updateData.companyAddress = data.company.companyAddress
      updateData.companyIncDate = data.company.companyIncDate ? new Date(data.company.companyIncDate) : null
      updateData.directorName = data.company.directorName
      updateData.directorEmail = data.company.directorEmail
    }

    if (data.property) {
      updateData.propertyAddress = data.property.propertyAddress
      updateData.titleNumber = data.property.titleNumber
      updateData.mortgageAmount = data.property.mortgageAmount
      updateData.lender = data.property.lender
      updateData.lenderAddress = data.property.lenderAddress
      updateData.mortgageRef = data.property.mortgageRef
      updateData.mortgageStartDate = data.property.mortgageStartDate ? new Date(data.property.mortgageStartDate) : null
      updateData.mortgageTermYears = data.property.mortgageTermYears
    }

    if (data.terms) {
      updateData.guaranteeType = data.terms.guaranteeType
      updateData.limitedAmount = data.terms.limitedAmount
      updateData.governingLaw = data.terms.governingLaw
      updateData.executionDate = data.terms.executionDate ? new Date(data.terms.executionDate) : null
      updateData.specialConditions = data.terms.specialConditions
      updateData.jointAndSeveral = data.terms.jointAndSeveral
      updateData.includesInterest = data.terms.includesInterest
      updateData.includesCosts = data.terms.includesCosts
      updateData.requiresILA = data.terms.requiresILA
    }

    await prisma.deed.update({ where: { id }, data: updateData })

    await logAudit({
      action: 'DEED_UPDATED',
      deedId: id,
      userId: user.id,
    })

    revalidatePath(`/deeds/${id}`)
    revalidatePath('/deeds')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('updateDeedAction error:', error)
    return { success: false, error: 'Failed to update deed' }
  }
}

export async function deleteDeedAction(id: string): Promise<ActionResult> {
  try {
    const user = await getAuthUser()

    await prisma.deed.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'CANCELLED' },
    })

    await logAudit({ action: 'DEED_DELETED', deedId: id, userId: user.id })

    revalidatePath('/deeds')
    revalidatePath('/dashboard')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('deleteDeedAction error:', error)
    return { success: false, error: 'Failed to delete deed' }
  }
}

export async function updateDeedStatusAction(
  id: string,
  status: DeedStatus
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()

    const deed = await prisma.deed.update({
      where: { id },
      data: { status },
    })

    await logAudit({
      action: 'DEED_STATUS_CHANGED',
      deedId: id,
      userId: user.id,
      metadata: { newStatus: status, reference: deed.reference },
    })

    revalidatePath(`/deeds/${id}`)
    revalidatePath('/deeds')
    revalidatePath('/dashboard')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('updateDeedStatusAction error:', error)
    return { success: false, error: 'Failed to update deed status' }
  }
}

export async function sendInvitesAction(deedId: string, guarantorIds?: string[]): Promise<ActionResult> {
  try {
    const user = await getAuthUser()

    const deed = await prisma.deed.findUnique({
      where: { id: deedId },
      include: { guarantors: true },
    })

    if (!deed) return { success: false, error: 'Deed not found' }

    const toInvite = guarantorIds
      ? deed.guarantors.filter((g) => guarantorIds.includes(g.id) && g.signatureStatus !== 'SIGNED')
      : deed.guarantors.filter((g) => g.signatureStatus !== 'SIGNED')

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    for (const guarantor of toInvite) {
      const token = generateInviteToken()
      const expiresAt = getInviteExpiry()

      await prisma.guarantor.update({
        where: { id: guarantor.id },
        data: {
          inviteToken: token,
          inviteExpiresAt: expiresAt,
          inviteSentAt: new Date(),
          signatureStatus: 'INVITED',
        },
      })

      await sendInviteEmail({
        to: guarantor.email,
        guarantorName: guarantor.fullName,
        deedReference: deed.reference,
        companyName: deed.companyName,
        propertyAddress: deed.propertyAddress,
        mortgageAmountFormatted: formatCurrency(deed.mortgageAmount),
        lender: deed.lender,
        signingUrl: `${appUrl}/sign/${token}`,
        expiryDate: formatDate(expiresAt),
      })

      await logAudit({
        action: 'INVITE_SENT',
        deedId: deed.id,
        userId: user.id,
        guarantorId: guarantor.id,
        metadata: { guarantorEmail: guarantor.email, expiresAt: expiresAt.toISOString() },
      })
    }

    // Update deed status
    if (deed.status === 'DRAFT') {
      await prisma.deed.update({
        where: { id: deedId },
        data: { status: 'PENDING_SIGNATURES' },
      })
    }

    revalidatePath(`/deeds/${deedId}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('sendInvitesAction error:', error)
    return { success: false, error: 'Failed to send invitations' }
  }
}

export async function sendReminderAction(guarantorId: string): Promise<ActionResult> {
  try {
    const user = await getAuthUser()

    const guarantor = await prisma.guarantor.findUnique({
      where: { id: guarantorId },
      include: { deed: true },
    })

    if (!guarantor || !guarantor.inviteToken) {
      return { success: false, error: 'Guarantor not found or not yet invited' }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const expiryDate = guarantor.inviteExpiresAt ?? new Date()
    const daysRemaining = Math.max(
      0,
      Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    )

    await sendReminderEmail({
      to: guarantor.email,
      guarantorName: guarantor.fullName,
      deedReference: guarantor.deed.reference,
      companyName: guarantor.deed.companyName,
      propertyAddress: guarantor.deed.propertyAddress,
      mortgageAmountFormatted: formatCurrency(guarantor.deed.mortgageAmount),
      lender: guarantor.deed.lender,
      signingUrl: `${appUrl}/sign/${guarantor.inviteToken}`,
      expiryDate: formatDate(expiryDate),
      daysRemaining,
    })

    await prisma.guarantor.update({
      where: { id: guarantorId },
      data: { lastReminderAt: new Date() },
    })

    await logAudit({
      action: 'REMINDER_SENT',
      deedId: guarantor.deedId,
      userId: user.id,
      guarantorId,
    })

    revalidatePath(`/deeds/${guarantor.deedId}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('sendReminderAction error:', error)
    return { success: false, error: 'Failed to send reminder' }
  }
}
