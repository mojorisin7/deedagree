import prisma from './prisma'

export type AuditAction =
  | 'DEED_CREATED'
  | 'DEED_UPDATED'
  | 'DEED_DELETED'
  | 'DEED_STATUS_CHANGED'
  | 'GUARANTOR_ADDED'
  | 'GUARANTOR_REMOVED'
  | 'GUARANTOR_REORDERED'
  | 'INVITE_SENT'
  | 'REMINDER_SENT'
  | 'GUARANTOR_SIGNED'
  | 'GUARANTOR_DECLINED'
  | 'DOCUMENT_GENERATED'
  | 'EMAIL_SENT'
  | 'USER_LOGIN'
  | 'USER_CREATED'

interface LogAuditParams {
  action: AuditAction
  deedId?: string
  userId?: string
  guarantorId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

export async function logAudit(params: LogAuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        deedId: params.deedId,
        userId: params.userId,
        guarantorId: params.guarantorId,
        metadata: (params.metadata ?? {}) as object,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    })
  } catch (error) {
    console.error('Failed to write audit log:', error)
  }
}

export function getIpFromRequest(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}
