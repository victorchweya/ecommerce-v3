import { z } from 'zod'
import { decimalSchema } from './catalog'
export const addressSchema = z.looseObject({
  id: z.number().int().positive(),
  company_id: z.number().int().positive().nullish(),
  name: z.string(),
  address: z.string().nullish(),
  city: z.string().nullish(),
  address_type: z.string().nullish(),
  is_default: z.union([z.boolean(), z.literal(0), z.literal(1)]).nullish(),
  latitude: decimalSchema.nullish(),
  longitude: decimalSchema.nullish(),
  delivery_fee: decimalSchema.nullish(),
  contact_person_name: z.string().nullish(),
  contact_person_phone: z.string().nullish(),
})
export type Address = z.infer<typeof addressSchema>
export interface DeliveryAddressInput {
  address_type: 'home' | 'office'
  name: string
  address: string
  city: string
  contact_person_name: string
  contact_person_phone: string
  latitude: number
  longitude: number
  is_default: boolean
}
