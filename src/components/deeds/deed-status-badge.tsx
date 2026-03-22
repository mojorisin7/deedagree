import type { DeedStatus } from '@prisma/client'

const statusConfig: Record<DeedStatus, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-slate-100 text-slate-700 border border-slate-200' },
  PENDING_SIGNATURES: { label: 'Pending Signatures', className: 'bg-amber-100 text-amber-800 border border-amber-200' },
  PARTIALLY_SIGNED: { label: 'Partially Signed', className: 'bg-blue-100 text-blue-800 border border-blue-200' },
  FULLY_SIGNED: { label: 'Fully Signed', className: 'bg-indigo-100 text-indigo-800 border border-indigo-200' },
  COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-800 border border-green-200' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-800 border border-red-200' },
}

interface DeedStatusBadgeProps {
  status: DeedStatus
  className?: string
}

export function DeedStatusBadge({ status, className = '' }: DeedStatusBadgeProps) {
  const cfg = statusConfig[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className} ${className}`}>
      {cfg.label}
    </span>
  )
}
