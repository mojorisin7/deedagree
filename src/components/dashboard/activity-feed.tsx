import { formatDate } from '@/lib/formatting'
import { CheckCircle, FileText, Mail, PenLine, Trash2, AlertCircle } from 'lucide-react'
import type { AuditLog } from '@prisma/client'

const actionConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  DEED_CREATED: { icon: FileText, color: 'text-blue-600', label: 'Deed created' },
  DEED_UPDATED: { icon: FileText, color: 'text-slate-600', label: 'Deed updated' },
  DEED_DELETED: { icon: Trash2, color: 'text-red-600', label: 'Deed deleted' },
  DEED_STATUS_CHANGED: { icon: AlertCircle, color: 'text-amber-600', label: 'Status changed' },
  GUARANTOR_ADDED: { icon: PenLine, color: 'text-slate-600', label: 'Guarantor added' },
  GUARANTOR_SIGNED: { icon: CheckCircle, color: 'text-green-600', label: 'Guarantor signed' },
  INVITE_SENT: { icon: Mail, color: 'text-blue-600', label: 'Invite sent' },
  REMINDER_SENT: { icon: Mail, color: 'text-amber-600', label: 'Reminder sent' },
  DOCUMENT_GENERATED: { icon: FileText, color: 'text-indigo-600', label: 'PDF generated' },
}

interface ActivityFeedProps {
  logs: (AuditLog & { deed: { reference: string; companyName: string } | null })[]
}

export function ActivityFeed({ logs }: ActivityFeedProps) {
  if (logs.length === 0) {
    return <p className="text-sm text-slate-500 text-center py-6">No recent activity</p>
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => {
        const cfg = actionConfig[log.action] ?? { icon: AlertCircle, color: 'text-slate-500', label: log.action }
        const Icon = cfg.icon
        return (
          <div key={log.id} className="flex items-start gap-3">
            <div className={`mt-0.5 shrink-0 ${cfg.color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700">
                <span className="font-medium">{cfg.label}</span>
                {log.deed && (
                  <span className="text-slate-500"> — {log.deed.reference} ({log.deed.companyName})</span>
                )}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{formatDate(log.createdAt)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
