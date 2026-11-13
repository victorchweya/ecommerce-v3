import { defineStore } from 'pinia'
import { shallowRef } from 'vue'
import { z } from 'zod'
import type { CommerceTarget } from '@/queries/context'
import type { Order, OrderInput } from '@/types/orders'
const referenceSchema = z.object({
  ownerId: z.number().int().positive(),
  companyId: z.number().int().positive(),
  branchId: z.number().int().positive().nullable(),
  collectionId: z.number().int().positive().nullable(),
  amount: z.number().finite().nonnegative(),
  stage: z.enum(['initiating', 'pending', 'paid', 'placing', 'unknown', 'failed']),
})
export type CheckoutReference = z.infer<typeof referenceSchema>
export interface CheckoutSubmission {
  target: CommerceTarget
  input: OrderInput
  cartRevision: number
  ownerId: number
  review: string[]
}
export const useCheckoutStore = defineStore('checkout', () => {
  const ownerId = shallowRef<number | null>(null)
  const reference = shallowRef<CheckoutReference | null>(null)
  const submission = shallowRef<CheckoutSubmission | null>(null)
  const orders = shallowRef<Order[]>([])
  const busy = shallowRef(false)
  const error = shallowRef('')
  const notice = shallowRef('')
  const storageKey = (id: number) => `ftf:v3:checkout:${id}`
  function bind(id: number | null) {
    if (id === ownerId.value) return
    ownerId.value = id
    reference.value = null
    submission.value = null
    orders.value = []
    error.value = ''
    notice.value = ''
    busy.value = false
    if (id)
      try {
        const saved = sessionStorage.getItem(storageKey(id))
        if (saved) {
          reference.value = referenceSchema.parse(JSON.parse(saved))
          if (reference.value.ownerId !== id) throw new Error('Unexpected owner')
        }
      } catch {
        error.value =
          'The previous checkout reference could not be read. Check your orders and contact support before starting another checkout.'
        reference.value = {
          ownerId: id,
          companyId: 0,
          branchId: null,
          collectionId: null,
          amount: 0,
          stage: 'unknown',
        }
      }
  }
  function record(value: CheckoutReference) {
    // Store a reference before a write; never store the phone, address, token or order payload.
    sessionStorage.setItem(storageKey(value.ownerId), JSON.stringify(value))
    reference.value = value
  }
  function forget() {
    if (ownerId.value) sessionStorage.removeItem(storageKey(ownerId.value))
    reference.value = null
    submission.value = null
    error.value = ''
  }
  return { ownerId, reference, submission, orders, busy, error, notice, bind, record, forget }
})
