'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { sendInvitesAction, sendReminderAction } from '@/app/actions/deeds'
import { toast } from 'sonner'
import { CheckCircle, Clock, Mail, AlertCircle, RefreshCw, Users } from 'lucide-react'
import type { DeedWithRelations } from '@/types'
import type { SignatureStatus } from '@prisma/client'
import { formatDate } from '@/lib/formatting'

const statusIcons: Record<SignatureStatus, React.ElementType> = {
  PENDING: Clock,
  INVITED: Mail,
  SIGNED: CheckCircle,
  DECLINED: AlertCircle,
}

const statusColors: Record<SignatureStatus, string> = {
  PENDING: 'text-slate-400',
  INVITED: 'text-blue-500',
  SIGNED: 'text-green-500',
  DECLINED: 'text-red-500',
}

interface GuarantorStatusPanelProps {
  deed: DeedWithRelations
}

export function GuarantorStatusPanel({ deed }: GuarantorStatusPanelProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const signed = deed.guarantors.filter((g) => g.signatureStatus === 'SIGNED').length
  const total = deed.guarantors.length
  const progress = total > 0 ? (signed / total) * 100 : 0

  const handleRemind = async (guarantorId: string) => {
    setLoading(guarantorId)
    const result = await sendReminderAction(guarantorId)
    setLoading(null)
    if (result.success) toast.success('Reminder sent')
    else toast.error(result.error)
  }

  const handleResendInvite = async (guarantorId: string) => {
    setLoading(guarantorId)
    const result = await sendInvitesAction(deed.id, [guarantorId])
    setLoading(null)
    if (result.success) toast.success('Invite re-sent')
    else toast.error(result.error)
  }

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-500" />
          Signature Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>{signed} of {total} signed</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-3">
          {deed.guarantors.map((g) => {
            const Icon = statusIcons[g.signatureStatus]
            const color = statusColors[g.signatureStatus]
            const isLoading = loading === g.id

            return (
              <div key={g.id} className="flex items-start gap-3">
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{g.fullName}</p>
                  <p className="text-xs text-slate-500 truncate">{g.email}</p>
                  {g.signedAt && (
                    <p className="text-xs text-green-600 mt-0.5">Signed {formatDate(g.signedAt)}</p>
                  )}
                  {g.inviteSentAt && g.signatureStatus === 'INVITED' && (
                    <p className="text-xs text-slate-400 mt-0.5">Invited {formatDate(g.inviteSentAt)}</p>
                  )}
                </div>
                {g.signatureStatus === 'INVITED' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleRemind(g.id)}
                    disabled={isLoading}
                    title="Send reminder"
                  >
                    <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                )}
                {g.signatureStatus === 'PENDING' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleResendInvite(g.id)}
                    disabled={isLoading}
                    title="Send invite"
                  >
                    <Mail className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
