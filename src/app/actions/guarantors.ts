'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { logAudit } from '@/lib/audit'
import type { ActionResult } from '@/types'
import type { GuarantorInput } from '@/lib/validations/deed'

async function getAuthUser() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')
  return session.user
}

export async function addGuarantorAction(
  deedId: string,
  data: GuarantorInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthUser()

    const deed = await prisma.deed.findUnique({ where: { id: deedId, deletedAt: null } })
    if (!deed) return { success: false, error: 'Deed not found' }
    if (deed.status !== 'DRAFT') return { success: false, error: 'Cannot add guarantors to a deed that is not in draft status' }

    const count = await prisma.guarantor.count({ where: { deedId } })

    const guarantor = await prisma.guarantor.create({
      data: {
        deedId,
        fullName: data.fullName,
        email: data.email,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        address: data.address,
        phone: data.phone,
        relationshipToCompany: data.relationshipToCompany,
        maxIndividualLiability: data.maxIndividualLiability,
        sortOrder: count,
      },
    })

    await logAudit({
      action: 'GUARANTOR_ADDED',
      deedId,
      userId: user.id,
      guarantorId: guarantor.id,
      metadata: { fullName: guarantor.fullName, email: guarantor.email },
    })

    revalidatePath(`/deeds/${deedId}`)
    return { success: true, data: { id: guarantor.id } }
  } catch (error) {
    console.error('addGuarantorAction error:', error)
    return { success: false, error: 'Failed to add guarantor' }
  }
}

export async function updateGuarantorAction(
  guarantorId: string,
  data: Partial<GuarantorInput>
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()

    const guarantor = await prisma.guarantor.findUnique({ where: { id: guarantorId } })
    if (!guarantor) return { success: false, error: 'Guarantor not found' }

    await prisma.guarantor.update({
      where: { id: guarantorId },
      data: {
        fullName: data.fullName,
        email: data.email,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        address: data.address,
        phone: data.phone,
        relationshipToCompany: data.relationshipToCompany,
        maxIndividualLiability: data.maxIndividualLiability,
      },
    })

    await logAudit({
      action: 'GUARANTOR_ADDED',
      deedId: guarantor.deedId,
      userId: user.id,
      guarantorId,
    })

    revalidatePath(`/deeds/${guarantor.deedId}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('updateGuarantorAction error:', error)
    return { success: false, error: 'Failed to update guarantor' }
  }
}

export async function removeGuarantorAction(guarantorId: string): Promise<ActionResult> {
  try {
    const user = await getAuthUser()

    const guarantor = await prisma.guarantor.findUnique({ where: { id: guarantorId } })
    if (!guarantor) return { success: false, error: 'Guarantor not found' }

    await prisma.guarantor.delete({ where: { id: guarantorId } })

    await logAudit({
      action: 'GUARANTOR_REMOVED',
      deedId: guarantor.deedId,
      userId: user.id,
      metadata: { fullName: guarantor.fullName },
    })

    revalidatePath(`/deeds/${guarantor.deedId}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('removeGuarantorAction error:', error)
    return { success: false, error: 'Failed to remove guarantor' }
  }
}

export async function reorderGuarantorsAction(
  deedId: string,
  orderedIds: string[]
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()

    await prisma.$transaction(
      orderedIds.map((id, idx) =>
        prisma.guarantor.update({
          where: { id },
          data: { sortOrder: idx },
        })
      )
    )

    await logAudit({
      action: 'GUARANTOR_REORDERED',
      deedId,
      userId: user.id,
    })

    revalidatePath(`/deeds/${deedId}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('reorderGuarantorsAction error:', error)
    return { success: false, error: 'Failed to reorder guarantors' }
  }
}
