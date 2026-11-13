import { beforeEach, afterEach, it, expect, vi } from 'vitest'
import { placeOrder } from '../orders'
import { fetchPublicInvoice } from '../documents'
const target = { token: 'test', revision: 1, branchId: 11, companyId: 11, generation: 0 }
const order = {
  id: 40,
  company_id: 11,
  order_number: 'ORD40',
  status: 'New Order',
  total_amount: '300',
}
const input = {
  delivery_type: 'Delivery' as const,
  payment_type: 'credit' as const,
  delivery_date: '2030-01-03',
  delivery_slot: '06:00-14:00',
  delivery_address_id: 1,
  delivery_notes: '',
  products: [
    {
      product_unit_variant_id: 100,
      order_quantity: 3,
      processing_type_id: null,
      specifications: null,
    },
  ],
}
beforeEach(() => vi.stubEnv('VITE_API_URL', 'https://api.example.test/api'))
afterEach(() => vi.unstubAllGlobals())
it('normalizes single and split order responses while sending selected branch context', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ order }), { status: 201 }))
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ orders: [order, { ...order, id: 41 }] }), { status: 201 }),
    )
  vi.stubGlobal('fetch', fetch)
  expect(await placeOrder(target, input)).toHaveLength(1)
  expect(await placeOrder(target, input)).toHaveLength(2)
  expect(JSON.parse(fetch.mock.calls[0]![1].body).branch_company_id).toBe(11)
  expect(fetch).toHaveBeenCalledTimes(2)
})
it('rejects an order response for the wrong company', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ order: { ...order, company_id: 99 } }))),
  )
  await expect(placeOrder(target, input)).rejects.toThrow('Unexpected company')
})
it('fetches signed invoices without attaching a bearer token or inventing a signature', async () => {
  const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(order)))
  vi.stubGlobal('fetch', fetch)
  await fetchPublicInvoice(40, 'a'.repeat(64), new AbortController().signal)
  expect(fetch.mock.calls[0]![1].headers.get('Authorization')).toBeNull()
  await expect(fetchPublicInvoice(40, 'bad', new AbortController().signal)).rejects.toThrow(
    'incomplete',
  )
  expect(fetch).toHaveBeenCalledTimes(1)
})
