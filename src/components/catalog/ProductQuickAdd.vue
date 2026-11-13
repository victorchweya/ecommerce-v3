<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { RouterLink } from 'vue-router'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import type { Product, ProductSelection } from '@/types/catalog'
import type { CatalogPricing } from '@/utils/catalog/pricing'
import { useCart } from '@/composables/cart/useCart'
import { additionIssue } from '@/validation/cart'
import ProductConfigurator from './ProductConfigurator.vue'

const props = defineProps<{
  id: string
  product: Product
  pricing: CatalogPricing
  now: number
}>()
const visible = defineModel<boolean>('visible', { required: true })
const emit = defineEmits<{ added: []; afterHide: [] }>()
const { cart, add, disabled, scopeKey } = useCart(false)
const error = shallowRef('')
const issue = computed(() => additionIssue(props.product, props.now))
watch(scopeKey, () => {
  visible.value = false
})
function confirm(selection: ProductSelection) {
  if (!visible.value || disabled.value || issue.value) return
  if (add(selection, props.product)) {
    emit('added')
    visible.value = false
  } else error.value = cart.error
}
</script>
<template>
  <Dialog
    :id="id"
    v-model:visible="visible"
    :header="product.name"
    modal
    blockScroll
    :draggable="false"
    class="w-xl max-w-[calc(100vw_-_2rem)]"
    @after-hide="emit('afterHide')"
  >
    <div class="flex flex-col gap-4">
      <Message v-if="error" severity="error">{{ error }}</Message>
      <Message v-if="issue" severity="info">{{ issue }}</Message>
      <Message v-if="cart.needsRecovery" severity="warn">
        Your saved cart needs attention.
        <RouterLink :to="{ name: 'cart' }" class="underline">Review your cart</RouterLink>
      </Message>
      <ProductConfigurator
        :product="product"
        :pricing="pricing"
        :now="now"
        action-label="Add to cart"
        :disabled="!visible || disabled || Boolean(issue)"
        @confirm="confirm"
      />
    </div>
  </Dialog>
</template>
