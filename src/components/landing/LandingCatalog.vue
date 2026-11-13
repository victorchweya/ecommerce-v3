<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'
import CategoryLinks from './CategoryLinks.vue'
import ProductGrid from '@/components/catalog/ProductGrid.vue'
import { useCatalog } from '@/composables/catalog/useCatalog'
import { useAuthStore } from '@/stores/auth'
import { recommendationsQuery } from '@/queries/catalog'
import { isVisibleProduct } from '@/utils/catalog/search'
import { errorMessage } from '@/utils/auth'
const auth = useAuthStore()
const { products, pricing, now, ready } = useCatalog()
const recommendations = useQuery(
  computed(() => ({ ...recommendationsQuery(auth.token, auth.revision), enabled: ready.value })),
)
const available = computed(() => (products.data.value ?? []).filter(isVisibleProduct))
const recommended = computed(() =>
  [...new Set(recommendations.data.value?.map((item) => item.product_id) ?? [])]
    .flatMap((id) => {
      const product = available.value.find((product) => product.id === id)
      return product ? [product] : []
    })
    .slice(0, 8),
)
const selection = computed(() =>
  recommended.value.length ? recommended.value : available.value.slice(0, 8),
)
const title = computed(() => (recommended.value.length ? 'Recommended for you' : 'Shop products'))
</script>
<template>
  <div v-if="ready" class="flex flex-col gap-12">
    <CategoryLinks :products="available" />
    <section aria-labelledby="landing-products-heading" class="flex flex-col gap-6">
      <header class="flex flex-wrap items-center justify-between gap-3">
        <h2 id="landing-products-heading" class="text-xl font-semibold">{{ title }}</h2>
        <Button
          :as="RouterLink"
          to="/catalog"
          label="View all products"
          severity="secondary"
          variant="text"
        />
      </header>
      <div
        v-if="products.isPending.value"
        role="status"
        class="grid grid-cols-2 gap-6 md:grid-cols-4"
      >
        <span class="sr-only">Loading products…</span
        ><Skeleton v-for="item in 4" :key="item" height="14rem" />
      </div>
      <template v-else-if="products.isError.value">
        <Message severity="warn">{{ errorMessage(products.error.value) }}</Message>
        <Button
          label="Retry products"
          severity="secondary"
          class="self-start"
          :loading="products.isFetching.value"
          @click="products.refetch()"
        />
      </template>
      <ProductGrid
        v-else-if="selection.length"
        :products="selection"
        :pricing="pricing"
        :now="now.getTime()"
        :label="title === 'Recommended for you' ? 'Recommended products' : 'Featured products'"
      />
      <p v-else class="text-muted-color">
        No products are available right now. Please check back later or contact our team.
      </p>
    </section>
  </div>
</template>
