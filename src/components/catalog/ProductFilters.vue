<script setup lang="ts">
import { shallowRef, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import Button from 'primevue/button'
import Drawer from 'primevue/drawer'
import Filter from '@primeicons/vue/filter'
import type { Category } from '@/types/catalog'
import { useDrawerFocus } from '@/composables/shared/useDrawerFocus'
import ProductFilterFields from './ProductFilterFields.vue'
defineProps<{
  categories: Category[]
  grades: { id: number; name: string }[]
  categoryId: number | null
  gradeId: number | null
}>()
defineEmits<{
  category: [id: number | null]
  grade: [id: number | null]
  reset: []
}>()
const { rememberTrigger, restoreFocus } = useDrawerFocus()
const desktop = useMediaQuery('(min-width: 1024px)')
const open = shallowRef(false)
watch(desktop, () => {
  if (open.value) {
    open.value = false
    restoreFocus()
  }
})
function showFilters(event: Event) {
  rememberTrigger(event)
  open.value = true
}
</script>
<template>
  <section
    v-if="desktop"
    aria-label="Product filters"
    class="flex min-w-0 flex-wrap items-center gap-4"
  >
    <ProductFilterFields
      v-bind="$props"
      @category="$emit('category', $event)"
      @grade="$emit('grade', $event)"
    />
    <Button
      label="Clear filters"
      severity="secondary"
      variant="text"
      size="small"
      @click="$emit('reset')"
    />
    <div class="ml-auto"><slot name="sort" /></div>
  </section>
  <div v-else class="flex min-w-0 items-center justify-between gap-3">
    <Button
      label="Filter products"
      severity="secondary"
      variant="outlined"
      aria-controls="product-filters"
      :aria-expanded="open"
      @click="showFilters"
      ><Filter aria-hidden="true" />Filters</Button
    >
    <slot name="sort" />
    <Drawer
      id="product-filters"
      v-model:visible="open"
      @after-hide="restoreFocus"
      header="Filter products"
      aria-label="Product filters"
      class="w-full sm:w-80"
      blockScroll
    >
      <div class="flex justify-end pb-4">
        <Button
          label="Clear filters"
          severity="secondary"
          variant="text"
          size="small"
          @click="$emit('reset')"
        />
      </div>
      <ProductFilterFields
        v-bind="$props"
        @category="$emit('category', $event)"
        @grade="$emit('grade', $event)"
      />
      <Button label="Show products" class="mt-6 w-full" @click="open = false" />
    </Drawer>
  </div>
</template>
