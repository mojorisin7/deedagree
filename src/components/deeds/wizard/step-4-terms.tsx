import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { termsStepSchema, type TermsStepInput } from '@/lib/validations/deed'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import type { TermsStepData } from '@/types'

interface Step4Props {
  initialData: TermsStepData | null
  onNext: (data: TermsStepData) => void
  onBack: () => void
}

export function Step4Terms({ initialData, onNext, onBack }: Step4Props) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<TermsStepInput>({
    resolver: zodResolver(termsStepSchema),
    defaultValues: initialData ?? {
      guaranteeType: 'ALL_MONIES',
      governingLaw: 'ENGLAND_WALES',
      jointAndSeveral: true,
      includesInterest: true,
      includesCosts: true,
      requiresILA: true,
    },
  })

  const guaranteeType = useWatch({ control, name: 'guaranteeType' })

  const onSubmit = (data: TermsStepInput) => {
    onNext(data as TermsStepData)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Guarantee Type */}
      <div className="space-y-3">
        <Label>Guarantee Type <span className="text-red-500">*</span></Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['ALL_MONIES', 'LIMITED', 'SPECIFIC'] as const).map((type) => (
            <label
              key={type}
              className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 has-[:checked]:border-blue-900 has-[:checked]:bg-blue-50"
            >
              <input type="radio" value={type} {...register('guaranteeType')} className="mt-0.5" />
              <div>
                <p className="text-sm font-medium">
                  {type === 'ALL_MONIES' ? 'All Monies' : type === 'LIMITED' ? 'Limited Amount' : 'Specific Obligations'}
                </p>
                <p className="text-xs text-slate-500">
                  {type === 'ALL_MONIES' ? 'Guarantees all outstanding obligations' : type === 'LIMITED' ? 'Capped at a specific amount' : 'Specific defined obligations only'}
                </p>
              </div>
            </label>
          ))}
        </div>
        {errors.guaranteeType && <p className="text-xs text-red-500">{errors.guaranteeType.message}</p>}
      </div>

      {guaranteeType === 'LIMITED' && (
        <div className="space-y-2">
          <Label htmlFor="limitedAmount">Maximum Guarantee Amount (£) <span className="text-red-500">*</span></Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">£</span>
            <Input
              id="limitedAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="250000.00"
              className="pl-7"
              {...register('limitedAmount', { valueAsNumber: true, setValueAs: (v) => v === '' || isNaN(Number(v)) ? undefined : Number(v) * 100 })}
            />
          </div>
          {errors.limitedAmount && <p className="text-xs text-red-500">{errors.limitedAmount.message}</p>}
        </div>
      )}

      {/* Governing Law */}
      <div className="space-y-2">
        <Label htmlFor="governingLaw">Governing Law <span className="text-red-500">*</span></Label>
        <select
          id="governingLaw"
          className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
          {...register('governingLaw')}
        >
          <option value="ENGLAND_WALES">England and Wales</option>
          <option value="SCOTLAND">Scotland</option>
          <option value="NORTHERN_IRELAND">Northern Ireland</option>
        </select>
      </div>

      {/* Execution Date */}
      <div className="space-y-2">
        <Label htmlFor="executionDate">Execution Date</Label>
        <Input id="executionDate" type="date" {...register('executionDate')} />
      </div>

      {/* Checkboxes */}
      <div className="space-y-3">
        <Label>Deed Provisions</Label>
        <div className="space-y-3">
          {([
            { name: 'jointAndSeveral', label: 'Joint and several liability', description: 'All guarantors are jointly and individually liable' },
            { name: 'includesInterest', label: 'Guarantee includes interest', description: 'Covers interest accrued on the mortgage' },
            { name: 'includesCosts', label: 'Guarantee includes enforcement costs', description: 'Covers legal and enforcement costs incurred by lender' },
            { name: 'requiresILA', label: 'Independent legal advice required', description: 'Guarantors must confirm they have had the opportunity to take ILA' },
          ] as const).map((item) => (
            <label key={item.name} className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-0.5" {...register(item.name)} />
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-slate-500">{item.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Special Conditions */}
      <div className="space-y-2">
        <Label htmlFor="specialConditions">Special Conditions</Label>
        <Textarea
          id="specialConditions"
          placeholder="Any special conditions or additional terms..."
          rows={3}
          {...register('specialConditions')}
        />
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>← Back</Button>
        <Button type="submit">Review →</Button>
      </div>
    </form>
  )
}
