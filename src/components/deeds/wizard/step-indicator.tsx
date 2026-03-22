import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const steps = [
  { number: 1, label: 'Company' },
  { number: 2, label: 'Property' },
  { number: 3, label: 'Guarantors' },
  { number: 4, label: 'Terms' },
  { number: 5, label: 'Review' },
]

interface StepIndicatorProps {
  currentStep: number
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center">
      {steps.map((step, idx) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                step.number < currentStep
                  ? 'bg-green-600 text-white'
                  : step.number === currentStep
                  ? 'bg-blue-900 text-white'
                  : 'bg-slate-200 text-slate-500'
              )}
            >
              {step.number < currentStep ? <Check className="h-4 w-4" /> : step.number}
            </div>
            <span
              className={cn(
                'mt-1 text-xs font-medium hidden sm:block',
                step.number === currentStep ? 'text-blue-900' : 'text-slate-500'
              )}
            >
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={cn(
                'h-0.5 w-12 sm:w-20 mx-2 transition-colors',
                step.number < currentStep ? 'bg-green-600' : 'bg-slate-200'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
