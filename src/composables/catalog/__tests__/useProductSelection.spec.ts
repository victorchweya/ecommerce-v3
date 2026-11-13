import { effectScope, shallowRef } from 'vue'
import { expect, it } from 'vitest'
import { productSchema } from '@/types/catalog'
import { catalogProduct } from '@/types/__tests__/catalog.fixture'
import { useProductSelection } from '../useProductSelection'
it('selects only returned grade/unit variants and resets quantity/processing when unit changes', () => {
  const product = productSchema.parse(catalogProduct())
  const first = product.variations[0]!
  first.unit_variants.push({
    ...first.unit_variants[0]!,
    id: 101,
    unit: { id: 2, name: 'Piece' },
    minimum_order_quantity: 2,
    is_default: false,
    processing_variants: [],
  })
  const scope = effectScope()
  const draft = scope.run(() => useProductSelection(() => product))!
  expect(draft.selection.value?.productUnitVariantId).toBe(100)
  expect(draft.quantity.value).toBe(0.25)
  draft.processingId.value = 9
  draft.quantity.value = 3
  draft.unitId.value = 101
  expect(draft.quantity.value).toBe(2)
  expect(draft.processingId.value).toBeNull()
  draft.quantity.value = 2.5
  expect(draft.selection.value).toBeNull()
  scope.stop()
})
it('rejects cross-grade units, unknown processing, unsupported specs and back-in-stock-soon selections', () => {
  const product = productSchema.parse(catalogProduct())
  product.variations.push({
    ...product.variations[0]!,
    id: 11,
    status: 'back_in_stock_soon',
    is_default: false,
  })
  const scope = effectScope()
  const draft = scope.run(() => useProductSelection(() => product))!
  draft.processingId.value = 999
  expect(draft.selection.value).toBeNull()
  draft.processingId.value = null
  draft.size.value = 'invented'
  expect(draft.selection.value).toBeNull()
  draft.size.value = 'large'
  expect(draft.selection.value?.size).toBe('large')
  draft.gradeId.value = 11
  expect(draft.available.value).toBe(false)
  expect(draft.selection.value).toBeNull()
  draft.gradeId.value = 10
  draft.unitId.value = 999
  expect(draft.selection.value).toBeNull()
  scope.stop()
})
it('handles no variations and removed variants without inventing a valid selection', () => {
  const product = shallowRef(productSchema.parse(catalogProduct()))
  const scope = effectScope()
  const draft = scope.run(() => useProductSelection(() => product.value))!
  product.value = { ...product.value, variations: [] }
  expect(draft.unit.value).toBeUndefined()
  expect(draft.selection.value).toBeNull()
  scope.stop()
})
