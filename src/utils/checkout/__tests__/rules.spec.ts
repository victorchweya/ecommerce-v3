import { describe, it, expect } from 'vitest'
import {
  checkoutIssue,
  deliveryIssue,
  deliverySlots,
  checkoutConfiguration,
  orderProducts,
  canEditOrder,
  invoiceAvailable,
  dateValue,
} from '../rules'
import { companySchema } from '@/types/organization'
import { orderSchema } from '@/types/orders'
import type { CheckoutDetails } from '@/types/checkout'
const company = companySchema.parse({
  id: 10,
  name: 'Company',
  allowed_payment_options: 'credit,mpesa,cash_on_delivery',
})
const now = Date.parse('2026-10-15T08:00:00+03:00')
const address = { id: 1, company_id: 10, name: 'Office', address_type: 'office' }
const details: CheckoutDetails = {
  delivery_type: 'Delivery',
  delivery_address_id: 1,
  delivery_date: '2026-10-16',
  delivery_slot: '06:00-08:00',
  payment_type: 'credit',
  delivery_notes: '',
  partner_products_delivery_date: '',
  mpesa_number: '',
  recurring_dates: [],
}
describe('current checkout rules', () => {
  it('enables only payment methods explicitly returned for the company', () => {
    expect(checkoutConfiguration(company).payments).toEqual(['credit', 'mpesa', 'cash_on_delivery'])
    expect(checkoutConfiguration({ id: 10, name: 'Empty' }).payments).toEqual([])
  })
  it('uses Nairobi dates and rejects impossible dates and default Sundays', () => {
    expect(Number.isNaN(dateValue('2026-02-30'))).toBe(true)
    expect(deliveryIssue('2026-10-15', company, now)).toBeTruthy()
    expect(deliveryIssue('2026-10-18', company, now)).toBeTruthy()
    expect(deliveryIssue('2026-10-16', company, now)).toBe('')
  })
  it('enforces the default 22:00 cutoff independently of the browser timezone', () => {
    expect(deliveryIssue('2026-10-16', company, Date.parse('2026-10-15T19:01:00Z'))).toContain(
      'cut-off',
    )
    expect(
      deliverySlots('2026-10-16', 'Delivery', company, false, Date.parse('2026-10-15T17:31:00Z')),
    ).toEqual(['10:00-12:00'])
  })
  it('uses returned group days and advance cutoff settings', () => {
    const grouped = {
      ...company,
      customer_group: {
        options: { delivery_days: ['Friday'], delivery_cut_off_days: '2', cut_off_time: '12:00' },
      },
    }
    expect(deliveryIssue('2026-10-16', grouped, now)).toContain('cut-off')
    expect(deliveryIssue('2026-10-17', grouped, now)).toContain('available delivery day')
  })
  it('requires a returned pickup address and does not invent one', () => {
    expect(
      checkoutIssue({ ...details, delivery_type: 'Pickup' }, [address], company, [], now),
    ).toContain('available address')
    expect(
      checkoutIssue(
        { ...details, delivery_type: 'Pickup', delivery_slot: '06:00-14:00' },
        [{ ...address, address_type: 'pickup', company_id: 99 }],
        company,
        [],
        now,
      ),
    ).toBe('')
  })
  it('rejects foreign addresses, unconfigured payment methods, duplicate dates and invalid M-Pesa phone numbers', () => {
    expect(checkoutIssue(details, [{ ...address, company_id: 99 }], company, [], now)).toBeTruthy()
    expect(
      checkoutIssue(
        { ...details, recurring_dates: [details.delivery_date] },
        [address],
        company,
        [],
        now,
      ),
    ).toContain('different')
    expect(
      checkoutIssue(
        { ...details, payment_type: 'mpesa', mpesa_number: '123' },
        [address],
        company,
        [],
        now,
      ),
    ).toContain('phone number')
    expect(
      checkoutIssue(details, [address], { ...company, allowed_payment_options: 'mpesa' }, [], now),
    ).toContain('payment method')
  })
  it('does not allow recurring M-Pesa estimates to start a single payment', () => {
    expect(
      checkoutIssue(
        {
          ...details,
          payment_type: 'mpesa',
          mpesa_number: '0712345678',
          recurring_dates: ['2026-10-17'],
        },
        [address],
        company,
        [],
        now,
      ),
    ).toContain('recurring')
  })
  it('sends selections and specifications without client prices or personal data', () => {
    expect(
      orderProducts([
        {
          productId: 1,
          productUnitVariantId: 100,
          quantity: 2.5,
          processingTypeId: 9,
          ripeness: 'ripe',
          size: null,
          washed: 'washed',
        },
      ]),
    ).toEqual([
      {
        product_unit_variant_id: 100,
        order_quantity: 2.5,
        processing_type_id: 9,
        specifications: 'ripe,washed',
      },
    ])
  })
  it('limits order editing to supported states, payment type and cutoff', () => {
    const order = orderSchema.parse({
      id: 1,
      company_id: 10,
      order_number: 'ORD1',
      status: 'New Order',
      payment_type: 'credit',
      delivery_date: '2026-10-16',
      total_amount: '100',
    })
    expect(canEditOrder(order, now)).toBe(true)
    expect(canEditOrder({ ...order, payment_type: 'mpesa' }, now)).toBe(false)
    expect(canEditOrder(order, Date.parse('2026-10-15T19:00:00+03:00'))).toBe(false)
    expect(invoiceAvailable(order)).toBe(false)
  })
})
