'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sendInvitesAction } from '@/app/actions/deeds'
import { toast } from 'sonner'
import { Mail, Loader2 } from 'lucide-react'

interface SendInvitesButtonProps {
  deedId: string
}

export function SendInvitesButton({ deedId }: SendInvitesButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    setLoading(true)
    const result = await sendInvitesAction(deedId)
    setLoading(false)

    if (result.success) {
      toast.success('Signature requests sent to all guarantors')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Button onClick={handleSend} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
      Send Invites
    </Button>
  )
}
