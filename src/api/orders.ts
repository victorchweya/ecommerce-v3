import { z } from 'zod'
import { request } from '@/lib/api'
import { orderSchema, pageSchema, type OrderInput, type OrderFilters } from '@/types/orders'
import { scopedPath, scopedBody, type CommerceTarget } from '@/queries/context'
export async function fetchOrders(
  target: CommerceTarget,
  filters: OrderFilters,
  signal: AbortSignal,
) {
  const result = pageSchema(orderSchema).parse(
    await request(scopedPath('ecommerce/orders', target, { ...filters, per_page: 15 }), {
      token: target.token,
      signal,
    }),
  )
  if (result.data.some((order) => order.company_id !== target.companyId))
    throw new Error('Unexpected company in order results.')
  return result
}
export async function fetchOrder(target: CommerceTarget, id: number, signal: AbortSignal) {
  const order = orderSchema.parse(
    await request(scopedPath(`ecommerce/orders/${id}`, target), { token: target.token, signal }),
  )
  if (order.id !== id || order.company_id !== target.companyId)
    throw new Error('Unexpected order in response.')
  return order
}
export async function placeOrder(target: CommerceTarget, input: OrderInput) {
  const result = await request('ecommerce/orders', {
    token: target.token,
    method: 'POST',
    body: scopedBody(input, target),
    signal: AbortSignal.timeout(30_000),
  })
  const response = z
    .union([z.object({ orders: z.array(orderSchema).min(1) }), z.object({ order: orderSchema })])
    .parse(result)
  const orders = 'orders' in response ? response.orders : [response.order]
  if (orders.some((order) => order.company_id !== target.companyId))
    throw new Error('Unexpected company in order response.')
  return orders
}
export async function editOrder(target: CommerceTarget, id: number, input: OrderInput) {
  const response = z.object({ order: orderSchema }).parse(
    await request(`ecommerce/orders/${id}`, {
      token: target.token,
      method: 'PUT',
      body: scopedBody(input, target),
      signal: AbortSignal.timeout(30_000),
    }),
  )
  if (response.order.id !== id || response.order.company_id !== target.companyId)
    throw new Error('Unexpected order in response.')
  return response.order
}
export async function cancelOrder(target: CommerceTarget, id: number, reason: string) {
  return request(`ecommerce/orders/${id}/cancel`, {
    token: target.token,
    method: 'POST',
    body: scopedBody({ reason }, target),
    signal: AbortSignal.timeout(20_000),
  })
}
export async function leaveFeedback(
  target: CommerceTarget,
  id: number,
  input: { type: string; content: string },
) {
  return request(`ecommerce/feedback/${id}`, {
    token: target.token,
    method: 'POST',
    body: input,
    signal: AbortSignal.timeout(20_000),
  })
}
