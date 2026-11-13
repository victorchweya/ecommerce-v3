import { beforeEach, it, expect } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { reorderSelections } from '../selections'
import { useCartStore } from '@/stores/cart'
import { catalogProduct } from '@/types/__tests__/catalog.fixture'
import { productSchema } from '@/types/catalog'
import { orderLineSchema } from '@/types/orders'
beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})
const product = productSchema.parse(catalogProduct())
const line = orderLineSchema.parse({
  id: 1,
  product_unit_variant_id: 100,
  order_quantity: 1,
  selling_price: 80,
  specifications: 'ripe,small',
})
it('combines historical flash-sale portions by selection identity', () => {
  const result = reorderSelections(
    [line, { ...line, id: 2, order_quantity: 2, selling_price: 100 }],
    [product],
  )
  expect(result.skipped).toEqual([])
  expect(result.items).toHaveLength(1)
  expect(result.items[0]).toMatchObject({ quantity: 3, ripeness: 'ripe', size: 'small' })
})
it('reports obsolete or ambiguous specifications without discarding them silently', () => {
  expect(reorderSelections([{ ...line, specifications: 'obsolete' }], [product]).items).toEqual([])
  expect(reorderSelections([line], [{ ...product, sizes: 'ripe' }]).skipped).toHaveLength(1)
})
it('adds a complete reorder atomically and preserves a previous cart if any selection fails', () => {
  const cart = useCartStore()
  cart.setOwner(1)
  const items = reorderSelections([line], [product]).items
  expect(cart.appendSelections(items, [product])).toBe(true)
  const previous = localStorage.getItem('ftf:v3:cart:1')
  expect(cart.appendSelections([...items, { ...items[0]!, quantity: 0.01 }], [product])).toBe(false)
  expect(localStorage.getItem('ftf:v3:cart:1')).toBe(previous)
  expect(cart.items[0]?.quantity).toBe(1)
})

it('validates historical sale portions after combining their quantities', () => {
  const result = reorderSelections(
    [
      { ...line, order_quantity: 0.1 },
      { ...line, id: 2, order_quantity: 0.15 },
    ],
    [product],
  )
  expect(result.skipped).toEqual([])
  expect(result.items[0]?.quantity).toBe(0.25)
})
