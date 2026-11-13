import { z } from 'zod'
import { decimalSchema } from './catalog'
import { orderLineSchema, pageSchema } from './orders'
const id = z.number().int().positive()
const named = z.object({ id, name: z.string() })
export const creditNoteSchema = z.object({
  id,
  company_id: id,
  reference: z.string(),
  date: z.string().nullish(),
  status: z.string(),
  amount: decimalSchema,
  total_tax: decimalSchema.nullish(),
  description: z.string().nullish(),
  company: z.object({ name: z.string() }).nullish(),
  order: z.object({ id, order_number: z.string() }).nullish(),
  items: z
    .array(
      z.object({
        id,
        quantity: decimalSchema,
        price: decimalSchema,
        amount: decimalSchema,
        line_item: orderLineSchema.partial().nullish(),
      }),
    )
    .optional()
    .default([]),
})
export const creditNotesPageSchema = pageSchema(creditNoteSchema)
export const staffSchema = z.object({
  id,
  name: z.string(),
  email: z.string(),
  status: z.string().nullish(),
  customer: z.object({ designation: z.string().nullish() }).nullish(),
})
export const invitationSchema = z.object({
  id,
  email: z.string(),
  expires_at: z.string().nullish(),
  invited_by: z.object({ name: z.string() }).nullish(),
})
export const orderInsightsSchema = z.object({
  top_products: z.array(
    z.object({
      product: named,
      grade: named,
      total_quantity: decimalSchema,
      average_selling_price: decimalSchema,
      total_sales: decimalSchema,
    }),
  ),
  savings: z.object({ savings: decimalSchema }),
})
export const priceTrendsSchema = z.array(
  z.object({
    product: z.string(),
    data: z.array(z.object({ date: z.string(), price: decimalSchema })),
  }),
)
export type CreditNote = z.infer<typeof creditNoteSchema>
export type PriceTrend = z.infer<typeof priceTrendsSchema>[number]
