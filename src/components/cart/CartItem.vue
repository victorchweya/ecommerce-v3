<script setup lang="ts">
import { computed, shallowRef, useId } from 'vue'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import Trash from '@primeicons/vue/trash'
import Message from 'primevue/message'
import CartLineSummary from './CartLineSummary.vue'
import ProductImage from '@/components/catalog/ProductImage.vue'
import { productImage, specificationOptions } from '@/utils/catalog/search'
import type { CartLine } from '@/types/cart'
import { formatCurrency } from '@/lib/currency'
import { quantityRules } from '@/utils/catalog/quantity'
const props = defineProps<{
  line: CartLine
  disabled: boolean
  editing: boolean
  revision: number
  scopeKey: string
  quantityReset: number
  compact?: boolean
}>()
const emit = defineEmits<{
  edit: []
  split: []
  remove: []
  quantity: [value: number | null, context: { scope: string; revision: number }]
}>()
const id = useId()
const quantityContext = shallowRef({ scope: props.scopeKey, revision: props.revision })
const rules = computed(() =>
  quantityRules(props.line.unit?.unit?.name, props.line.unit?.minimum_order_quantity),
)
const hasOptions = computed(() =>
  Boolean(
    props.line.unit?.processing_variants.some((option) => option.processing_type) ||
    [props.line.product?.ripeness, props.line.product?.sizes, props.line.product?.washed].some(
      (value) => specificationOptions(value).length,
    ) ||
    props.line.selection.processingTypeId !== null ||
    props.line.selection.ripeness ||
    props.line.selection.size ||
    props.line.selection.washed,
  ),
)
const editable = computed(
  () =>
    props.line.product?.published &&
    props.line.product.status === 'active' &&
    props.line.product.variations.some(
      (grade) =>
        grade.status === 'active' &&
        grade.unit_variants.some(
          (unit) =>
            unit.status === 'active' && unit.id === props.line.selection.productUnitVariantId,
        ),
    ),
)
</script>
<template>
  <article
    :aria-label="line.product?.name ?? `Product ${line.selection.productId}`"
    class="@container flex flex-col gap-3 border-b border-surface py-4"
  >
    <div
      class="grid items-center gap-x-4 gap-y-3"
      :class="
        compact
          ? 'relative grid-cols-[minmax(0,1fr)_auto]'
          : 'grid-cols-[minmax(0,1fr)_auto] @xl:grid-cols-[minmax(0,1fr)_7rem_8rem_5rem]'
      "
    >
      <div
        class="col-start-1 row-start-1 flex min-w-0 items-start gap-3"
        :class="{ 'col-span-2 pr-10': compact }"
      >
        <div v-if="line.product && productImage(line.product)" class="w-12 shrink-0">
          <ProductImage
            :src="line.product ? productImage(line.product) : null"
            :name="line.product?.name ?? 'Product'"
          />
        </div>
        <div class="flex min-w-0 flex-1 flex-col items-start gap-1">
          <CartLineSummary :line="line" linked hideTotal hideQuantity class="w-full" />
          <div v-if="hasOptions && !compact" class="flex flex-wrap items-center gap-1">
            <Button
              label="Edit options"
              severity="secondary"
              variant="text"
              size="small"
              :disabled="disabled || !editable || editing"
              @click="$emit('edit')"
            />
            <Button
              label="Split item"
              severity="secondary"
              variant="text"
              size="small"
              :disabled="disabled || Boolean(line.issue) || editing"
              @click="$emit('split')"
            />
          </div>
        </div>
      </div>
      <div
        class="col-start-1 row-start-2 flex min-w-0 items-center gap-2"
        :class="{ '@xl:col-start-2 @xl:row-start-1': !compact }"
      >
        <label :for="`${id}-quantity`" class="sr-only"
          >Quantity for {{ line.product?.name ?? `Product ${line.selection.productId}` }}</label
        >
        <InputNumber
          :key="`${scopeKey}:${quantityReset}`"
          :inputId="`${id}-quantity`"
          name="quantity"
          :modelValue="line.selection.quantity"
          :step="rules.step"
          :maxFractionDigits="rules.maxFractionDigits"
          :useGrouping="false"
          :disabled="disabled || !editable || editing"
          class="w-20"
          inputClass="w-full text-center"
          :aria-describedby="`${id}-quantity-help`"
          @focus="quantityContext = { scope: scopeKey, revision }"
          @update:model-value="emit('quantity', $event, quantityContext)"
        />
        <span class="text-muted-color">{{ line.unit?.unit?.name ?? 'units' }}</span>
        <p :id="`${id}-quantity-help`" class="sr-only">
          Minimum {{ rules.min }}.
          {{ rules.maxFractionDigits ? 'Up to two decimal places.' : 'Whole units only.' }} Changes
          save when you leave the field or press Enter.
        </p>
      </div>
      <p
        v-if="!line.issue"
        class="col-start-2 text-right font-semibold tabular-nums"
        :class="compact ? 'row-start-2' : 'row-start-1 @xl:col-start-3'"
      >
        <span class="sr-only">Item estimate: </span>{{ formatCurrency(line.total) }}
      </p>
      <div
        class="flex items-center justify-end"
        :class="
          compact
            ? 'absolute top-0 right-0'
            : 'col-start-2 row-start-2 @xl:col-start-4 @xl:row-start-1'
        "
      >
        <Button
          aria-label="Remove item"
          title="Remove item"
          severity="secondary"
          variant="text"
          class="min-h-10 min-w-10"
          :disabled="disabled"
          @click="$emit('remove')"
          ><Trash aria-hidden="true"
        /></Button>
      </div>
    </div>
    <Message v-if="line.issue" severity="warn">{{ line.issue }}</Message>
    <slot />
  </article>
</template>
