import { z } from 'zod'
export const checkoutDetailsSchema = z.object({
  delivery_type: z.enum(['Delivery', 'Pickup', 'Pickup_Location']),
  delivery_address_id: z.number().int().positive(),
  delivery_date: z.string().min(1),
  delivery_slot: z.string().min(1),
  partner_products_delivery_date: z.string(),
  delivery_notes: z.string().max(2000),
  payment_type: z.enum(['credit', 'cash_on_delivery', 'mpesa']),
  mpesa_number: z.string(),
  recurring_dates: z.array(z.string().min(1)),
})
