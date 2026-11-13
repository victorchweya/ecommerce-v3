import { beforeEach, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCartStore } from '../cart'
import { productSchema, type ProductSelection } from '@/types/catalog'
import { catalogProduct } from '@/types/__tests__/catalog.fixture'
import { lineIdentity } from '@/utils/cart/line-identity'
import { cartStorageKey } from '@/utils/cart/persistence'
const product = () => productSchema.parse(catalogProduct())
const selection = (overrides: Partial<ProductSelection> = {}): ProductSelection => ({
  productId: 1,
  productUnitVariantId: 100,
  processingTypeId: null,
  quantity: 1,
  ripeness: null,
  size: null,
  washed: null,
  ...overrides,
})
beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})
function cart() {
  const store = useCartStore()
  store.setOwner(1)
  return store
}
it('merges normalized identity without storing prices, portions, fetched records or credentials', () => {
  const store = cart()
  expect(store.apply(selection({ ripeness: ' Ripe ' }), product())).toBe(true)
  expect(store.apply(selection({ ripeness: 'ripe', quantity: 0.5 }), product())).toBe(true)
  expect(store.items).toEqual([selection({ ripeness: 'ripe', quantity: 1.5 })])
  expect(JSON.parse(localStorage.getItem(cartStorageKey(1))!)).toEqual({
    version: 1,
    items: store.items,
  })
  expect(store.apply(selection({ ripeness: 'ripe', processingTypeId: 9 }), product())).toBe(true)
  expect(store.count).toBe(2)
})
it('validates selections and leaves previous cart unchanged on invalid relationships, specifications and quantities', () => {
  const store = cart()
  store.apply(selection(), product())
  for (const invalid of [
    selection({ productUnitVariantId: 999 }),
    selection({ processingTypeId: 999 }),
    selection({ size: 'invented' }),
    selection({ quantity: 0.1 }),
    selection({ quantity: NaN }),
    selection({ quantity: 0.251 }),
  ])
    expect(store.apply(invalid, product())).toBe(false)
  expect(store.items).toEqual([selection()])
  expect(store.apply(selection(), { ...product(), published: false })).toBe(false)
  expect(store.count).toBe(1)
})
it('splits atomically and merges edited identity while conserving quantity', () => {
  const store = cart()
  store.apply(selection({ quantity: 3 }), product())
  const options = () => ({
    key: lineIdentity(store.items[0]!),
    revision: store.revision,
    split: true,
  })
  expect(store.apply(selection({ quantity: 1 }), product(), options())).toBe(false)
  expect(store.apply(selection({ quantity: 2.9, ripeness: 'ripe' }), product(), options())).toBe(
    false,
  )
  expect(store.items[0]!.quantity).toBe(3)
  expect(store.apply(selection({ quantity: 1, ripeness: 'ripe' }), product(), options())).toBe(true)
  expect(store.items.map((item) => item.quantity)).toEqual([2, 1])
  const edited = store.items[1]!
  expect(
    store.apply({ ...edited, ripeness: null }, product(), {
      key: lineIdentity(edited),
      revision: store.revision,
      split: false,
    }),
  ).toBe(true)
  expect(store.items).toEqual([selection({ quantity: 3 })])
})
it('keeps a quantity edit in place and retains the saved order of lines when storage fails', () => {
  const store = cart()
  for (const ripeness of [null, 'ripe', 'unripe']) store.apply(selection({ ripeness }), product())
  const keys = store.items.map(lineIdentity)
  const options = () => ({ key: keys[0]!, revision: store.revision, split: false })
  expect(store.apply(selection({ quantity: 2.5 }), product(), options())).toBe(true)
  expect(store.items.map(lineIdentity)).toEqual(keys)
  expect(store.items[0]!.quantity).toBe(2.5)
  const saved = localStorage.getItem(cartStorageKey(1))
  const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
    throw new Error('Storage full')
  })
  expect(store.apply(selection({ quantity: 4 }), product(), options())).toBe(false)
  expect(store.items[0]!.quantity).toBe(2.5)
  expect(store.items.map(lineIdentity)).toEqual(keys)
  expect(localStorage.getItem(cartStorageKey(1))).toBe(saved)
  write.mockRestore()
})
it('rejects stale editors and rolls back a complete split if storage fails', () => {
  const store = cart()
  store.apply(selection({ quantity: 3 }), product())
  const original = { key: lineIdentity(store.items[0]!), revision: store.revision, split: true }
  store.apply(selection(), product())
  expect(store.apply(selection({ ripeness: 'ripe' }), product(), original)).toBe(false)
  const before = localStorage.getItem(cartStorageKey(1))
  vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
    throw new DOMException('Quota exceeded', 'QuotaExceededError')
  })
  expect(
    store.apply(selection({ ripeness: 'ripe' }), product(), {
      ...original,
      revision: store.revision,
    }),
  ).toBe(false)
  expect(store.items).toEqual([selection({ quantity: 4 })])
  expect(localStorage.getItem(cartStorageKey(1))).toBe(before)
  expect(store.error).toContain('previous cart and draft are unchanged')
})
it('isolates signed-in accounts, restores selections and clears transient vouchers on sign-out', () => {
  const store = cart()
  store.apply(selection(), product())
  store.selectVoucher('SAVE')
  store.setOwner(null)
  expect(store.items).toEqual([])
  expect(store.voucherCode).toBeNull()
  store.setOwner(2)
  expect(store.items).toEqual([])
  store.setOwner(1)
  expect(store.items).toEqual([selection()])
  expect(store.voucherCode).toBeNull()
})
it('retains corrupt/unsupported saved data until explicit reset, with no silent overwrite', () => {
  localStorage.setItem(cartStorageKey(1), '{corrupt')
  const store = cart()
  expect(store.needsRecovery).toBe(true)
  expect(store.apply(selection(), product())).toBe(false)
  expect(localStorage.getItem(cartStorageKey(1))).toBe('{corrupt')
  expect(store.resetSaved()).toBe(true)
  expect(store.needsRecovery).toBe(false)
  expect(JSON.parse(localStorage.getItem(cartStorageKey(1))!)).toEqual({ version: 1, items: [] })
})
it('detects another tab write before changing local state, then reloads it explicitly', () => {
  const store = cart()
  store.apply(selection(), product())
  localStorage.setItem(
    cartStorageKey(1),
    JSON.stringify({ version: 1, items: [selection({ quantity: 5 })] }),
  )
  expect(store.apply(selection(), product())).toBe(false)
  expect(store.items[0]!.quantity).toBe(1)
  expect(store.error).toContain('another tab')
  store.reload()
  expect(store.items[0]!.quantity).toBe(5)
  expect(store.apply(selection(), product())).toBe(true)
  expect(store.items[0]!.quantity).toBe(6)
})
it('removes and clears selections persistently without server calls', () => {
  const store = cart()
  store.apply(selection(), product())
  store.apply(selection({ ripeness: 'ripe' }), product())
  store.remove(lineIdentity(selection()))
  expect(store.count).toBe(1)
  store.selectVoucher('SAVE')
  store.clear()
  expect(store.items).toEqual([])
  expect(store.voucherCode).toBeNull()
  store.setOwner(null)
  store.setOwner(1)
  expect(store.count).toBe(0)
})
