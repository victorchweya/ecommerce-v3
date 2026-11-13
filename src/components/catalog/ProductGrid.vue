<script setup lang="ts">
import { computed, shallowRef, useId } from 'vue'
import { RouterLink } from 'vue-router'
import type { Product } from '@/types/catalog'
import type { CatalogPricing } from '@/utils/catalog/pricing'
import { useDrawerFocus } from '@/composables/shared/useDrawerFocus'
import ProductCard from './ProductCard.vue'
import ProductQuickAdd from './ProductQuickAdd.vue'
const props = defineProps<{
  products: Product[]
  pricing: CatalogPricing
  now: number
  favouriteIds?: Set<number>
  favouriteDisabled?: boolean
  label?: string
}>()
defineEmits<{ favourite: [productId: number] }>()
const dialogId = useId()
const open = shallowRef(false)
const selectedId = shallowRef<number | null>(null)
const selectedProduct = computed(() => props.products.find((item) => item.id === selectedId.value))
const notice = shallowRef('')
const { rememberTrigger, restoreFocus } = useDrawerFocus()
function showCartOptions(productId: number, event: Event) {
  rememberTrigger(event)
  notice.value = ''
  selectedId.value = productId
  open.value = true
}
function afterHide() {
  selectedId.value = null
  restoreFocus()
}
</script>
<template>
  <p v-if="notice" role="status">
    {{ notice }} <RouterLink :to="{ name: 'cart' }" class="underline">View cart</RouterLink>
  </p>
  <ul
    role="list"
    :aria-label="label ?? 'Products'"
    class="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4 sm:gap-x-6"
  >
    <li v-for="product in products" :key="product.id" class="min-w-0">
      <ProductCard
        :product="product"
        :pricing="pricing"
        :now="now"
        :favourite="favouriteIds?.has(product.id)"
        :favourite-disabled="favouriteDisabled"
        :cart-dialog-id="dialogId"
        :cart-dialog-open="open && selectedId === product.id"
        @favourite="$emit('favourite', $event)"
        @add="showCartOptions(product.id, $event)"
      />
    </li>
  </ul>
  <ProductQuickAdd
    v-if="selectedProduct"
    :id="dialogId"
    v-model:visible="open"
    :product="selectedProduct"
    :pricing="pricing"
    :now="now"
    @added="notice = `${selectedProduct.name} added to cart.`"
    @after-hide="afterHide"
  />
</template>
