import { notFound, redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { SigningPortal } from '@/components/signing/signing-portal'
import { Toaster } from '@/components/ui/sonner'
import { AlertCircle } from 'lucide-react'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function SigningPage({ params }: PageProps) {
  const { token } = await params

  const guarantor = await prisma.guarantor.findUnique({
    where: { inviteToken: token },
    include: { deed: true },
  })

  if (!guarantor) notFound()

  if (guarantor.signatureStatus === 'SIGNED') {
    redirect(`/sign/${token}/complete`)
  }

  const isExpired = guarantor.inviteExpiresAt && guarantor.inviteExpiresAt < new Date()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 text-white py-4 px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-serif font-bold tracking-wide text-sm">DEED OF GUARANTEE</h1>
            <p className="text-slate-400 text-xs">{guarantor.deed.reference} — {guarantor.deed.companyName}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto py-8 px-4">
        {isExpired ? (
          <div className="text-center py-12 space-y-4">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
            <h2 className="text-xl font-serif font-bold text-slate-900">Signing Link Expired</h2>
            <p className="text-slate-600">This signing link has expired. Please contact the organisation that issued this deed to request a new link.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-slate-900">
                Dear {guarantor.fullName},
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                You have been asked to sign a Deed of Guarantee. Please review and sign below.
              </p>
            </div>
            <SigningPortal deed={guarantor.deed} guarantor={guarantor} token={token} />
          </div>
        )}
      </div>
      <Toaster richColors position="top-center" />
    </div>
  )
}
