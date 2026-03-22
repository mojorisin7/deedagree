import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { propertyStepSchema, type PropertyStepInput } from '@/lib/validations/deed'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import type { PropertyStepData } from '@/types'

const UK_LENDERS = [
  'Halifax', 'Nationwide', 'Barclays', 'HSBC', 'NatWest', 'Lloyds Bank',
  'Santander UK', 'Coventry Building Society', 'Yorkshire Building Society',
  'Virgin Money', 'TSB Bank', 'Metro Bank', 'The Mortgage Works',
  'BM Solutions', 'Platform (Co-operative Bank)', 'Other',
]

interface Step2Props {
  initialData: PropertyStepData | null
  onNext: (data: PropertyStepData) => void
  onBack: () => void
}

export function Step2Property({ initialData, onNext, onBack }: Step2Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<PropertyStepInput>({
    resolver: zodResolver(propertyStepSchema),
    defaultValues: initialData
      ? { ...initialData, mortgageAmount: initialData.mortgageAmount / 100 }
      : undefined,
  })

  const onSubmit = (data: PropertyStepInput) => {
    onNext({ ...data, mortgageAmount: Math.round(data.mortgageAmount * 100) })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="propertyAddress">Property Address <span className="text-red-500">*</span></Label>
        <Textarea id="propertyAddress" placeholder="15 Oak Lane&#10;Manchester&#10;M1 2AB" rows={3} {...register('propertyAddress')} />
        {errors.propertyAddress && <p className="text-xs text-red-500">{errors.propertyAddress.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="titleNumber">Land Registry Title Number</Label>
        <Input id="titleNumber" placeholder="GM123456" {...register('titleNumber')} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mortgageAmount">Mortgage Amount (£) <span className="text-red-500">*</span></Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">£</span>
            <Input
              id="mortgageAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="250000.00"
              className="pl-7"
              {...register('mortgageAmount', { valueAsNumber: true })}
            />
          </div>
          {errors.mortgageAmount && <p className="text-xs text-red-500">{errors.mortgageAmount.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lender">Lender <span className="text-red-500">*</span></Label>
          <Input id="lender" list="lenders-list" placeholder="Halifax" {...register('lender')} />
          <datalist id="lenders-list">
            {UK_LENDERS.map((l) => <option key={l} value={l} />)}
          </datalist>
          {errors.lender && <p className="text-xs text-red-500">{errors.lender.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lenderAddress">Lender Address</Label>
        <Textarea id="lenderAddress" placeholder="Lender head office address" rows={2} {...register('lenderAddress')} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mortgageRef">Mortgage Account Reference</Label>
          <Input id="mortgageRef" placeholder="MOT-12345" {...register('mortgageRef')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mortgageStartDate">Mortgage Start Date</Label>
          <Input id="mortgageStartDate" type="date" {...register('mortgageStartDate')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mortgageTermYears">Term (Years)</Label>
          <Input id="mortgageTermYears" type="number" min="1" max="40" placeholder="25" {...register('mortgageTermYears', { valueAsNumber: true })} />
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>← Back</Button>
        <Button type="submit">Next: Guarantors →</Button>
      </div>
    </form>
  )
}
