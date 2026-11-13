<script setup lang="ts">
import { computed, useId } from 'vue'
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import type { Product, ProductSelection } from '@/types/catalog'
import { useProductSelection } from '@/composables/catalog/useProductSelection'
import { selectionEstimate, type CatalogPricing } from '@/utils/catalog/pricing'
import { formatCurrency } from '@/lib/currency'
import { plainDescription, normalizeSpecification } from '@/utils/catalog/search'
const props = defineProps<{
  product: Product
  pricing: CatalogPricing
  now: number
  initialSelection?: ProductSelection
  cartMode?: 'options' | 'split'
  actionLabel?: string
  disabled?: boolean
}>()
const emit = defineEmits<{ confirm: [selection: ProductSelection] }>()
const formId = useId()
const {
  gradeId,
  unitId,
  processingId,
  quantity,
  ripeness,
  size,
  washed,
  grades,
  grade,
  units,
  unit,
  processing,
  rules,
  ripenessOptions,
  sizeOptions,
  washedOptions,
  quantityValid,
  available,
  selection,
  processingCost,
} = useProductSelection(() => props.product)
if (props.initialSelection) {
  const initial = props.initialSelection
  gradeId.value =
    props.product.variations.find((grade) =>
      grade.unit_variants.some((unit) => unit.id === initial.productUnitVariantId),
    )?.id ?? null
  unitId.value = initial.productUnitVariantId
  processingId.value = initial.processingTypeId
  quantity.value = initial.quantity
  ripeness.value =
    ripenessOptions.value.find((value) => normalizeSpecification(value) === initial.ripeness) ??
    initial.ripeness
  size.value =
    sizeOptions.value.find((value) => normalizeSpecification(value) === initial.size) ??
    initial.size
  washed.value =
    washedOptions.value.find((value) => normalizeSpecification(value) === initial.washed) ??
    initial.washed
}
function specificationChoices(options: string[]) {
  return [
    { label: 'No preference', value: null },
    ...options.map((value) => ({ label: value, value })),
  ]
}
const ripenessChoices = computed(() => specificationChoices(ripenessOptions.value))
const sizeChoices = computed(() => specificationChoices(sizeOptions.value))
const washedChoices = computed(() => specificationChoices(washedOptions.value))
const gradeOptions = computed(() =>
  grades.value.map((grade) => ({
    id: grade.id,
    name: `${grade.grade?.name ?? 'Default'}${grade.status === 'back_in_stock_soon' ? ' — back in stock soon' : ''}`,
  })),
)
const unitOptions = computed(() =>
  units.value.map((unit) => ({ id: unit.id, name: unit.unit?.name })),
)
const processingOptions = computed(() => [
  { id: null, name: 'No processing' },
  ...processing.value.map((item) => ({
    id: item.processing_type_id,
    name: `${item.processing_type?.name} (+${formatCurrency(item.processing_cost)} per unit)`,
  })),
])
const description = computed(() =>
  plainDescription(grade.value?.description || grade.value?.short_description),
)
const estimate = computed(() =>
  unit.value && quantityValid.value && quantity.value !== null
    ? selectionEstimate(unit.value, props.pricing, props.now, quantity.value, processingCost.value)
    : null,
)
</script>
<template>
  <div class="flex flex-col gap-4">
    <p v-if="description && !cartMode" class="whitespace-pre-line">{{ description }}</p>
    <div class="grid gap-4 sm:grid-cols-2">
      <div v-if="!cartMode" class="flex min-w-0 flex-col gap-2">
        <label :id="`${formId}-grade-label`" :for="`${formId}-grade`">Grade</label>
        <Select
          :inputId="`${formId}-grade`"
          :ariaLabelledby="`${formId}-grade-label`"
          v-model="gradeId"
          :options="gradeOptions"
          optionLabel="name"
          optionValue="id"
          :disabled="!grades.length || disabled"
        />
      </div>
      <div v-if="!cartMode" class="flex min-w-0 flex-col gap-2">
        <label :id="`${formId}-product-unit-label`" :for="`${formId}-unit`">Unit</label>
        <Select
          :inputId="`${formId}-unit`"
          :ariaLabelledby="`${formId}-product-unit-label`"
          v-model="unitId"
          :options="unitOptions"
          optionLabel="name"
          optionValue="id"
          :disabled="!units.length || disabled"
        />
      </div>
      <div v-if="processing.length || processingId !== null" class="flex min-w-0 flex-col gap-2">
        <label :id="`${formId}-processing-label`" :for="`${formId}-processing`">Processing</label>
        <Select
          :inputId="`${formId}-processing`"
          :ariaLabelledby="`${formId}-processing-label`"
          v-model="processingId"
          :options="processingOptions"
          optionLabel="name"
          optionValue="id"
          :disabled="!available || disabled"
        />
      </div>
      <div v-if="ripenessOptions.length || ripeness" class="flex min-w-0 flex-col gap-2">
        <label :id="`${formId}-ripeness-label`" :for="`${formId}-ripeness`"
          >Ripeness (optional)</label
        >
        <Select
          :inputId="`${formId}-ripeness`"
          :ariaLabelledby="`${formId}-ripeness-label`"
          v-model="ripeness"
          :options="ripenessChoices"
          optionLabel="label"
          optionValue="value"
          :disabled="!available || disabled"
        />
      </div>
      <div v-if="sizeOptions.length || size" class="flex min-w-0 flex-col gap-2">
        <label :id="`${formId}-size-label`" :for="`${formId}-size`">Size (optional)</label>
        <Select
          :inputId="`${formId}-size`"
          :ariaLabelledby="`${formId}-size-label`"
          v-model="size"
          :options="sizeChoices"
          optionLabel="label"
          optionValue="value"
          :disabled="!available || disabled"
        />
      </div>
      <div v-if="washedOptions.length || washed" class="flex min-w-0 flex-col gap-2">
        <label :id="`${formId}-washed-label`" :for="`${formId}-washed`">Washing (optional)</label>
        <Select
          :inputId="`${formId}-washed`"
          :ariaLabelledby="`${formId}-washed-label`"
          v-model="washed"
          :options="washedChoices"
          optionLabel="label"
          optionValue="value"
          :disabled="!available || disabled"
        />
      </div>
      <div v-if="cartMode !== 'options'" class="flex min-w-0 flex-col gap-2">
        <label :for="`${formId}-quantity`">Quantity</label>
        <InputNumber
          :inputId="`${formId}-quantity`"
          v-model="quantity"
          :min="rules.min"
          :step="rules.step"
          :maxFractionDigits="rules.maxFractionDigits"
          :useGrouping="false"
          :disabled="!available || disabled"
          :aria-describedby="`${formId}-quantity-help`"
        />
        <p :id="`${formId}-quantity-help`" class="text-sm text-muted-color">
          Minimum {{ rules.min }} {{ unit?.unit?.name }}.
          {{ rules.maxFractionDigits ? 'Up to two decimal places.' : 'Whole units only.' }}
        </p>
      </div>
    </div>
    <Message v-if="!available" severity="warn">{{
      grade?.status === 'back_in_stock_soon'
        ? 'This grade will be back in stock soon.'
        : 'This configuration is currently unavailable.'
    }}</Message>
    <Message v-else-if="!quantityValid" severity="warn"
      >Enter a valid quantity at or above the minimum.</Message
    >
    <div
      v-if="!cartMode && available && selection && estimate"
      aria-live="polite"
      class="flex flex-col gap-2 rounded-border border border-surface p-4"
    >
      <h2 class="text-lg font-semibold">Product estimate</h2>
      <p v-if="estimate.saleQuantity && estimate.saleUnitPrice !== null">
        Sale: {{ estimate.saleQuantity }} × {{ formatCurrency(estimate.saleUnitPrice) }}
      </p>
      <p v-if="estimate.regularQuantity">
        Regular: {{ estimate.regularQuantity }} × {{ formatCurrency(estimate.regularUnitPrice) }}
      </p>
      <p class="font-semibold">Estimated product total: {{ formatCurrency(estimate.total) }}</p>
      <p class="text-sm text-muted-color">
        Includes VAT where applicable. Excludes delivery. Final pricing is confirmed when ordering.
      </p>
    </div>
    <Message v-else-if="available && quantityValid && !estimate" severity="warn"
      >Pricing is currently unavailable for this unit.</Message
    >
    <Button
      v-if="actionLabel"
      :label="actionLabel"
      class="w-full"
      :disabled="disabled || !selection || !estimate"
      @click="selection && emit('confirm', selection)"
    />
  </div>
</template>
