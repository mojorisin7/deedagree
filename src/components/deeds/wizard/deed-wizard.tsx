'use client'

import { useReducer, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StepIndicator } from './step-indicator'
import { Step1Company } from './step-1-company'
import { Step2Property } from './step-2-property'
import { Step3Guarantors } from './step-3-guarantors'
import { Step4Terms } from './step-4-terms'
import { Step5Review } from './step-5-review'
import { createDeedAction } from '@/app/actions/deeds'
import type { WizardState, CompanyStepData, PropertyStepData, GuarantorFormData, TermsStepData } from '@/types'

const STORAGE_KEY = 'deed-wizard-draft'

type Action =
  | { type: 'SET_COMPANY'; data: CompanyStepData }
  | { type: 'SET_PROPERTY'; data: PropertyStepData }
  | { type: 'SET_GUARANTORS'; data: GuarantorFormData[] }
  | { type: 'SET_TERMS'; data: TermsStepData }
  | { type: 'GO_TO_STEP'; step: WizardState['step'] }
  | { type: 'RESET' }

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case 'SET_COMPANY':
      return { ...state, company: action.data, step: 2 }
    case 'SET_PROPERTY':
      return { ...state, property: action.data, step: 3 }
    case 'SET_GUARANTORS':
      return { ...state, guarantors: action.data, step: 4 }
    case 'SET_TERMS':
      return { ...state, terms: action.data, step: 5 }
    case 'GO_TO_STEP':
      return { ...state, step: action.step }
    case 'RESET':
      return { step: 1, company: null, property: null, guarantors: [], terms: null }
    default:
      return state
  }
}

const initialState: WizardState = {
  step: 1,
  company: null,
  property: null,
  guarantors: [],
  terms: null,
}

export function DeedWizard() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  // Load from sessionStorage on mount
  const [state, dispatch] = useReducer(reducer, initialState, () => {
    if (typeof window === 'undefined') return initialState
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved) as WizardState
    } catch {}
    return initialState
  })

  // Save to sessionStorage on each state change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, [state])

  const handleSubmit = async () => {
    if (!state.company || !state.property || !state.terms || state.guarantors.length === 0) {
      toast.error('Please complete all steps before submitting')
      return
    }

    setSubmitting(true)

    const result = await createDeedAction({
      company: state.company,
      property: state.property,
      guarantors: state.guarantors.map(({ id: _id, ...g }) => ({ ...g, address: g.address ?? '' })),
      terms: state.terms,
    })

    setSubmitting(false)

    if (result.success) {
      sessionStorage.removeItem(STORAGE_KEY)
      toast.success(`Deed ${result.data.id ? '' : ''}created successfully`)
      router.push(`/deeds/${result.data.id}`)
    } else {
      toast.error(result.error)
    }
  }

  const stepTitles = [
    '1. Company Details',
    '2. Property & Mortgage',
    '3. Guarantors',
    '4. Guarantee Terms',
    '5. Review & Create',
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-slate-900">New Deed of Guarantee</h2>
        <p className="text-slate-500 text-sm mt-1">Complete all steps to create a new deed</p>
      </div>

      <div className="flex justify-center">
        <StepIndicator currentStep={state.step} />
      </div>

      <Card className="border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-serif">{stepTitles[state.step - 1]}</CardTitle>
        </CardHeader>
        <CardContent>
          {state.step === 1 && (
            <Step1Company
              initialData={state.company}
              onNext={(data) => dispatch({ type: 'SET_COMPANY', data })}
            />
          )}
          {state.step === 2 && (
            <Step2Property
              initialData={state.property}
              onNext={(data) => dispatch({ type: 'SET_PROPERTY', data })}
              onBack={() => dispatch({ type: 'GO_TO_STEP', step: 1 })}
            />
          )}
          {state.step === 3 && (
            <Step3Guarantors
              initialData={state.guarantors}
              onNext={(data) => dispatch({ type: 'SET_GUARANTORS', data })}
              onBack={() => dispatch({ type: 'GO_TO_STEP', step: 2 })}
            />
          )}
          {state.step === 4 && (
            <Step4Terms
              initialData={state.terms}
              onNext={(data) => dispatch({ type: 'SET_TERMS', data })}
              onBack={() => dispatch({ type: 'GO_TO_STEP', step: 3 })}
            />
          )}
          {state.step === 5 && state.company && state.property && state.terms && (
            <Step5Review
              company={state.company}
              property={state.property}
              guarantors={state.guarantors}
              terms={state.terms}
              onBack={() => dispatch({ type: 'GO_TO_STEP', step: 4 })}
              onSubmit={handleSubmit}
              submitting={submitting}
              onJumpTo={(step) => dispatch({ type: 'GO_TO_STEP', step: step as WizardState['step'] })}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
