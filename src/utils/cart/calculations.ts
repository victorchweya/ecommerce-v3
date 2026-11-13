import type { Product } from '@/types/catalog'
import type { CartSelection, CartLine } from '@/types/cart'
import type { Voucher } from '@/types/checkout'
import { resolveSelection } from '@/validation/cart'
import { lineIdentity } from './line-identity'
import { unitPricing, type CatalogPricing } from '@/utils/catalog/pricing'
const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100
export function calculateCart(
  items: readonly CartSelection[],
  products: readonly Product[],
  context: CatalogPricing,
  now: number,
) {
  const remaining = new Map<number, number>()
  return items.map((selection): CartLine => {
    const product = products.find((product) => product.id === selection.productId)
    const resolved = resolveSelection(selection, product)
    const line: CartLine = {
      key: lineIdentity(selection),
      selection,
      product,
      grade: resolved.grade,
      unit: resolved.unit,
      issue: resolved.issue,
      portions: [],
      total: 0,
      includedTax: 0,
    }
    if (resolved.issue || !resolved.unit) return line
    const price = unitPricing(resolved.unit, context, now)
    if (!price) return { ...line, issue: 'Pricing is currently unavailable for this unit.' }
    const available = remaining.get(selection.productUnitVariantId) ?? price.remaining
    const saleQuantity = Math.min(selection.quantity, available)
    remaining.set(selection.productUnitVariantId, round(available - saleQuantity))
    for (const [quantity, amount, sale] of [
      [saleQuantity, price.sale ?? price.regular, true],
      [round(selection.quantity - saleQuantity), price.regular, false],
    ] as const) {
      if (quantity > 0) {
        const unitPrice = round(amount + (resolved.processingCost ?? 0))
        line.portions.push({ quantity, unitPrice, sale, total: round(quantity * unitPrice) })
      }
    }
    line.total = round(line.portions.reduce((sum, item) => sum + item.total, 0))
    if (!Number.isFinite(line.total))
      return { ...line, issue: 'This quantity cannot be priced safely.', portions: [], total: 0 }
    const rate = product?.tax?.rate ?? 0
    line.includedTax = round((line.total * rate) / (100 + rate))
    return line
  })
}
export function voucherAvailable(voucher: Voucher | null | undefined, now: number) {
  return Boolean(
    voucher &&
    voucher.status === 'Active' &&
    (!voucher.expiry_date || Date.parse(voucher.expiry_date) >= now),
  )
}
export function cartSummary(
  lines: readonly CartLine[],
  minimum: number,
  voucher: Voucher | null,
  now: number,
) {
  const subtotal = round(lines.reduce((sum, line) => sum + line.total, 0))
  const hasUnavailable = lines.some((line) => Boolean(line.issue))
  const discount =
    !hasUnavailable && voucherAvailable(voucher, now) && voucher
      ? round(
          Math.min(
            subtotal,
            voucher.discount_type === 'Percentage'
              ? (subtotal * Math.min(100, voucher.discount_value)) / 100
              : voucher.discount_value,
          ),
        )
      : 0
  return {
    subtotal,
    discount,
    total: round(subtotal - discount),
    includedTax: round(lines.reduce((sum, line) => sum + line.includedTax, 0)),
    minimum,
    shortfall: round(Math.max(0, minimum - (subtotal - discount))),
    hasUnavailable,
  }
}
