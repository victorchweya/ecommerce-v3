import type { CartSelection } from '@/types/cart'
import { normalizeSpecification } from '@/utils/catalog/search'
export { normalizeSpecification } from '@/utils/catalog/search'
export function normalizeSelection(input: CartSelection): CartSelection {
  return {
    ...input,
    ripeness: normalizeSpecification(input.ripeness),
    size: normalizeSpecification(input.size),
    washed: normalizeSpecification(input.washed),
  }
}
export function lineIdentity(input: CartSelection) {
  const item = normalizeSelection(input)
  return JSON.stringify([
    item.productId,
    item.productUnitVariantId,
    item.processingTypeId,
    item.ripeness,
    item.size,
    item.washed,
  ])
}
