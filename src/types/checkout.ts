import { z } from 'zod'
import { decimalSchema } from './catalog'
export const voucherSchema = z.object({
  code: z.string().min(1),
  discount_type: z.enum(['Percentage', 'Flat']),
  discount_value: decimalSchema.pipe(z.number().nonnegative()),
  expiry_date: z.string().nullish(),
  status: z.string(),
})
export type Voucher = z.infer<typeof voucherSchema>

export const collectionSchema = z.object({
  id: z.number().int().positive(),
  company_id: z.number().int().positive(),
  amount: decimalSchema,
  status: z.string(),
})
export type PaymentCollection = z.infer<typeof collectionSchema>
export interface CheckoutDetails {
  delivery_type: 'Delivery' | 'Pickup' | 'Pickup_Location'
  delivery_address_id: number | null
  delivery_date: string
  delivery_slot: string
  partner_products_delivery_date: string
  delivery_notes: string
  payment_type: 'credit' | 'cash_on_delivery' | 'mpesa'
  mpesa_number: string
  recurring_dates: string[]
}
