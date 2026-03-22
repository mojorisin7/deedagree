'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SignaturePad, type SignaturePadHandle } from './signature-pad'
import { submitSignatureAction } from '@/app/actions/signing'
import { formatCurrency, formatGoverningLaw, formatGuaranteeType } from '@/lib/formatting'
import { CheckCircle, AlertCircle, Loader2, FileText, PenLine } from 'lucide-react'
import { Toaster } from '@/components/ui/sonner'
import type { Deed, Guarantor } from '@prisma/client'

interface SigningPortalProps {
  deed: Deed
  guarantor: Guarantor
  token: string
}

export function SigningPortal({ deed, guarantor, token }: SigningPortalProps) {
  const router = useRouter()
  const [step, setStep] = useState<'info' | 'read' | 'sign' | 'witness' | 'confirm' | 'done'>('info')
  const [hasReadDeed, setHasReadDeed] = useState(false)
  const [confirmations, setConfirmations] = useState({
    identity: false,
    terms: false,
    ila: false,
    voluntary: false,
    liability: false,
  })
  const [witnessName, setWitnessName] = useState('')
  const [witnessAddress, setWitnessAddress] = useState('')
  const [capturedSignature, setCapturedSignature] = useState<string | null>(null)
  const [capturedWitnessSignature, setCapturedWitnessSignature] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const sigPadRef = useRef<SignaturePadHandle>(null)
  const witnessSigRef = useRef<SignaturePadHandle>(null)
  const deedScrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Detect when deed is scrolled to bottom
  useEffect(() => {
    if (step !== 'read' || !sentinelRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setHasReadDeed(true) },
      { threshold: 0.5 }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [step])

  const allConfirmed =
    confirmations.identity &&
    confirmations.terms &&
    (deed.requiresILA ? confirmations.ila : true) &&
    confirmations.voluntary &&
    confirmations.liability

  const handleSubmit = async () => {
    if (!witnessName.trim() || !witnessAddress.trim()) {
      toast.error('Witness name and address are required')
      return
    }

    const signatureData = capturedSignature
    if (!signatureData) {
      toast.error('Could not capture signature')
      return
    }

    setSubmitting(true)

    const result = await submitSignatureAction({
      token,
      signatureData,
      witnessName: witnessName.trim(),
      witnessAddress: witnessAddress.trim(),
      witnessSignatureData: capturedWitnessSignature ?? undefined,
      ipAddress: 'client', // Server will extract real IP if needed
      ilaConfirmed: confirmations.ila || !deed.requiresILA,
      termsConfirmed: confirmations.terms,
      voluntaryConfirmed: confirmations.voluntary,
      liabilityConfirmed: confirmations.liability,
    })

    setSubmitting(false)

    if (result.success) {
      router.push(`/sign/${token}/complete`)
    } else {
      toast.error(result.error)
    }
  }

  if (step === 'info') {
    return (
      <div className="space-y-6">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="font-serif text-base">Deed Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-slate-500 text-xs">Reference</span><p className="font-mono font-medium">{deed.reference}</p></div>
              <div><span className="text-slate-500 text-xs">Company</span><p className="font-medium">{deed.companyName}</p></div>
              <div><span className="text-slate-500 text-xs">Property</span><p className="font-medium">{deed.propertyAddress}</p></div>
              <div><span className="text-slate-500 text-xs">Lender</span><p className="font-medium">{deed.lender}</p></div>
              <div><span className="text-slate-500 text-xs">Mortgage Amount</span><p className="font-bold text-blue-900">{formatCurrency(deed.mortgageAmount)}</p></div>
              <div><span className="text-slate-500 text-xs">Guarantee Type</span><p className="font-medium">{formatGuaranteeType(deed.guaranteeType)}</p></div>
              <div><span className="text-slate-500 text-xs">Governing Law</span><p className="font-medium">{formatGoverningLaw(deed.governingLaw)}</p></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold">Important Notice</p>
              <p className="mt-1">By signing this deed, you personally guarantee the above mortgage obligations. This is a legally binding document. You are strongly advised to seek independent legal advice before proceeding.</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={confirmations.identity}
              onChange={(e) => setConfirmations((c) => ({ ...c, identity: e.target.checked }))}
            />
            <span className="text-sm">I confirm that I am <strong>{guarantor.fullName}</strong> and I am the intended recipient of this document.</span>
          </label>
        </div>

        <Button
          className="w-full"
          disabled={!confirmations.identity}
          onClick={() => setStep('read')}
        >
          <FileText className="h-4 w-4 mr-2" />
          Read the Deed
        </Button>
      </div>
    )
  }

  if (step === 'read') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-600">Please scroll through and read the entire deed before proceeding.</p>

        <div
          ref={deedScrollRef}
          className="border border-slate-200 rounded-lg h-96 overflow-y-auto p-6 bg-white text-sm leading-relaxed font-serif"
        >
          <h2 className="text-lg font-bold text-center mb-4 tracking-wide">DEED OF GUARANTEE</h2>
          <p className="text-center text-slate-500 mb-6">Personal Guarantee in respect of Mortgage Obligations</p>
          <p className="mb-4"><strong>Reference:</strong> {deed.reference}</p>
          <p className="mb-4">THIS DEED OF GUARANTEE is made between:</p>
          <p className="mb-2"><strong>THE BORROWER:</strong> {deed.companyName} (Reg. No. {deed.companyRegNumber}), of {deed.companyAddress}.</p>
          <p className="mb-4"><strong>THE LENDER:</strong> {deed.lender}{deed.lenderAddress ? `, ${deed.lenderAddress}` : ''}.</p>
          <p className="mb-4"><strong>THE GUARANTOR:</strong> {guarantor.fullName}{guarantor.address ? `, ${guarantor.address}` : ''}.</p>

          <h3 className="font-bold mt-6 mb-3">RECITALS</h3>
          <p className="mb-3">(A) The Borrower has entered into or proposes to enter into a mortgage with the Lender in the sum of {formatCurrency(deed.mortgageAmount)} secured on the property at {deed.propertyAddress}.</p>
          <p className="mb-3">(B) The Lender has required, as a condition of the advance, that the Guarantor(s) provide a personal guarantee.</p>
          <p className="mb-6">(C) The Guarantor has agreed to enter into this Deed on the terms set out herein.</p>

          <h3 className="font-bold mt-6 mb-3">OPERATIVE PROVISIONS</h3>
          <p className="mb-3"><strong>1. Guarantee and Indemnity.</strong> The Guarantor unconditionally and irrevocably guarantees to the Lender the due and punctual payment and discharge of all obligations of the Borrower under the mortgage, including{deed.includesInterest ? ' interest,' : ''}{deed.includesCosts ? ' costs,' : ''} whether actual or contingent (the "Guaranteed Obligations").</p>

          {deed.guaranteeType === 'LIMITED' && deed.limitedAmount && (
            <p className="mb-3"><strong>2. Maximum Liability.</strong> The maximum aggregate liability of the Guarantor under this Deed shall not exceed {formatCurrency(deed.limitedAmount)}.</p>
          )}

          <p className="mb-3"><strong>3. Preservation of Rights.</strong> The liability of the Guarantor shall not be discharged or affected by any variation, extension, or amendment to the mortgage, or any time or forbearance granted to the Borrower.</p>

          <p className="mb-3"><strong>4. Demand.</strong> The Lender may make demand under this Deed at any time. A written demand served on the Guarantor at their address shall constitute valid service.</p>

          {deed.requiresILA && (
            <p className="mb-3"><strong>5. Independent Legal Advice.</strong> The Guarantor confirms that they have been advised to seek independent legal advice prior to signing and have had the opportunity to do so.</p>
          )}

          <p className="mb-3"><strong>{deed.requiresILA ? '6' : '5'}. Governing Law.</strong> This Deed is governed by the law of {formatGoverningLaw(deed.governingLaw)}.</p>

          {deed.specialConditions && (
            <div className="mb-3">
              <p><strong>Special Conditions:</strong></p>
              <p className="mt-1 text-slate-700">{deed.specialConditions}</p>
            </div>
          )}

          <div ref={sentinelRef} className="pt-8 text-center text-slate-400 text-xs">
            — End of Deed —
          </div>
        </div>

        {!hasReadDeed && (
          <p className="text-xs text-slate-500 text-center">Please scroll to the bottom of the deed to continue.</p>
        )}

        <Button className="w-full" disabled={!hasReadDeed} onClick={() => setStep('sign')}>
          <PenLine className="h-4 w-4 mr-2" />
          Proceed to Sign
        </Button>
      </div>
    )
  }

  if (step === 'sign') {
    return (
      <div className="space-y-5">
        <div className="space-y-3">
          {[
            { key: 'terms', label: 'I have read and understood the terms of this Deed of Guarantee' },
            ...(deed.requiresILA ? [{ key: 'ila', label: 'I have had the opportunity to obtain independent legal advice prior to signing' }] : []),
            { key: 'voluntary', label: 'I enter into this guarantee voluntarily and of my own free will' },
            { key: 'liability', label: 'I understand that I may be personally liable for the amounts described in this deed' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={confirmations[key as keyof typeof confirmations]}
                onChange={(e) =>
                  setConfirmations((c) => ({ ...c, [key]: e.target.checked }))
                }
              />
              <span className="text-sm text-slate-700">{label}</span>
            </label>
          ))}
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Your Signature <span className="text-red-500">*</span></p>
          <p className="text-xs text-slate-500 mb-3">Sign using your mouse or finger in the box below</p>
          <SignaturePad ref={sigPadRef} />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep('read')}>← Back</Button>
          <Button
            className="flex-1"
            disabled={!allConfirmed}
            onClick={() => {
              if (sigPadRef.current?.isEmpty()) {
                toast.error('Please draw your signature before continuing')
                return
              }
              setCapturedSignature(sigPadRef.current?.getDataUrl() ?? null)
              setStep('witness')
            }}
          >
            Continue: Witness →
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'witness') {
    return (
      <div className="space-y-5">
        <Card className="border-blue-100 bg-blue-50">
          <CardContent className="p-4 text-sm text-blue-800">
            <p className="font-semibold">Witness Required</p>
            <p className="mt-1">Your signature must be witnessed by an independent adult who is present at the time of signing. The witness must not be a party to this deed.</p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="witnessName">Witness Full Name <span className="text-red-500">*</span></Label>
            <Input
              id="witnessName"
              value={witnessName}
              onChange={(e) => setWitnessName(e.target.value)}
              placeholder="Jane Brown"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="witnessAddress">Witness Address <span className="text-red-500">*</span></Label>
            <Textarea
              id="witnessAddress"
              value={witnessAddress}
              onChange={(e) => setWitnessAddress(e.target.value)}
              placeholder="99 Witness Lane&#10;London&#10;W1A 1AA"
              rows={3}
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Witness Signature (optional)</p>
          <SignaturePad ref={witnessSigRef} />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep('sign')}>← Back</Button>
          <Button
            className="flex-1"
            disabled={!witnessName.trim() || !witnessAddress.trim()}
            onClick={() => {
              setCapturedWitnessSignature(witnessSigRef.current?.getDataUrl() ?? null)
              setStep('confirm')
            }}
          >
            Review & Submit →
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'confirm') {
    return (
      <div className="space-y-5">
        <Card className="border-slate-200">
          <CardContent className="p-4 text-sm space-y-2">
            <p><span className="text-slate-500">Guarantor:</span> <strong>{guarantor.fullName}</strong></p>
            <p><span className="text-slate-500">Deed:</span> <span className="font-mono">{deed.reference}</span> — {deed.companyName}</p>
            <p><span className="text-slate-500">Mortgage:</span> {formatCurrency(deed.mortgageAmount)} from {deed.lender}</p>
            <p><span className="text-slate-500">Witness:</span> {witnessName}</p>
          </CardContent>
        </Card>

        <Card className="border-red-100 bg-red-50">
          <CardContent className="p-4 text-sm text-red-800">
            <p className="font-semibold">Final Confirmation</p>
            <p className="mt-1">By clicking "Sign Deed", you are executing this Deed of Guarantee as a legally binding document. This action cannot be undone.</p>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep('witness')}>← Back</Button>
          <Button
            className="flex-1 bg-green-700 hover:bg-green-800"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Signing...</>
            ) : (
              <><CheckCircle className="h-4 w-4 mr-2" />Sign Deed</>
            )}
          </Button>
        </div>
      </div>
    )
  }

  return null
}
