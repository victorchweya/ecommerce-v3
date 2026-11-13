import { expect, it } from 'vitest'
import { productSchema, decimalSchema } from '@/types/catalog'
import { catalogProduct } from '@/types/__tests__/catalog.fixture'
import { quantityRules, isValidQuantity } from '../quantity'
import { unitPricing, selectionEstimate } from '../pricing'
import {
  filterProducts,
  productGrades,
  specificationOptions,
  productImage,
  plainDescription,
} from '../search'
import { routeId } from '@/composables/catalog/useCatalogFilters'
const product = () => productSchema.parse(catalogProduct())
const context = { homeCompanyId: 10, groupMarkup: 0 }
const now = Date.parse('2026-10-15T00:00:00Z')
it('accepts decimal strings without coercing empty, boolean or infinite values to money', () => {
  expect(product().variations[0]!.unit_variants[0]!.selling_price).toBe(100)
  for (const value of ['', ' ', true, null, 'Infinity', Infinity, '1abc'])
    expect(decimalSchema.safeParse(value).success).toBe(false)
  expect(
    productSchema.safeParse({
      ...catalogProduct(),
      variations: [
        {
          ...catalogProduct().variations[0],
          unit_variants: [
            { ...catalogProduct().variations[0]!.unit_variants[0], selling_price: '-1' },
          ],
        },
      ],
    }).success,
  ).toBe(false)
})
it('uses fractional KG/minimum rules and rejects blank, negative, below-minimum and overprecise quantities', () => {
  const kg = quantityRules('KG', 0.25)
  expect(kg).toEqual({ min: 0.25, step: 0.01, maxFractionDigits: 2 })
  expect(isValidQuantity(0.26, kg)).toBe(true)
  for (const quantity of [null, NaN, Infinity, -1, 0, 0.24, 0.251])
    expect(isValidQuantity(quantity, kg)).toBe(false)
  expect(isValidQuantity(1.5, quantityRules('Piece', 1))).toBe(false)
  expect(quantityRules('Bag', 0.5).maxFractionDigits).toBe(2)
  expect(quantityRules('KG', null).min).toBe(0.1)
})
it('applies home-company custom pricing before markup and never another company price', () => {
  const unit = product().variations[0]!.unit_variants[0]!
  unit.custom_pricing = [
    { company_id: 22, selling_price: 1 },
    { company_id: 10, selling_price: 90 },
  ]
  expect(unitPricing(unit, { ...context, groupMarkup: 10 }, now)).toEqual({
    regular: 90,
    sale: null,
    remaining: 0,
  })
  expect(
    unitPricing({ ...unit, custom_pricing: [] }, { ...context, groupMarkup: -10 }, now)?.regular,
  ).toBe(90)
})
it('splits the available sale portion and includes processing in both price portions', () => {
  const unit = product().variations[0]!.unit_variants[0]!
  expect(selectionEstimate(unit, context, now, 2.5, 10)).toEqual({
    saleQuantity: 1,
    regularQuantity: 1.5,
    saleUnitPrice: 90,
    regularUnitPrice: 110,
    total: 255,
  })
})
it('stops applying expired, future, exhausted, inactive and invalid-date sales', () => {
  const unit = product().variations[0]!.unit_variants[0]!
  for (const override of [
    { end_date: '2020-01-01' },
    { start_date: '2099-01-01' },
    { quantity_sold: 2 },
    { status: 'inactive' },
    { start_date: 'invalid' },
  ]) {
    expect(
      unitPricing({ ...unit, flash_sale: { ...unit.flash_sale!, ...override } }, context, now)
        ?.sale,
    ).toBeNull()
  }
  expect(unitPricing({ ...unit, selling_price: null }, context, now)).toBeNull()
})
it('searches all terms across product/category, filters and sorts without mutating records', () => {
  const a = product()
  const b = productSchema.parse(catalogProduct(2, 'Carrots'))
  b.variations[0]!.grade = { id: 2, name: 'Grade 2' }
  const hidden = { ...a, id: 3, published: false }
  const filters = { search: 'TOM veget', categoryId: 3, gradeId: 1, sort: 'name-asc' }
  expect(filterProducts([b, hidden, a], filters).map((p) => p.id)).toEqual([1])
  expect(
    filterProducts([a, b], { ...filters, search: '', gradeId: null, sort: 'name-desc' }).map(
      (p) => p.name,
    ),
  ).toEqual(['Tomatoes', 'Carrots'])
  expect(a.name).toBe('Tomatoes')
  expect(filterProducts([a], { ...filters, categoryId: 999 })).toEqual([])
  expect(filterProducts([a, b], { ...filters, search: '', gradeId: 2 }).map((p) => p.id)).toEqual([
    2,
  ])
})
it('matches canonical grade IDs only for active grades with an active unit', () => {
  const p = product()
  const grade = p.variations[0]!
  p.variations.push(
    { ...grade, id: 20, status: 'inactive', grade: { id: 2, name: 'Grade 2' } },
    {
      ...grade,
      id: 30,
      grade: { id: 3, name: 'Grade 3' },
      unit_variants: [{ ...grade.unit_variants[0]!, status: 'inactive' }],
    },
    {
      ...grade,
      id: 40,
      grade: { id: 4, name: 'Grade 4' },
      unit_variants: [{ ...grade.unit_variants[0]!, unit: null }],
    },
    { ...grade, id: 50, grade: null },
  )
  expect(productGrades(p)).toEqual([{ id: 1, name: 'Grade 1' }])
  for (const gradeId of [2, 3, 4, 10, 999])
    expect(
      filterProducts([p], { search: '', categoryId: null, gradeId, sort: 'name-asc' }),
    ).toEqual([])
})
it('validates route identifiers, allowed specifications and safe image/description rendering', () => {
  for (const value of ['0', '-1', '1.5', '1e2', '9007199254740992', ['1'], undefined])
    expect(routeId(value)).toBeNull()
  expect(routeId('12')).toBe(12)
  expect(specificationOptions('ripe, ripe,none, small, ')).toEqual(['ripe', 'small'])
  const p = product()
  p.variations[0]!.media = [
    { preview_url: 'javascript:alert(1)', original_url: 'https://images.example.test/a.jpg' },
  ]
  expect(productImage(p)).toBe('https://images.example.test/a.jpg')
  expect(
    plainDescription('<p>Fresh &amp; good</p><script>alert(1)</script><style>bad</style>'),
  ).toBe('Fresh & good')
})

it('interprets unzoned promotion dates in the backend timezone independently of browser timezone', () => {
  const unit = product().variations[0]!.unit_variants[0]!
  unit.flash_sale = {
    ...unit.flash_sale!,
    start_date: '2026-10-15',
    end_date: '2026-10-16 00:00:00',
  }
  expect(unitPricing(unit, context, Date.parse('2026-10-14T21:00:00Z'))?.sale).toBe(80)
  expect(unitPricing(unit, context, Date.parse('2026-10-15T21:00:01Z'))?.sale).toBeNull()
  expect(
    unitPricing({ ...unit, flash_sale: { ...unit.flash_sale!, start_date: null } }, context, now)
      ?.sale,
  ).toBeNull()
})
