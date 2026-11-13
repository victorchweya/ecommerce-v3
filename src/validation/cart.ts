import { z } from 'zod'
import type { Product } from '@/types/catalog'
import { quantityRules, isValidQuantity } from '@/utils/catalog/quantity'
import { specificationOptions } from '@/utils/catalog/search'
import { normalizeSpecification } from '@/utils/cart/line-identity'
const id = z.number().int().positive().max(Number.MAX_SAFE_INTEGER)
export const cartSelectionSchema = z.object({
  productId: id,
  productUnitVariantId: id,
  processingTypeId: id.nullable(),
  quantity: z
    .number()
    .finite()
    .positive()
    .max(Number.MAX_SAFE_INTEGER / 100),
  ripeness: z.string().max(500).nullable(),
  size: z.string().max(500).nullable(),
  washed: z.string().max(500).nullable(),
})
export const savedCartSchema = z.object({
  version: z.literal(1),
  items: z.array(cartSelectionSchema),
})
export function resolveSelection(
  input: z.infer<typeof cartSelectionSchema>,
  product: Product | undefined,
) {
  if (
    !product ||
    product.id !== input.productId ||
    !product.published ||
    product.status !== 'active'
  )
    return { issue: 'This product is currently unavailable.' } as const
  const grade = product.variations.find((item) =>
    item.unit_variants.some((unit) => unit.id === input.productUnitVariantId),
  )
  const unit = grade?.unit_variants.find((item) => item.id === input.productUnitVariantId)
  if (grade?.status !== 'active' || unit?.status !== 'active' || !unit.unit)
    return { issue: 'This grade or unit is currently unavailable.' } as const
  if (unit.selling_price === null)
    return { issue: 'Pricing is currently unavailable for this unit.', grade, unit } as const
  if (!isValidQuantity(input.quantity, quantityRules(unit.unit.name, unit.minimum_order_quantity)))
    return { issue: 'Check the minimum quantity and allowed decimal places.', grade, unit } as const
  const processing =
    input.processingTypeId === null
      ? null
      : unit.processing_variants.find(
          (item) => item.processing_type_id === input.processingTypeId && item.processing_type,
        )
  if (input.processingTypeId !== null && !processing)
    return { issue: 'This processing option is no longer available.', grade, unit } as const
  for (const [value, allowed] of [
    [input.ripeness, product.ripeness],
    [input.size, product.sizes],
    [input.washed, product.washed],
  ]) {
    const normalized = normalizeSpecification(value ?? null)
    if (
      normalized !== null &&
      !specificationOptions(allowed).some((option) => normalizeSpecification(option) === normalized)
    )
      return { issue: 'A selected specification is no longer available.', grade, unit } as const
  }
  return { issue: '', grade, unit, processingCost: processing?.processing_cost ?? 0 } as const
}
export function additionIssue(product: Product, now: number) {
  if (
    !['diary', 'dairy', 'milk-cream', 'plant-based', 'yoghurt', 'cheese'].includes(
      product.category?.slug ?? '',
    )
  )
    return ''
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Nairobi',
      hour: '2-digit',
      hourCycle: 'h23',
    }).format(now),
  )
  return hour >= 15 ? 'Dairy products cannot be added after 3 pm (Nairobi time).' : ''
}
