import { z } from 'zod'

export const companySchema = z.looseObject({
  id: z.number().int().positive(),
  name: z.string(),
  status: z.string().nullish(),
  contact_person_name: z.string().nullish(),
  contact_person_email: z.string().nullish(),
  contact_person_phone: z.string().nullish(),
  contact_person_designation: z.string().nullish(),
  billing_details: z
    .object({
      business_name: z.string().nullish(),
      address: z.string().nullish(),
      postal_code: z.string().nullish(),
      city: z.string().nullish(),
    })
    .nullish(),
  kra_pin: z.string().nullish(),
  kra_certificate: z.string().nullish(),
  organisation_structure: z.string().nullish(),
  parent_organisation_status: z.string().nullish(),
})
export const branchSchema = z.object({ id: z.number().int().positive(), name: z.string() })
export type Company = z.infer<typeof companySchema>
export type Branch = z.infer<typeof branchSchema>

export interface ContactPersonInput {
  contact_person_name: string
  contact_person_email: string
  contact_person_phone: string
  contact_person_designation: string
}
export interface BillingDetailsInput {
  billing_details: { business_name: string; address: string; postal_code: string; city: string }
  kra_pin: string | null
  kra_certificate?: string
}
export type CompanyUpdate = ContactPersonInput | BillingDetailsInput
