import type { OrderLine } from '@/types/orders'
import type { Product, ProductSelection } from '@/types/catalog'
import { specificationOptions, normalizeSpecification } from '@/utils/catalog/search'
import { lineIdentity } from '@/utils/cart/line-identity'
import { resolveSelection, additionIssue } from '@/validation/cart'
export function selectionFromOrderLine(line: OrderLine, product: Product): ProductSelection | null {
  const tokens = (line.specifications ?? '')
    .split(',')
    .map((value) => normalizeSpecification(value))
    .filter((value): value is string => Boolean(value))
  const selected = { ripeness: null, size: null, washed: null } as Pick<
    ProductSelection,
    'ripeness' | 'size' | 'washed'
  >
  const fields = [
    ['ripeness', product.ripeness],
    ['size', product.sizes],
    ['washed', product.washed],
  ] as const
  for (const token of tokens) {
    const matches = fields.filter(([, options]) =>
      specificationOptions(options).some((option) => normalizeSpecification(option) === token),
    )
    if (matches.length !== 1 || selected[matches[0]![0]] !== null) return null
    selected[matches[0]![0]] = token
  }
  return {
    productId: product.id,
    productUnitVariantId: line.product_unit_variant_id,
    processingTypeId: line.processing_type_id ?? null,
    quantity: line.order_quantity,
    ...selected,
  }
}
export function reorderSelections(lines: OrderLine[], products: Product[], now = Date.now()) {
  const items = new Map<string, ProductSelection>()
  const skipped: string[] = []
  for (const line of lines) {
    const product = products.find((product) =>
      product.variations.some((grade) =>
        grade.unit_variants.some((unit) => unit.id === line.product_unit_variant_id),
      ),
    )
    const selection = product ? selectionFromOrderLine(line, product) : null
    const issue = !product || !selection ? 'Product or saved options are no longer available.' : ''
    if (issue || !selection) {
      skipped.push(
        `${line.unit_variant?.grade_variant?.product?.name ?? `Item ${line.id}`}: ${issue}`,
      )
      continue
    }
    const key = lineIdentity(selection)
    const previous = items.get(key)
    items.set(key, {
      ...selection,
      quantity: Math.round((selection.quantity + (previous?.quantity ?? 0)) * 100) / 100,
    })
  }
  const valid = [...items.values()].filter((selection) => {
    const product = products.find((product) => product.id === selection.productId)!
    const issue = resolveSelection(selection, product).issue || additionIssue(product, now)
    if (issue) skipped.push(`${product.name}: ${issue}`)
    return !issue
  })
  return { items: valid, skipped }
}
