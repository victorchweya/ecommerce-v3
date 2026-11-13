<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useCatalog } from '@/composables/catalog/useCatalog'
import { useCartStore } from '@/stores/cart'
import { reorderSelections } from '@/utils/orders/selections'
import type { Order } from '@/types/orders'
import QueryStatus from '@/components/shared/QueryStatus.vue'
const props = defineProps<{ order: Order }>()
const cart = useCartStore()
const { products, ready, now } = useCatalog()
const review = shallowRef(false)
const result = computed(() =>
  reorderSelections(props.order.order_line_items, products.data.value ?? [], now.value.getTime()),
)
function add() {
  if (
    ready.value &&
    products.isSuccess.value &&
    !products.isFetching.value &&
    cart.appendSelections(result.value.items, products.data.value ?? [])
  )
    review.value = false
}
</script>
<template>
  <section class="flex flex-col items-start gap-3">
    <Button
      label="Reorder"
      severity="secondary"
      variant="outlined"
      @click="review = !review"
    /><template v-if="review"
      ><h2 class="text-xl font-semibold">Review reorder</h2>
      <QueryStatus
        :pending="products.isPending.value"
        :error="products.error.value"
        :fetching="products.isFetching.value"
        @retry="products.refetch()" /><template
        v-if="products.isSuccess.value && !products.isError.value"
        ><p>
          {{ result.items.length }} available selection(s) will be added using current quantities,
          options and prices.
        </p>
        <ul v-if="result.skipped.length" class="max-h-64 overflow-y-auto list-disc pl-5">
          <li v-for="(message, index) in result.skipped" :key="index">{{ message }}</li>
        </ul>
        <Button
          label="Add available items to cart"
          :disabled="
            !ready || products.isFetching.value || !result.items.length || cart.needsRecovery
          "
          @click="add" /></template></template
    ><Message v-if="cart.error" severity="error">{{ cart.error }}</Message>
    <p v-if="cart.notice" role="status">
      {{ cart.notice }} <RouterLink to="/cart" class="underline">Open cart</RouterLink>
    </p>
  </section>
</template>
