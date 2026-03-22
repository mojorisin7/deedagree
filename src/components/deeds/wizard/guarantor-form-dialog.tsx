'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { guarantorSchema, type GuarantorInput } from '@/lib/validations/deed'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { GuarantorFormData } from '@/types'

const RELATIONSHIPS = [
  'Director',
  'Shareholder',
  'Director & Shareholder',
  'Spouse of Director',
  'Family Member',
  'Business Partner',
  'Other',
]

interface GuarantorFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (data: GuarantorFormData) => void
  initialData?: GuarantorFormData
}

export function GuarantorFormDialog({ open, onClose, onSave, initialData }: GuarantorFormDialogProps) {
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm<GuarantorInput>({
    resolver: zodResolver(guarantorSchema),
    defaultValues: initialData ?? undefined,
  })

  const onSubmit = (data: GuarantorInput) => {
    onSave({ ...data, id: initialData?.id })
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">{initialData ? 'Edit Guarantor' : 'Add Guarantor'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label>Full Legal Name <span className="text-red-500">*</span></Label>
              <Input placeholder="John Alexander Smith" {...register('fullName')} />
              {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Email <span className="text-red-500">*</span></Label>
              <Input type="email" placeholder="john@example.com" {...register('email')} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input type="tel" placeholder="+44 7700 900000" {...register('phone')} />
            </div>
            <div className="space-y-1">
              <Label>Date of Birth</Label>
              <Input type="date" {...register('dateOfBirth')} />
              {errors.dateOfBirth && <p className="text-xs text-red-500">{errors.dateOfBirth.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Relationship to Company</Label>
              <select
                className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
                {...register('relationshipToCompany')}
              >
                <option value="">Select...</option>
                {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Home Address <span className="text-red-500">*</span></Label>
            <Textarea placeholder="42 Elm Street&#10;London&#10;N1 2BC" rows={3} {...register('address')} />
            {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Maximum Individual Liability (£)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">£</span>
              <Input type="number" step="0.01" min="0" placeholder="Leave blank for unlimited" className="pl-7" {...register('maxIndividualLiability', { valueAsNumber: true, setValueAs: (v) => v === '' || isNaN(v) ? undefined : v * 100 })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{initialData ? 'Save Changes' : 'Add Guarantor'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
