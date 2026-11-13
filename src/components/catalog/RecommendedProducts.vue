<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useAuthStore } from '@/stores/auth'
import { recommendationsQuery } from '@/queries/catalog'
import type { Product } from '@/types/catalog'
import type { CatalogPricing } from '@/utils/catalog/pricing'
import { isVisibleProduct } from '@/utils/catalog/search'
import ProductGrid from './ProductGrid.vue'
const props = defineProps<{
  products: Product[]
  ready: boolean
  pricing: CatalogPricing
  now: number
}>()
const auth = useAuthStore()
const query = useQuery(
  computed(() => ({ ...recommendationsQuery(auth.token, auth.revision), enabled: props.ready })),
)
const recommended = computed(() =>
  [...new Set(query.data.value?.map((item) => item.product_id) ?? [])]
    .flatMap((id) => {
      const product = props.products.find(
        (product) => product.id === id && isVisibleProduct(product),
      )
      return product ? [product] : []
    })
    .slice(0, 6),
)
</script>
<template>
  <section
    aria-labelledby="recommendations-heading"
    class="flex flex-col gap-6 border-t border-surface pt-8"
  >
    <h2 id="recommendations-heading" class="text-xl font-semibold">Recommended for you</h2>
    <p v-if="query.isPending.value" role="status">Loading recommendations…</p>
    <template v-else-if="query.isError.value">
      <Message severity="warn"
        >Recommendations are unavailable. You can still browse the catalog.</Message
      >
      <Button
        label="Retry recommendations"
        severity="secondary"
        class="self-start"
        :disabled="query.isFetching.value"
        @click="query.refetch()"
      />
    </template>
    <ProductGrid
      v-else-if="recommended.length"
      :products="recommended"
      :pricing="pricing"
      :now="now"
      label="Recommended products"
    />
    <p v-else class="text-muted-color">No recommendations yet.</p>
  </section>
</template>
