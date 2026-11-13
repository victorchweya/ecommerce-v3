import { beforeEach, it, expect } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCheckoutStore } from '../checkout'
beforeEach(() => {
  setActivePinia(createPinia())
  sessionStorage.clear()
})
it('restores an attempt reference and isolates it from another account', () => {
  const store = useCheckoutStore()
  store.bind(1)
  store.record({
    ownerId: 1,
    companyId: 10,
    branchId: null,
    collectionId: 3,
    amount: 300,
    stage: 'pending',
  })
  store.bind(2)
  expect(store.reference).toBeNull()
  store.bind(1)
  expect(store.reference?.collectionId).toBe(3)
  expect(store.submission).toBeNull()
  store.forget()
  expect(sessionStorage.getItem('ftf:v3:checkout:1')).toBeNull()
})
it('blocks a new checkout when a previous reference is corrupt', () => {
  sessionStorage.setItem('ftf:v3:checkout:1', '{corrupt')
  const store = useCheckoutStore()
  store.bind(1)
  expect(store.reference?.stage).toBe('unknown')
  expect(store.error).toContain('could not be read')
})
