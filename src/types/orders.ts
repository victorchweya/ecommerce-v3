import { z } from 'zod'
import { decimalSchema } from './catalog'
const id = z.number().int().positive()
const named = z.looseObject({ id, name: z.string() })
export const orderLineSchema = z.looseObject({
  id,
  product_unit_variant_id: id,
  order_quantity: decimalSchema,
  quantity_dispatched: decimalSchema.nullish(),
  quantity_received: decimalSchema.nullish(),
  selling_price: decimalSchema,
  processing_type_id: id.nullish(),
  processing_type: z.string().nullish(),
  specifications: z.string().nullish(),
  unit_variant: z
    .looseObject({
      id,
      unit: named.nullish(),
      grade_variant: z
        .looseObject({
          id: id.optional(),
          grade: named.nullish(),
          product: named.nullish(),
        })
        .nullish(),
    })
    .nullish(),
})
export const orderSchema = z.looseObject({
  id,
  company_id: id,
  order_number: z.string(),
  status: z.string(),
  order_type: z.string().nullish(),
  delivery_type: z.string().nullish(),
  delivery_date: z.string().nullish(),
  delivery_slot: z.string().nullish(),
  delivery_address_id: id.nullish(),
  payment_type: z.string().nullish(),
  payment_status: z.string().nullish(),
  order_date: z.string().nullish(),
  shipping_cost: decimalSchema.nullish(),
  total_tax: decimalSchema.nullish(),
  sub_total: decimalSchema.nullish(),
  total_amount: decimalSchema,
  discount_amount: decimalSchema.nullish(),
  delivery_notes: z.string().nullish(),
  invoice_due_date: z.string().nullish(),
  invoice_issue_date: z.string().nullish(),
  invoice_url: z.string().nullish(),
  scu_id: z.union([z.string(), z.number()]).nullish(),
  receipt_number: z.union([z.string(), z.number()]).nullish(),
  receipt_signature: z.string().nullish(),
  dispatched_at: z.string().nullish(),
  company: z
    .looseObject({
      id,
      name: z.string(),
      kra_pin: z.string().nullish(),
      billing_details: z
        .object({
          business_name: z.string().nullish(),
          address: z.string().nullish(),
          city: z.string().nullish(),
          postal_code: z.string().nullish(),
          kra_pin: z.string().nullish(),
        })
        .nullish(),
    })
    .nullish(),
  address: z
    .looseObject({ name: z.string(), address: z.string().nullish(), city: z.string().nullish() })
    .nullish(),
  order_line_items: z.array(orderLineSchema).optional().default([]),
  feedback: z.looseObject({ id, type: z.string(), customer_feedback: z.string() }).nullish(),
})
export function pageSchema<T extends z.ZodType>(item: T) {
  return z.object({
    data: z.array(item),
    current_page: z.number().int().positive(),
    last_page: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  })
}
export type Order = z.infer<typeof orderSchema>
export type OrderLine = z.infer<typeof orderLineSchema>
export interface OrderProductInput {
  product_unit_variant_id: number
  order_quantity: number
  processing_type_id: number | null
  specifications: string | null
}
export interface OrderInput {
  delivery_type: 'Delivery' | 'Pickup' | 'Pickup_Location'
  payment_type: 'credit' | 'cash_on_delivery' | 'mpesa' | 'online'
  delivery_date: string
  delivery_slot: string
  delivery_address_id: number
  delivery_notes: string
  products: OrderProductInput[]
  partner_products_delivery_date?: string
  coupon_code?: string
  is_recurring?: boolean
  recurring_dates?: string[]
  payment_collection_id?: number
}
export interface OrderFilters {
  page: number
  status?: string
  date_from?: string
  date_to?: string
  payment_status?: string
}
