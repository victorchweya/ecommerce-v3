import type { Product } from '@/types/catalog'
export const isVisibleProduct = (product: Product) =>
  product.published && product.status === 'active'
export function productGrades(product: Product) {
  return product.variations.flatMap((variant) =>
    variant.status === 'active' &&
    variant.grade &&
    variant.unit_variants.some((unit) => unit.status === 'active' && unit.unit)
      ? [variant.grade]
      : [],
  )
}
export function filterProducts(
  products: readonly Product[],
  filters: {
    search: string
    categoryId: number | null
    gradeId: number | null
    sort: string
  },
) {
  const terms = filters.search.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  return products
    .filter((product) => {
      const text = `${product.name} ${product.category?.name ?? ''}`.toLocaleLowerCase()
      return (
        isVisibleProduct(product) &&
        terms.every((term) => text.includes(term)) &&
        (!filters.categoryId || product.category?.id === filters.categoryId) &&
        (!filters.gradeId || productGrades(product).some((grade) => grade.id === filters.gradeId))
      )
    })
    .sort((a, b) =>
      filters.sort === 'name-desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name),
    )
}
export function specificationOptions(value: string | null | undefined) {
  return [
    ...new Set(
      (value ?? '')
        .split(',')
        .map((option) => option.trim())
        .filter((option) => option && option.toLowerCase() !== 'none'),
    ),
  ]
}
export function productImage(product: Product) {
  const media = product.variations.flatMap((grade) => grade.media)
  for (const item of media) {
    for (const value of [item.preview_url, item.original_url]) {
      if (value && /^https?:\/\//i.test(value)) return value
    }
  }
  return null
}
export function plainDescription(value: string | null | undefined) {
  const doc = new DOMParser().parseFromString(value ?? '', 'text/html')
  doc.querySelectorAll('script, style').forEach((node) => node.remove())
  return doc.body.textContent?.trim() ?? ''
}

export function normalizeSpecification(value: string | null) {
  const normalized = value?.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase()
  return !normalized || normalized === 'none' ? null : normalized
}
