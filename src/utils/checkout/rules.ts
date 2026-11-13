import { z } from 'zod'
import type { Company } from '@/types/organization'
import type { ProductSelection, Product } from '@/types/catalog'
import type { Address } from '@/types/addresses'
import type { CheckoutDetails } from '@/types/checkout'
import type { Order, OrderProductInput } from '@/types/orders'
import { decimalSchema } from '@/types/catalog'
const optionsSchema = z.object({
  allowed_payment_options: z.string().nullish(),
  customer_group: z
    .object({
      options: z
        .object({
          delivery_days: z.array(z.string()).nullish(),
          delivery_cut_off_days: decimalSchema.nullish(),
          cut_off_time: z.string().nullish(),
          consolidate_invoice: z.boolean().nullish(),
        })
        .nullish(),
    })
    .nullish(),
})
export function checkoutConfiguration(company: Company) {
  const value = optionsSchema.parse(company)
  return {
    payments: (value.allowed_payment_options ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter((item) => ['credit', 'cash_on_delivery', 'mpesa'].includes(item)),
    options: value.customer_group?.options ?? null,
  }
}
export function nairobiDate(now = Date.now()) {
  return new Date(now + 3 * 3600000).toISOString().slice(0, 10)
}
export function dateValue(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN
  const time = Date.parse(`${value}T00:00:00Z`)
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? time : NaN
}
export function deliveryIssue(date: string, company: Company, now = Date.now()) {
  const value = dateValue(date)
  const today = dateValue(nairobiDate(now))
  if (!Number.isFinite(value) || value <= today) return 'Choose a future delivery date.'
  const { options } = checkoutConfiguration(company)
  const day = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' }).format(
    new Date(value),
  )
  const days = options?.delivery_days ?? []
  if ((days.length && !days.includes(day)) || (!days.length && day === 'Sunday'))
    return 'Choose an available delivery day.'
  const cutoffDays = options?.delivery_cut_off_days ?? (options ? 0 : 1)
  const cutoffTime = options?.cut_off_time ?? (options ? null : '22:00')
  if (cutoffDays > 0 && cutoffTime && /^\d{2}:\d{2}(?::\d{2})?$/.test(cutoffTime)) {
    const cutoffDate = new Date(value - cutoffDays * 86400000).toISOString().slice(0, 10)
    if (now >= Date.parse(`${cutoffDate}T${cutoffTime.slice(0, 5)}:00+03:00`))
      return 'The order cut-off for this date has passed.'
  }
  return ''
}
export function deliverySlots(
  date: string,
  type: string,
  company: Company,
  onlyPartner: boolean,
  now = Date.now(),
) {
  if (type !== 'Delivery') return ['06:00-14:00']
  if (onlyPartner) return ['12:00-14:00']
  if (checkoutConfiguration(company).options) return ['06:00-14:00']
  let slots = ['06:00-08:00', '08:00-10:00', '10:00-12:00']
  if (dateValue(date) === dateValue(nairobiDate(now)) + 86400000) {
    const hour =
      new Date(now + 3 * 3600000).getUTCHours() + new Date(now + 3 * 3600000).getUTCMinutes() / 60
    if (hour >= 19) slots = slots.slice(1)
    if (hour >= 20.5) slots = slots.filter((slot) => slot === '10:00-12:00')
  }
  return slots
}
export function orderProducts(items: ProductSelection[]): OrderProductInput[] {
  return items.map((item) => ({
    product_unit_variant_id: item.productUnitVariantId,
    order_quantity: item.quantity,
    processing_type_id: item.processingTypeId,
    specifications: [item.ripeness, item.size, item.washed].filter(Boolean).join(',') || null,
  }))
}
export function checkoutIssue(
  details: CheckoutDetails,
  addresses: Address[],
  company: Company,
  products: Product[],
  now = Date.now(),
) {
  const address = addresses.find((item) => item.id === details.delivery_address_id)
  if (
    !address ||
    (details.delivery_type === 'Delivery'
      ? address.company_id !== company.id || address.address_type === 'pickup'
      : address.address_type !== 'pickup')
  )
    return 'Choose an available address for this delivery method.'
  if (!checkoutConfiguration(company).payments.includes(details.payment_type))
    return 'Choose a payment method available to this company.'
  const dates = [
    details.delivery_date,
    ...details.recurring_dates,
    ...(details.partner_products_delivery_date ? [details.partner_products_delivery_date] : []),
  ]
  for (const date of dates) {
    const issue = deliveryIssue(date, company, now)
    if (issue) return `${date || 'Delivery date'}: ${issue}`
  }
  if (
    new Set([details.delivery_date, ...details.recurring_dates]).size !==
    details.recurring_dates.length + 1
  )
    return 'Recurring delivery dates must be different.'
  const onlyPartner =
    products.length > 0 && products.every((item) => item.product_type === 'partner_product')
  if (
    ![details.delivery_date, ...details.recurring_dates].every((date) =>
      deliverySlots(date, details.delivery_type, company, onlyPartner, now).includes(
        details.delivery_slot,
      ),
    )
  )
    return 'Choose an available delivery window.'
  if (
    details.payment_type === 'mpesa' &&
    !/^(?:0[17]\d{8}|254[17]\d{8}|\+254[17]\d{8})$/.test(details.mpesa_number.trim())
  )
    return 'Enter a valid Kenyan M-Pesa phone number.'
  if (details.payment_type === 'mpesa' && details.recurring_dates.length)
    return 'Use an available credit or cash payment method for recurring orders.'
  if (details.delivery_notes.length > 2000)
    return 'Delivery notes must be at most 2,000 characters.'
  return ''
}
export function canEditOrder(order: Order, now = Date.now()) {
  if (order.status !== 'New Order' || order.payment_type === 'mpesa' || !order.delivery_date)
    return false
  const days =
    (dateValue(order.delivery_date.slice(0, 10)) - dateValue(nairobiDate(now))) / 86400000
  return days > 1 || (days === 1 && new Date(now + 3 * 3600000).getUTCHours() < 19)
}
export function invoiceAvailable(order: Order) {
  return (
    order.status !== 'Cancelled' &&
    order.order_type !== 'sample_order' &&
    Boolean(
      order.invoice_issue_date ||
      order.dispatched_at ||
      (order.delivery_type === 'Pickup' && order.status === 'Completed'),
    ) &&
    order.order_line_items.some((line) => (line.quantity_dispatched ?? 0) > 0)
  )
}
