import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatGoverningLaw, formatGuaranteeType } from '@/lib/formatting'
import { Edit } from 'lucide-react'
import type { CompanyStepData, PropertyStepData, GuarantorFormData, TermsStepData } from '@/types'

interface Step5Props {
  company: CompanyStepData
  property: PropertyStepData
  guarantors: GuarantorFormData[]
  terms: TermsStepData
  onBack: () => void
  onSubmit: () => void
  submitting: boolean
  onJumpTo: (step: number) => void
}

export function Step5Review({ company, property, guarantors, terms, onBack, onSubmit, submitting, onJumpTo }: Step5Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Please review all information before creating the deed.</p>

      {/* Company */}
      <Card className="border-slate-200">
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">Company Details</CardTitle>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onJumpTo(1)}>
            <Edit className="h-3 w-3 mr-1" />Edit
          </Button>
        </CardHeader>
        <CardContent className="px-4 pb-4 text-sm space-y-1">
          <p><span className="text-slate-500">Name:</span> <strong>{company.companyName}</strong></p>
          <p><span className="text-slate-500">Reg Number:</span> <span className="font-mono">{company.companyRegNumber}</span></p>
          <p><span className="text-slate-500">Address:</span> {company.companyAddress}</p>
          {company.directorName && <p><span className="text-slate-500">Director:</span> {company.directorName}</p>}
        </CardContent>
      </Card>

      {/* Property */}
      <Card className="border-slate-200">
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">Property & Mortgage</CardTitle>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onJumpTo(2)}>
            <Edit className="h-3 w-3 mr-1" />Edit
          </Button>
        </CardHeader>
        <CardContent className="px-4 pb-4 text-sm space-y-1">
          <p><span className="text-slate-500">Property:</span> {property.propertyAddress}</p>
          <p><span className="text-slate-500">Amount:</span> <strong className="text-blue-900">{formatCurrency(property.mortgageAmount)}</strong></p>
          <p><span className="text-slate-500">Lender:</span> {property.lender}</p>
          {property.mortgageTermYears && <p><span className="text-slate-500">Term:</span> {property.mortgageTermYears} years</p>}
        </CardContent>
      </Card>

      {/* Guarantors */}
      <Card className="border-slate-200">
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">Guarantors ({guarantors.length})</CardTitle>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onJumpTo(3)}>
            <Edit className="h-3 w-3 mr-1" />Edit
          </Button>
        </CardHeader>
        <CardContent className="px-4 pb-4 text-sm space-y-2">
          {guarantors.map((g, idx) => (
            <div key={g.id ?? idx} className="flex items-start gap-2">
              <span className="text-slate-400 text-xs mt-0.5 w-4">{idx + 1}.</span>
              <div>
                <p className="font-medium">{g.fullName}</p>
                <p className="text-slate-500 text-xs">{g.email}{g.relationshipToCompany ? ` · ${g.relationshipToCompany}` : ''}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Terms */}
      <Card className="border-slate-200">
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">Guarantee Terms</CardTitle>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onJumpTo(4)}>
            <Edit className="h-3 w-3 mr-1" />Edit
          </Button>
        </CardHeader>
        <CardContent className="px-4 pb-4 text-sm space-y-1">
          <p><span className="text-slate-500">Type:</span> {formatGuaranteeType(terms.guaranteeType)}</p>
          {terms.limitedAmount && <p><span className="text-slate-500">Max Amount:</span> {formatCurrency(terms.limitedAmount)}</p>}
          <p><span className="text-slate-500">Governing Law:</span> {formatGoverningLaw(terms.governingLaw)}</p>
          <div className="flex gap-2 flex-wrap mt-2">
            {terms.jointAndSeveral && <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">Joint & Several</span>}
            {terms.includesInterest && <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">Includes Interest</span>}
            {terms.includesCosts && <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">Includes Costs</span>}
            {terms.requiresILA && <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">ILA Required</span>}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>← Back</Button>
        <Button onClick={onSubmit} disabled={submitting} className="min-w-32">
          {submitting ? 'Creating...' : 'Create Deed'}
        </Button>
      </div>
    </div>
  )
}
