import type { UnitVariant } from '@/types/catalog'

export interface CatalogPricing {
  homeCompanyId: number
  groupMarkup: number
}
const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100
function saleTime(value: string | null | undefined) {
  if (!value) return NaN
  // Unzoned database dates use the backend's Africa/Nairobi timezone.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return Date.parse(`${value}T00:00:00+03:00`)
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(value))
    return Date.parse(`${value.replace(' ', 'T')}+03:00`)
  return Date.parse(value)
}
export function unitPricing(unit: UnitVariant, context: CatalogPricing, now: number) {
  if (unit.selling_price === null) return null
  const custom = unit.custom_pricing.find((price) => price.company_id === context.homeCompanyId)
  const regular = custom?.selling_price || unit.selling_price * (1 + context.groupMarkup / 100)
  if (!Number.isFinite(regular) || regular < 0) return null
  const sale = unit.flash_sale
  const remaining = sale ? Math.max(0, sale.quantity - sale.quantity_sold) : 0
  const active =
    sale?.status === 'active' &&
    context.groupMarkup === 0 &&
    saleTime(sale.start_date) <= now &&
    now <= saleTime(sale.end_date) &&
    remaining > 0 &&
    sale.sale_price > 0 &&
    sale.sale_price < regular
  return {
    regular: round(regular),
    sale: active ? round(sale.sale_price) : null,
    remaining: active ? remaining : 0,
  }
}
export function selectionEstimate(
  unit: UnitVariant,
  context: CatalogPricing,
  now: number,
  quantity: number,
  processingCost: number,
) {
  const price = unitPricing(unit, context, now)
  if (!price || !Number.isFinite(quantity) || quantity <= 0) return null
  const saleQuantity = Math.min(quantity, price.remaining)
  const regularQuantity = Math.max(0, quantity - saleQuantity)
  return {
    saleQuantity,
    regularQuantity,
    saleUnitPrice: price.sale === null ? null : round(price.sale + processingCost),
    regularUnitPrice: round(price.regular + processingCost),
    total: round(
      round(saleQuantity * ((price.sale ?? price.regular) + processingCost)) +
        round(regularQuantity * (price.regular + processingCost)),
    ),
  }
}
