import { request } from '@/lib/api'
import { orderSchema } from '@/types/orders'
import { creditNoteSchema } from '@/types/account'
function signedPath(path: string, signature: string) {
  if (!/^[a-f0-9]{64}$/i.test(signature))
    throw new Error('This document link is incomplete or invalid.')
  return `${path}?${new URLSearchParams({ signature })}`
}
export async function fetchPublicInvoice(id: number, signature: string, signal: AbortSignal) {
  const order = orderSchema.parse(
    await request(signedPath(`ecommerce/orders/invoice/${id}`, signature), { signal }),
  )
  if (order.id !== id) throw new Error('Unexpected invoice in response.')
  return order
}
export async function fetchPublicCreditNote(id: number, signature: string, signal: AbortSignal) {
  const note = creditNoteSchema.parse(
    await request(signedPath(`ecommerce/credit-notes/${id}`, signature), { signal }),
  )
  if (note.id !== id) throw new Error('Unexpected credit note in response.')
  return note
}
