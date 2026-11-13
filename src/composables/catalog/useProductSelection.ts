import { computed, shallowRef, watch } from 'vue'
import type { Product, ProductSelection } from '@/types/catalog'
import { quantityRules, isValidQuantity } from '@/utils/catalog/quantity'
import { specificationOptions } from '@/utils/catalog/search'

export function useProductSelection(product: () => Product) {
  const gradeId = shallowRef<number | null>(null)
  const unitId = shallowRef<number | null>(null)
  const processingId = shallowRef<number | null>(null)
  const quantity = shallowRef<number | null>(null)
  const ripeness = shallowRef<string | null>(null)
  const size = shallowRef<string | null>(null)
  const washed = shallowRef<string | null>(null)
  const grades = computed(() =>
    product().variations.filter((grade) => ['active', 'back_in_stock_soon'].includes(grade.status)),
  )
  const grade = computed(() => grades.value.find((item) => item.id === gradeId.value))
  const units = computed(
    () => grade.value?.unit_variants.filter((unit) => unit.status === 'active' && unit.unit) ?? [],
  )
  const unit = computed(() => units.value.find((item) => item.id === unitId.value))
  const processing = computed(
    () => unit.value?.processing_variants.filter((option) => option.processing_type) ?? [],
  )
  const rules = computed(() =>
    quantityRules(unit.value?.unit?.name, unit.value?.minimum_order_quantity),
  )
  const ripenessOptions = computed(() => specificationOptions(product().ripeness))
  const sizeOptions = computed(() => specificationOptions(product().sizes))
  const washedOptions = computed(() => specificationOptions(product().washed))
  watch(
    grades,
    (items) => {
      if (!items.some((item) => item.id === gradeId.value))
        gradeId.value =
          (
            items.find((item) => item.is_default && item.status === 'active') ??
            items.find((item) => item.status === 'active') ??
            items[0]
          )?.id ?? null
    },
    { immediate: true, flush: 'sync' },
  )
  watch(
    units,
    (items) => {
      if (!items.some((item) => item.id === unitId.value))
        unitId.value = (items.find((item) => item.is_default) ?? items[0])?.id ?? null
    },
    { immediate: true, flush: 'sync' },
  )
  watch(
    unit,
    () => {
      quantity.value = rules.value.min
      processingId.value = null
    },
    { immediate: true, flush: 'sync' },
  )
  const quantityValid = computed(() => isValidQuantity(quantity.value, rules.value))
  const available = computed(
    () =>
      product().published &&
      product().status === 'active' &&
      grade.value?.status === 'active' &&
      Boolean(unit.value),
  )
  const selection = computed<ProductSelection | null>(() => {
    if (!available.value || !unit.value || !quantityValid.value || quantity.value === null)
      return null
    if (
      processingId.value !== null &&
      !processing.value.some((item) => item.processing_type_id === processingId.value)
    )
      return null
    if (
      [
        { value: ripeness.value, options: ripenessOptions.value },
        { value: size.value, options: sizeOptions.value },
        { value: washed.value, options: washedOptions.value },
      ].some(({ value, options }) => value !== null && !options.includes(value))
    )
      return null
    return {
      productId: product().id,
      productUnitVariantId: unit.value.id,
      processingTypeId: processingId.value,
      quantity: quantity.value,
      ripeness: ripeness.value,
      size: size.value,
      washed: washed.value,
    }
  })
  const processingCost = computed(
    () =>
      processing.value.find((item) => item.processing_type_id === processingId.value)
        ?.processing_cost ?? 0,
  )
  return {
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
  }
}
