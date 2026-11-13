<script setup lang="ts">
import { computed } from 'vue'
import type { CartLine } from '@/types/cart'
import { formatCurrency } from '@/lib/currency'
const props = defineProps<{
  line: CartLine
  linked?: boolean
  hideTotal?: boolean
  hideQuantity?: boolean
}>()
const unitPrice = computed(() => {
  if (!props.line.portions.length) return null
  const prices = props.line.portions.map((portion) => portion.unitPrice)
  return { min: Math.min(...prices), max: Math.max(...prices) }
})
const processing = computed(
  () =>
    props.line.unit?.processing_variants.find(
      (item) => item.processing_type_id === props.line.selection.processingTypeId,
    )?.processing_type?.name,
)
const specifications = computed(() =>
  [
    processing.value,
    props.line.selection.ripeness,
    props.line.selection.size,
    props.line.selection.washed,
  ]
    .filter(Boolean)
    .join(', '),
)
</script>
<template>
  <div
    class="grid min-w-0 items-start gap-x-4 gap-y-1"
    :class="hideTotal ? 'grid-cols-1' : 'grid-cols-[minmax(0,1fr)_auto]'"
  >
    <div class="min-w-0">
      <p class="font-semibold [overflow-wrap:anywhere]">
        <RouterLink
          v-if="linked"
          :to="{ name: 'product', params: { productId: line.selection.productId } }"
          class="hover:underline"
          >{{ line.product?.name ?? `Product ${line.selection.productId}` }}</RouterLink
        ><template v-else>{{
          line.product?.name ?? `Product ${line.selection.productId}`
        }}</template
        ><template v-if="line.grade?.grade?.name"> · {{ line.grade.grade.name }}</template>
      </p>
      <p v-if="!line.issue && unitPrice" class="text-sm text-muted-color tabular-nums">
        <span class="sr-only">Price per unit: </span>{{ formatCurrency(unitPrice.min)
        }}<template v-if="unitPrice.max !== unitPrice.min"
          >–{{ formatCurrency(unitPrice.max) }}</template
        >
        / {{ line.unit?.unit?.name ?? 'unit' }}
      </p>
      <p v-if="!hideQuantity">
        {{ line.selection.quantity }}
        {{ line.unit?.unit?.name ?? 'units' }}
      </p>
      <p v-if="specifications" class="text-sm text-muted-color">{{ specifications }}</p>
    </div>
    <p v-if="!line.issue && !hideTotal" class="whitespace-nowrap font-semibold tabular-nums">
      <span class="sr-only">Item estimate: </span>{{ formatCurrency(line.total) }}
    </p>
  </div>
</template>
