import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { companyStepSchema, type CompanyStepInput } from '@/lib/validations/deed'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import type { CompanyStepData } from '@/types'

interface Step1Props {
  initialData: CompanyStepData | null
  onNext: (data: CompanyStepData) => void
}

export function Step1Company({ initialData, onNext }: Step1Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<CompanyStepInput>({
    resolver: zodResolver(companyStepSchema),
    defaultValues: initialData ?? undefined,
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name <span className="text-red-500">*</span></Label>
          <Input id="companyName" placeholder="ABC Properties Ltd" {...register('companyName')} />
          {errors.companyName && <p className="text-xs text-red-500">{errors.companyName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyRegNumber">Companies House Number <span className="text-red-500">*</span></Label>
          <Input id="companyRegNumber" placeholder="12345678" {...register('companyRegNumber')} />
          {errors.companyRegNumber && <p className="text-xs text-red-500">{errors.companyRegNumber.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyAddress">Registered Address <span className="text-red-500">*</span></Label>
        <Textarea id="companyAddress" placeholder="123 High Street&#10;London&#10;EC1A 1BB" rows={3} {...register('companyAddress')} />
        {errors.companyAddress && <p className="text-xs text-red-500">{errors.companyAddress.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyIncDate">Date of Incorporation</Label>
        <Input id="companyIncDate" type="date" {...register('companyIncDate')} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="directorName">Director / Authorised Signatory</Label>
          <Input id="directorName" placeholder="John Smith" {...register('directorName')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="directorEmail">Director Email</Label>
          <Input id="directorEmail" type="email" placeholder="director@company.com" {...register('directorEmail')} />
          {errors.directorEmail && <p className="text-xs text-red-500">{errors.directorEmail.message}</p>}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit">Next: Property →</Button>
      </div>
    </form>
  )
}
