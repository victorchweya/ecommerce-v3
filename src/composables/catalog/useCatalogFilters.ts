import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { LocationQueryRaw } from 'vue-router'
import { filterProducts, productGrades } from '@/utils/catalog/search'
import type { Product } from '@/types/catalog'

export function routeId(value: unknown): number | null {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null
  const id = Number(value)
  return Number.isSafeInteger(id) ? id : null
}
export function useCatalogFilters(
  products: () => readonly Product[],
  categoryId: () => number | null,
) {
  const route = useRoute()
  const router = useRouter()
  const search = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''))
  const gradeId = computed(() => routeId(route.query.grade))
  watch(
    () => route.query,
    (query) => {
      if ('unit' in query || 'express' in query) {
        const cleaned = { ...query }
        delete cleaned.unit
        delete cleaned.express
        void router.replace({ query: cleaned })
      }
    },
    { immediate: true },
  )
  const sort = computed(() => (route.query.sort === 'name-desc' ? 'name-desc' : 'name-asc'))
  const filtered = computed(() =>
    filterProducts(products(), {
      search: search.value,
      categoryId: categoryId(),
      gradeId: gradeId.value,
      sort: sort.value,
    }),
  )
  const rows = 12
  const page = computed(() =>
    Math.min(routeId(route.query.page) ?? 1, Math.max(1, Math.ceil(filtered.value.length / rows))),
  )
  const first = computed(() => (page.value - 1) * rows)
  const visible = computed(() => filtered.value.slice(first.value, first.value + rows))
  const grades = computed(() =>
    [
      ...new Map(
        products().flatMap((product) =>
          productGrades(product).map((grade) => [grade.id, grade] as const),
        ),
      ).values(),
    ].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })),
  )
  function update(values: LocationQueryRaw) {
    void router.replace({ query: { ...route.query, page: undefined, ...values } })
  }
  return { search, gradeId, sort, filtered, visible, first, rows, grades, update }
}
