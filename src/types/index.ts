export type { Role, DeedStatus, SignatureStatus, GuaranteeType, OrgType, GoverningLaw } from '@prisma/client'
export type { Deed, Guarantor, User, Organisation, AuditLog, Document } from '@prisma/client'
import type { Deed, Guarantor, User, Organisation, Document } from '@prisma/client'

export type DeedWithRelations = Deed & {
  guarantors: Guarantor[]
  createdBy: User
  organisation: Organisation | null
  documents: Document[]
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

export type WizardStep = 1 | 2 | 3 | 4 | 5

export type CompanyStepData = {
  companyName: string
  companyRegNumber: string
  companyAddress: string
  companyIncDate?: string
  directorName?: string
  directorEmail?: string
}

export type PropertyStepData = {
  propertyAddress: string
  titleNumber?: string
  mortgageAmount: number  // in pence
  lender: string
  lenderAddress?: string
  mortgageRef?: string
  mortgageStartDate?: string
  mortgageTermYears?: number
}

export type GuarantorFormData = {
  id?: string
  fullName: string
  dateOfBirth?: string
  email: string
  address?: string
  phone?: string
  relationshipToCompany?: string
  maxIndividualLiability?: number
}

export type TermsStepData = {
  guaranteeType: 'ALL_MONIES' | 'LIMITED' | 'SPECIFIC'
  limitedAmount?: number
  governingLaw: 'ENGLAND_WALES' | 'SCOTLAND' | 'NORTHERN_IRELAND'
  executionDate?: string
  specialConditions?: string
  jointAndSeveral: boolean
  includesInterest: boolean
  includesCosts: boolean
  requiresILA: boolean
}

export type WizardState = {
  step: WizardStep
  company: CompanyStepData | null
  property: PropertyStepData | null
  guarantors: GuarantorFormData[]
  terms: TermsStepData | null
}
