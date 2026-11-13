import { z } from 'zod'
import { emailSchema } from './auth'
const required = z.string().trim().min(1, 'This field is required.')
export const contactPersonSchema = z.object({
  contact_person_name: required,
  contact_person_email: emailSchema,
  contact_person_phone: required,
  contact_person_designation: z.string().trim(),
})
export const billingDetailsSchema = z.object({
  business_name: required,
  address: required,
  postal_code: required,
  city: required,
  kra_pin: z.string().trim(),
})
export const coordinatesSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
})
export const deliveryDetailsSchema = z.object({
  name: required,
  address: required,
  city: required,
  contact_person_name: required,
  contact_person_phone: required,
})
export const companyCategories = [
  'School/Feeding Program',
  'Hotel/Restaurant',
  'Caterer',
  'Food Processor',
  'Retail',
  'FTFF',
  'Farm to Feed',
  'Charity',
  'Kibanda',
  'Other',
] as const
