<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import type { CartLine } from '@/types/cart'
import type { ProductSelection } from '@/types/catalog'
import type { CatalogPricing } from '@/utils/catalog/pricing'
import { quantityRules } from '@/utils/catalog/quantity'
import ProductConfigurator from '@/components/catalog/ProductConfigurator.vue'
const props = defineProps<{
  line: CartLine
  split: boolean
  pricing: CatalogPricing
  now: number
  disabled: boolean
}>()
defineEmits<{ save: [selection: ProductSelection]; cancel: [] }>()
const initial = computed(() => ({
  ...props.line.selection,
  quantity: props.split
    ? quantityRules(props.line.unit?.unit?.name, props.line.unit?.minimum_order_quantity).min
    : props.line.selection.quantity,
}))
</script>
<template>
  <section
    :aria-label="split ? 'Split item details' : 'Edit item options'"
    class="flex flex-col gap-4 border-t border-surface pt-4"
  >
    <h3 class="font-semibold">
      {{ split ? 'Split quantity into different options' : 'Edit options' }}
    </h3>
    <p v-if="split" class="text-sm text-muted-color">
      Choose the quantity and options for the new part. Both parts must meet the minimum quantity.
    </p>
    <ProductConfigurator
      v-if="line.product"
      :product="line.product"
      :pricing="pricing"
      :now="now"
      :initial-selection="initial"
      :cart-mode="split ? 'split' : 'options'"
      :action-label="split ? 'Save split' : 'Save changes'"
      :disabled="disabled"
      @confirm="$emit('save', $event)"
    />
    <Button
      label="Cancel edit"
      severity="secondary"
      variant="text"
      class="self-start"
      @click="$emit('cancel')"
    />
  </section>
</template>
