<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Paginator from 'primevue/paginator'
import { useCatalog } from '@/composables/catalog/useCatalog'
import { useCatalogFilters, routeId } from '@/composables/catalog/useCatalogFilters'
import { useFavourites } from '@/composables/catalog/useFavourites'
import { errorMessage } from '@/utils/auth'
import { isVisibleProduct } from '@/utils/catalog/search'
import CompanyContext from '@/components/organization/CompanyContext.vue'
import Select from 'primevue/select'
import Skeleton from 'primevue/skeleton'
import PageBreadcrumb from '@/components/shared/PageBreadcrumb.vue'
import ProductFilters from './ProductFilters.vue'
import ProductGrid from './ProductGrid.vue'
import RecommendedProducts from './RecommendedProducts.vue'
const props = defineProps<{ mode?: 'catalog' | 'category' | 'favourites'; categoryId?: string }>()
const router = useRouter()
const route = useRoute()
const { products, categories, pricing, now, ready } = useCatalog()
const favourites = useFavourites(() => ready.value)
const selectedCategoryId = computed(() => routeId(props.categoryId))
const category = computed(() =>
  categories.data.value?.find((item) => item.id === selectedCategoryId.value),
)
const unknownCategory = computed(
  () =>
    props.mode === 'category' &&
    (!selectedCategoryId.value || (categories.isSuccess.value && !category.value)),
)
const title = computed(() =>
  props.mode === 'favourites'
    ? 'Favourites'
    : props.mode === 'category'
      ? (category.value?.name ?? 'Category')
      : 'Catalog',
)
const source = computed(() =>
  (products.data.value ?? []).filter(
    (product) =>
      isVisibleProduct(product) &&
      (props.mode !== 'favourites' || favourites.ids.value.has(product.id)),
  ),
)
const unavailable = computed(() =>
  props.mode === 'favourites'
    ? (favourites.query.data.value?.filter(
        (item) =>
          !products.data.value?.some(
            (product) => product.id === item.product_id && isVisibleProduct(product),
          ),
      ) ?? [])
    : [],
)
const { search, gradeId, sort, visible, filtered, first, rows, grades, update } = useCatalogFilters(
  () => source.value,
  () => selectedCategoryId.value,
)
const favouriteDisabled = computed(
  () =>
    !favourites.query.isSuccess.value || favourites.query.isError.value || favourites.busy.value,
)
function selectCategory(id: number | null) {
  void router.push({
    name: id ? 'category' : props.mode === 'favourites' ? 'favourites' : 'catalog',
    params: id ? { categoryId: id } : {},
    query: { ...route.query, page: undefined },
  })
}
</script>
<template>
  <section aria-labelledby="catalog-heading" class="flex flex-col gap-6">
    <PageBreadcrumb
      :items="
        mode === 'category'
          ? [{ label: 'Catalog', to: '/catalog' }, { label: title }]
          : [{ label: title }]
      "
    />
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div class="flex min-w-0 flex-col gap-2">
        <h1 id="catalog-heading" class="text-2xl font-semibold">{{ title }}</h1>
        <CompanyContext class="text-sm text-muted-color" />
      </div>
      <Button
        :as="RouterLink"
        :to="{ name: mode === 'favourites' ? 'catalog' : 'favourites' }"
        severity="secondary"
        variant="text"
        :label="mode === 'favourites' ? 'Browse catalog' : 'View favourites'"
      />
    </header>
    <template v-if="ready">
      <template v-if="categories.isError.value">
        <Message severity="warn">Categories could not be loaded.</Message>
        <Button
          label="Retry categories"
          severity="secondary"
          class="self-start"
          :disabled="categories.isFetching.value"
          @click="categories.refetch()"
        />
      </template>
      <template v-if="unknownCategory">
        <h2 class="text-xl font-semibold">Category not found</h2>
        <RouterLink :to="{ name: 'catalog' }" class="underline">Browse all products</RouterLink>
      </template>
      <template v-else>
        <div class="flex min-w-0 flex-col gap-6">
          <ProductFilters
            :categories="categories.data.value ?? []"
            :grades="grades"
            :category-id="selectedCategoryId"
            :grade-id="gradeId"
            @category="selectCategory"
            @grade="update({ grade: $event ?? undefined })"
            @reset="router.replace({ name: mode === 'favourites' ? 'favourites' : 'catalog' })"
            class="border-y border-surface py-4"
          >
            <template #sort>
              <div class="flex min-w-0 items-center gap-3">
                <label id="sort-label" for="catalog-sort" class="sr-only">Sort products</label>
                <Select
                  inputId="catalog-sort"
                  name="sort"
                  ariaLabelledby="sort-label"
                  :modelValue="sort"
                  :options="[
                    { label: 'Name: A–Z', value: 'name-asc' },
                    { label: 'Name: Z–A', value: 'name-desc' },
                  ]"
                  optionLabel="label"
                  optionValue="value"
                  class="min-w-0"
                  @update:model-value="update({ sort: $event === 'name-asc' ? undefined : $event })"
                />
              </div>
            </template>
          </ProductFilters>
          <div class="flex min-w-0 flex-col gap-5">
            <div
              v-if="products.isSuccess.value"
              class="flex flex-wrap items-center justify-between gap-2"
            >
              <div class="flex flex-col gap-1">
                <p role="status" class="tabular-nums">
                  {{ filtered.length }} {{ filtered.length === 1 ? 'product' : 'products' }}
                  <span v-if="filtered.length > rows" class="text-muted-color">
                    · Showing {{ first + 1 }}–{{ first + visible.length }}</span
                  >
                </p>
              </div>
              <p v-if="search" class="text-sm text-muted-color">Results for “{{ search }}”</p>
            </div>
            <div
              v-if="products.isPending.value"
              role="status"
              class="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4"
            >
              <span class="sr-only">Loading products…</span
              ><Skeleton v-for="item in 8" :key="item" height="18rem" />
            </div>
            <template v-else-if="products.isError.value">
              <Message severity="error">{{ errorMessage(products.error.value) }}</Message>
              <Button
                label="Retry products"
                severity="secondary"
                class="self-start"
                :disabled="products.isFetching.value"
                @click="products.refetch()"
              />
            </template>
            <template v-else>
              <p v-if="favourites.query.isPending.value && mode === 'favourites'" role="status">
                Loading favourites…
              </p>
              <template v-if="favourites.query.isError.value">
                <Message severity="warn">Favourites could not be loaded.</Message>
                <Button
                  label="Retry favourites"
                  severity="secondary"
                  class="self-start"
                  :disabled="favourites.query.isFetching.value"
                  @click="favourites.query.refetch()"
                />
              </template>
              <Message v-if="favourites.mutation.isError.value" severity="error">{{
                errorMessage(favourites.mutation.error.value)
              }}</Message>
              <template v-if="mode !== 'favourites' || favourites.query.isSuccess.value">
                <div
                  v-if="!filtered.length"
                  class="flex flex-col items-center gap-4 py-12 text-center"
                >
                  <p class="text-muted-color">
                    {{
                      mode === 'favourites' && !search && !gradeId
                        ? 'No available favourites yet. Save products from the catalog.'
                        : 'No products match your selection. Try clearing the filters.'
                    }}
                  </p>
                  <Button
                    v-if="search || selectedCategoryId || gradeId"
                    label="Reset selection"
                    severity="secondary"
                    variant="outlined"
                    @click="
                      router.replace({ name: mode === 'favourites' ? 'favourites' : 'catalog' })
                    "
                  />
                </div>
                <ProductGrid
                  v-else
                  :products="visible"
                  :pricing="pricing"
                  :now="now.getTime()"
                  :favourite-ids="favourites.ids.value"
                  :favourite-disabled="favouriteDisabled"
                  @favourite="favourites.toggle"
                />
                <Paginator
                  v-if="filtered.length > rows"
                  :first="first"
                  :rows="rows"
                  :totalRecords="filtered.length"
                  template="PrevPageLink CurrentPageReport NextPageLink"
                  currentPageReportTemplate="Page {currentPage} of {totalPages}"
                  class="border-t border-surface pt-6"
                  @page="update({ page: $event.page ? $event.page + 1 : undefined })"
                />
                <ul
                  v-if="unavailable.length"
                  aria-label="Unavailable favourites"
                  class="flex flex-col gap-3"
                >
                  <li
                    v-for="item in unavailable"
                    :key="item.product_id"
                    class="flex flex-wrap items-center gap-3"
                  >
                    <p>
                      {{ item.product?.name ?? `Product ${item.product_id}` }} is currently
                      unavailable.
                    </p>
                    <Button
                      :label="`Remove ${item.product?.name ?? `product ${item.product_id}`} from favourites`"
                      severity="secondary"
                      :disabled="favouriteDisabled"
                      @click="favourites.toggle(item.product_id)"
                    />
                  </li>
                </ul>
              </template>
            </template>
            <RecommendedProducts
              v-if="(!mode || mode === 'catalog') && products.isSuccess.value"
              :products="products.data.value ?? []"
              :ready="ready"
              :pricing="pricing"
              :now="now.getTime()"
            />
          </div>
        </div>
      </template>
    </template>
  </section>
</template>
