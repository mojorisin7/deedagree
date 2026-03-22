import { z } from 'zod'

export const companyStepSchema = z.object({
  companyName: z.string().min(2, 'Company name required'),
  companyRegNumber: z
    .string()
    .regex(/^[A-Z0-9]{7,8}$/i, 'Enter a valid Companies House registration number (7-8 alphanumeric characters)'),
  companyAddress: z.string().min(5, 'Company address required'),
  companyIncDate: z.string().optional(),
  directorName: z.string().optional(),
  directorEmail: z.string().email('Invalid email').optional().or(z.literal('')),
})

export const propertyStepSchema = z.object({
  propertyAddress: z.string().min(5, 'Property address required'),
  titleNumber: z.string().optional(),
  mortgageAmount: z.number().positive('Mortgage amount must be positive'),
  lender: z.string().min(2, 'Lender name required'),
  lenderAddress: z.string().optional(),
  mortgageRef: z.string().optional(),
  mortgageStartDate: z.string().optional(),
  mortgageTermYears: z.number().int().positive().optional(),
})

export const guarantorSchema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  email: z.string().email('Valid email required'),
  dateOfBirth: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true
      const dob = new Date(val)
      const today = new Date()
      const age = today.getFullYear() - dob.getFullYear()
      return age >= 18
    }, 'Guarantor must be at least 18 years old'),
  address: z.string().min(5, 'Address required'),
  phone: z.string().optional(),
  relationshipToCompany: z.string().optional(),
  maxIndividualLiability: z.number().positive().optional(),
})

export const termsStepSchema = z
  .object({
    guaranteeType: z.enum(['ALL_MONIES', 'LIMITED', 'SPECIFIC']),
    limitedAmount: z.number().positive().optional(),
    governingLaw: z.enum(['ENGLAND_WALES', 'SCOTLAND', 'NORTHERN_IRELAND']),
    executionDate: z.string().optional(),
    specialConditions: z.string().optional(),
    jointAndSeveral: z.boolean(),
    includesInterest: z.boolean(),
    includesCosts: z.boolean(),
    requiresILA: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.guaranteeType === 'LIMITED') {
        return data.limitedAmount !== undefined && data.limitedAmount > 0
      }
      return true
    },
    {
      message: 'Maximum guarantee amount is required for Limited guarantees',
      path: ['limitedAmount'],
    }
  )

export const createDeedSchema = z.object({
  company: companyStepSchema,
  property: propertyStepSchema,
  guarantors: z.array(guarantorSchema).min(1, 'At least one guarantor is required'),
  terms: termsStepSchema,
})

export type CompanyStepInput = z.infer<typeof companyStepSchema>
export type PropertyStepInput = z.infer<typeof propertyStepSchema>
export type GuarantorInput = z.infer<typeof guarantorSchema>
export type TermsStepInput = z.infer<typeof termsStepSchema>
export type CreateDeedInput = z.infer<typeof createDeedSchema>
