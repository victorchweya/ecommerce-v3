import { expect, it } from 'vitest'
import { productSchema, type ProductSelection } from '@/types/catalog'
import { catalogProduct } from '@/types/__tests__/catalog.fixture'
import { calculateCart, cartSummary, voucherAvailable } from '../calculations'
import { additionIssue } from '@/validation/cart'
const context = { homeCompanyId: 10, groupMarkup: 0 }
const now = Date.parse('2026-10-15T10:00:00Z')
const selection: ProductSelection = {
  productId: 1,
  productUnitVariantId: 100,
  processingTypeId: null,
  quantity: 2,
  ripeness: null,
  size: null,
  washed: null,
}
it('allocates limited sale stock once per unit across specifications and processing, retaining full selections', () => {
  const product = productSchema.parse(catalogProduct())
  const lines = calculateCart(
    [selection, { ...selection, ripeness: 'ripe', processingTypeId: 9 }],
    [product],
    context,
    now,
  )
  expect(lines[0]!.portions).toEqual([
    { quantity: 1, unitPrice: 80, sale: true, total: 80 },
    { quantity: 1, unitPrice: 100, sale: false, total: 100 },
  ])
  expect(lines[1]!.portions).toEqual([{ quantity: 2, unitPrice: 110, sale: false, total: 220 }])
  expect(cartSummary(lines, 5000, null, now).subtotal).toBe(400)
  expect(lines.map((line) => line.selection.quantity)).toEqual([2, 2])
})
it('recalculates sale expiry and unavailable options without mutating persisted selections', () => {
  const product = productSchema.parse(catalogProduct())
  const before = structuredClone(selection)
  const expired = calculateCart([selection], [product], context, Date.parse('2100-01-01T00:00:00Z'))
  expect(expired[0]!.total).toBe(200)
  expect(selection).toEqual(before)
  expect(calculateCart([selection], [], context, now)[0]!.issue).toContain('unavailable')
  product.variations[0]!.unit_variants[0]!.minimum_order_quantity = 5
  expect(calculateCart([selection], [product], context, now)[0]!.issue).toContain('minimum')
})
it('uses VAT-inclusive prices and caps flat/percentage voucher estimates without discounting unavailable baskets', () => {
  const raw = catalogProduct()
  raw.tax = { id: 1, name: 'VAT', rate: '16' }
  const product = productSchema.parse(raw)
  const lines = calculateCart([selection], [product], context, now)
  expect(lines[0]!.includedTax).toBe(24.83)
  const coupon = {
    code: 'SAVE',
    discount_type: 'Percentage' as const,
    discount_value: 10,
    status: 'Active',
    expiry_date: '2099-01-01T00:00:00Z',
  }
  expect(cartSummary(lines, 200, coupon, now)).toMatchObject({
    subtotal: 180,
    discount: 18,
    total: 162,
    shortfall: 38,
  })
  expect(
    cartSummary(lines, 0, { ...coupon, discount_type: 'Flat', discount_value: 999 }, now).total,
  ).toBe(0)
  expect(
    cartSummary([...lines, { ...lines[0]!, issue: 'Unavailable', total: 0 }], 0, coupon, now)
      .discount,
  ).toBe(0)
  expect(voucherAvailable({ ...coupon, expiry_date: 'invalid' }, now)).toBe(false)
  expect(voucherAvailable({ ...coupon, status: 'Expired' }, now)).toBe(false)
})
it('applies the existing dairy add cutoff in Nairobi regardless of device timezone', () => {
  const p = productSchema.parse(catalogProduct())
  p.category!.slug = 'dairy'
  expect(additionIssue(p, Date.parse('2026-10-15T11:59:00Z'))).toBe('')
  expect(additionIssue(p, Date.parse('2026-10-15T12:00:00Z'))).toContain('3 pm')
})
