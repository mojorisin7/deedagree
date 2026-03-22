import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { CheckCircle } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/formatting'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function SigningCompletePage({ params }: PageProps) {
  const { token } = await params

  const guarantor = await prisma.guarantor.findUnique({
    where: { inviteToken: token },
    include: { deed: true },
  })

  if (!guarantor) notFound()

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Deed Signed Successfully</h1>
          <p className="text-slate-600 mt-2">
            Thank you, <strong>{guarantor.fullName}</strong>. Your signature on Deed{' '}
            <span className="font-mono">{guarantor.deed.reference}</span> has been recorded.
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-sm text-left space-y-2">
          <p><span className="text-slate-500">Company:</span> <strong>{guarantor.deed.companyName}</strong></p>
          <p><span className="text-slate-500">Mortgage Amount:</span> {formatCurrency(guarantor.deed.mortgageAmount)}</p>
          <p><span className="text-slate-500">Lender:</span> {guarantor.deed.lender}</p>
          {guarantor.signedAt && (
            <p><span className="text-slate-500">Signed on:</span> {formatDate(guarantor.signedAt)}</p>
          )}
        </div>
        <p className="text-xs text-slate-400">
          Please keep this confirmation for your records. A copy of the completed deed will be sent to you by email once all parties have signed.
        </p>
      </div>
    </div>
  )
}
